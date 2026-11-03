import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthedRequest } from '../auth.js';
import { toQuestion } from '../lib/serialize.js';

export const questionsRouter = Router();
questionsRouter.use(requireAuth);

// Questions are scoped to the user's topics. Supports ?topicId= filtering.
questionsRouter.get('/', async (req: AuthedRequest, res) => {
  const topicId = req.query.topicId ? String(req.query.topicId) : undefined;
  const userTopics = await prisma.topic.findMany({ where: { userId: req.userId }, select: { id: true } });
  const topicIds = userTopics.map((t) => t.id);
  const questions = await prisma.question.findMany({
    where: { topicId: topicId ? topicId : { in: topicIds } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(questions.map(toQuestion));
});

questionsRouter.get('/:id', async (req: AuthedRequest, res) => {
  const q = await prisma.question.findUnique({ where: { id: req.params.id } });
  if (!q) return res.status(404).json({ message: 'Question not found' });
  res.json(toQuestion(q));
});
