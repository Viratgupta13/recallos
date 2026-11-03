import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthedRequest } from '../auth.js';
import { riskFor } from '../lib/scheduler.js';

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

const DAY_MS = 24 * 60 * 60 * 1000;
const ymd = (d: Date) => d.toISOString().slice(0, 10);

analyticsRouter.get('/overview', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const now = new Date();

  const [states, materialsCount, sessions] = await Promise.all([
    prisma.memoryState.findMany({ where: { userId }, include: { topic: true } }),
    prisma.learningMaterial.count({ where: { userId } }),
    prisma.revisionSession.findMany({ where: { userId }, include: { attempts: true }, orderBy: { startedAt: 'desc' } }),
  ]);

  const totalTopics = states.length;
  const knowledgeHealth = totalTopics
    ? Math.round(states.reduce((s, m) => s + m.memoryStrength, 0) / totalTopics)
    : 0;
  const dueToday = states.filter((m) => new Date(m.nextReview).getTime() <= now.getTime()).length;

  // Average recall over the last 7 completed sessions.
  const recentSessions = sessions.filter((s) => s.completedAt).slice(0, 7);
  const averageRecall = recentSessions.length
    ? Math.round(recentSessions.reduce((s, x) => s + x.averageRecall, 0) / recentSessions.length)
    : 0;

  // Strong / weak areas by memory strength, with thresholds so a topic is never
  // in both lists and a decent score is not mislabeled "weak". Strong >= 75,
  // needs-attention < 55; the 55-74 middle shows in neither.
  const strongAreas = [...states]
    .filter((m) => m.memoryStrength >= 75)
    .sort((a, b) => b.memoryStrength - a.memoryStrength)
    .slice(0, 5)
    .map((m) => m.topic.name);
  const weakAreas = [...states]
    .filter((m) => m.memoryStrength < 55)
    .sort((a, b) => a.memoryStrength - b.memoryStrength)
    .slice(0, 5)
    .map((m) => m.topic.name);

  // Category performance.
  const catMap = new Map<string, { count: number; recall: number; strength: number }>();
  for (const m of states) {
    const c = m.topic.category;
    const e = catMap.get(c) ?? { count: 0, recall: 0, strength: 0 };
    e.count += 1;
    e.recall += m.confidence;
    e.strength += m.memoryStrength;
    catMap.set(c, e);
  }
  const categoryPerformance = [...catMap.entries()]
    .map(([category, v]) => ({
      category,
      topicCount: v.count,
      averageRecall: Math.round(v.recall / v.count),
      averageMemoryStrength: Math.round(v.strength / v.count),
    }))
    .sort((a, b) => b.averageMemoryStrength - a.averageMemoryStrength);

  // Recall trend: last 8 days from attempts.
  const attempts = await prisma.recallAttempt.findMany({
    where: { session: { userId } },
    orderBy: { createdAt: 'asc' },
  });
  const trendMap = new Map<string, { total: number; count: number }>();
  for (const a of attempts) {
    const key = ymd(new Date(a.createdAt));
    const e = trendMap.get(key) ?? { total: 0, count: 0 };
    e.total += a.recallScore;
    e.count += 1;
    trendMap.set(key, e);
  }
  const recallTrend: { date: string; recall: number; questionsAnswered: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const key = ymd(new Date(now.getTime() - i * DAY_MS));
    const e = trendMap.get(key);
    recallTrend.push({
      date: key,
      recall: e ? Math.round(e.total / e.count) : 0,
      questionsAnswered: e ? e.count : 0,
    });
  }

  // Streak: consecutive days (ending today or yesterday) with a completed session.
  const sessionDays = new Set(sessions.filter((s) => s.completedAt).map((s) => ymd(new Date(s.completedAt!))));
  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const key = ymd(new Date(now.getTime() - i * DAY_MS));
    if (sessionDays.has(key)) currentStreak += 1;
    else if (i > 0) break; // allow today to be empty without breaking the streak
  }

  res.json({
    knowledgeHealth,
    dueToday,
    averageRecall,
    currentStreak,
    totalTopics,
    totalMaterials: materialsCount,
    strongAreas,
    weakAreas,
    categoryPerformance,
    recallTrend,
  });
});
