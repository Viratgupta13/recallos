import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthedRequest } from '../auth.js';
import { riskFor } from '../lib/scheduler.js';

export const forgettingRouter = Router();
forgettingRouter.use(requireAuth);

// Ranks every topic by forgetting risk (derived from memory strength + overdue).
forgettingRouter.get('/', async (req: AuthedRequest, res) => {
  const states = await prisma.memoryState.findMany({
    where: { userId: req.userId },
    include: { topic: true },
  });

  const now = new Date();
  const assessments = states.map((s) => {
    const { riskScore, riskLevel, recommendedAction } = riskFor(s.memoryStrength, s.nextReview, now);
    return {
      topicId: s.topicId,
      topicName: s.topic.name,
      topicCategory: s.topic.category,
      riskLevel,
      riskScore,
      memoryStrength: s.memoryStrength,
      lastReviewed: new Date(s.lastReviewed).toISOString(),
      recallScore: s.confidence,
      recommendedAction,
    };
  });

  assessments.sort((a, b) => b.riskScore - a.riskScore);
  const withPriority = assessments.map((a, i) => ({ ...a, priority: i + 1 }));
  res.json(withPriority);
});
