import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthedRequest } from '../auth.js';
import { toAttempt } from '../lib/serialize.js';
import { gradeWithGemini } from '../lib/gradeAI.js';
import { applyReview } from '../lib/scheduler.js';

export const recallRouter = Router();
recallRouter.use(requireAuth);

// Grade a typed answer, store the attempt, and update the topic's memory state
// via the spaced-repetition scheduler. Keeps the session's running average.
recallRouter.post('/attempt', async (req: AuthedRequest, res) => {
  const { sessionId, questionId, topicId, userAnswer } = req.body ?? {};
  if (!questionId || userAnswer === undefined)
    return res.status(400).json({ message: 'questionId and userAnswer are required' });

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) return res.status(404).json({ message: 'Question not found' });

  const resolvedTopicId = topicId || question.topicId;
  const concepts: string[] = JSON.parse(question.concepts || '[]');
  // Hybrid grading: Gemini judges by meaning; falls back to the deterministic
  // keyword grader when no API key is set or the call fails.
  const grade = await gradeWithGemini({
    questionText: question.questionText,
    expectedAnswer: question.expectedAnswer,
    userAnswer: String(userAnswer),
    concepts,
  });

  const attempt = await prisma.recallAttempt.create({
    data: {
      sessionId: sessionId || null,
      questionId,
      topicId: resolvedTopicId,
      userAnswer: String(userAnswer),
      recallScore: grade.recallScore,
      rememberedConcepts: JSON.stringify(grade.rememberedConcepts),
      missingConcepts: JSON.stringify(grade.missingConcepts),
      feedback: grade.feedback,
    },
  });

  // Update spaced-repetition memory for this topic.
  const mem = await prisma.memoryState.findFirst({ where: { userId: req.userId, topicId: resolvedTopicId } });
  if (mem) {
    const upd = applyReview(mem, grade.recallScore);
    await prisma.memoryState.update({ where: { id: mem.id }, data: upd });
  } else {
    const upd = applyReview(
      { memoryStrength: 50, confidence: 50, reviewCount: 0, easeFactor: 2.5, intervalDays: 0, lastReviewed: new Date() },
      grade.recallScore
    );
    await prisma.memoryState.create({
      data: { userId: req.userId!, topicId: resolvedTopicId, difficulty: question.difficulty, ...upd },
    });
  }

  // Maintain the session's running average + completion count.
  if (sessionId) {
    const session = await prisma.revisionSession.findFirst({ where: { id: sessionId, userId: req.userId } });
    if (session) {
      const attempts = await prisma.recallAttempt.findMany({ where: { sessionId } });
      const avg = Math.round(attempts.reduce((s, a) => s + a.recallScore, 0) / attempts.length);
      const questionIds: string[] = JSON.parse(session.questionIds || '[]');
      const completed = attempts.length >= questionIds.length && questionIds.length > 0;
      await prisma.revisionSession.update({
        where: { id: sessionId },
        data: {
          averageRecall: avg,
          questionsCompleted: attempts.length,
          ...(completed && !session.completedAt
            ? {
                completedAt: new Date(),
                durationMinutes: Math.max(1, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000)),
              }
            : {}),
        },
      });
    }
  }

  res.status(201).json(toAttempt(attempt));
});

recallRouter.get('/:id', async (req: AuthedRequest, res) => {
  const attempt = await prisma.recallAttempt.findUnique({ where: { id: req.params.id } });
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  res.json(toAttempt(attempt));
});
