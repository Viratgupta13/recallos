import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthedRequest } from '../auth.js';
import { toSession, toTopic, toQuestion } from '../lib/serialize.js';
import { riskFor } from '../lib/scheduler.js';

export const revisionRouter = Router();
revisionRouter.use(requireAuth);

const MAX_SESSION_QUESTIONS = 5;

async function dueTopicSummaries(userId: string) {
  const now = new Date();
  const states = await prisma.memoryState.findMany({ where: { userId }, include: { topic: true } });
  const counts = await prisma.question.groupBy({
    by: ['topicId'],
    where: { topic: { userId } },
    _count: { _all: true },
  });
  const countFor = (topicId: string) => counts.find((c) => c.topicId === topicId)?._count._all ?? 0;

  const enriched = states.map((s) => {
    const risk = riskFor(s.memoryStrength, s.nextReview, now);
    return {
      id: s.topicId,
      name: s.topic.name,
      category: s.topic.category,
      memoryStrength: s.memoryStrength,
      riskLevel: risk.riskLevel,
      riskScore: risk.riskScore,
      questionCount: countFor(s.topicId),
      due: new Date(s.nextReview).getTime() <= now.getTime(),
    };
  });
  enriched.sort((a, b) => b.riskScore - a.riskScore);
  return enriched;
}

revisionRouter.get('/today', async (req: AuthedRequest, res) => {
  const all = await dueTopicSummaries(req.userId!);
  // Only genuinely due topics (nextReview has arrived). When nothing is due we
  // return an empty plan — reviewed topics are scheduled for a future date and
  // should NOT reappear today. No "show everything" fallback.
  const dueTopics = all.filter((t) => t.due && t.questionCount > 0).slice(0, 3);
  const dueIds = new Set(dueTopics.map((t) => t.id));
  const atRiskTopics = all
    .filter((t) => t.riskLevel === 'high' && !dueIds.has(t.id) && t.questionCount > 0)
    .slice(0, 2);

  const questionCount = Math.min(
    MAX_SESSION_QUESTIONS,
    dueTopics.reduce((sum, t) => sum + t.questionCount, 0)
  );
  const strip = (t: any) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    memoryStrength: t.memoryStrength,
    riskLevel: t.riskLevel,
    questionCount: t.questionCount,
  });

  res.json({
    topicCount: dueTopics.length,
    questionCount,
    estimatedMinutes: Math.max(1, Math.round(questionCount * 0.8)),
    dueTopics: dueTopics.map(strip),
    atRiskTopics: atRiskTopics.map(strip),
  });
});

revisionRouter.get('/history', async (req: AuthedRequest, res) => {
  const sessions = await prisma.revisionSession.findMany({
    where: { userId: req.userId, completedAt: { not: null } },
    orderBy: { startedAt: 'desc' },
  });
  res.json(sessions.map(toSession));
});

// Build a fresh session from the highest-risk due topics and their questions.
revisionRouter.post('/session', async (req: AuthedRequest, res) => {
  const all = await dueTopicSummaries(req.userId!);
  const picked = all.filter((t) => t.due && t.questionCount > 0).slice(0, 3);
  if (picked.length === 0) {
    return res.status(400).json({ message: 'Nothing is due for revision right now. Come back on your next scheduled review.' });
  }

  const topicIds = picked.map((t) => t.id);
  const questions = await prisma.question.findMany({
    where: { topicId: { in: topicIds } },
    orderBy: { topicId: 'asc' },
  });
  const questionIds = questions.slice(0, MAX_SESSION_QUESTIONS).map((q) => q.id);

  const session = await prisma.revisionSession.create({
    data: {
      userId: req.userId!,
      topicIds: JSON.stringify(topicIds),
      questionIds: JSON.stringify(questionIds),
      averageRecall: 0,
      questionsCompleted: 0,
    },
  });
  res.status(201).json(toSession(session));
});

revisionRouter.get('/session/:id/questions', async (req: AuthedRequest, res) => {
  const session = await prisma.revisionSession.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!session) return res.status(404).json({ message: 'Session not found' });
  const questionIds: string[] = JSON.parse(session.questionIds || '[]');

  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } }, include: { topic: true } });
  const byId = new Map(questions.map((q) => [q.id, q]));

  const ordered = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => ({ question: toQuestion(q), topic: toTopic(q.topic) }));

  res.json(ordered);
});
