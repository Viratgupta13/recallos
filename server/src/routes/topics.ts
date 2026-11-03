import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthedRequest } from '../auth.js';
import { toTopic } from '../lib/serialize.js';

export const topicsRouter = Router();
topicsRouter.use(requireAuth);

topicsRouter.get('/', async (req: AuthedRequest, res) => {
  const topics = await prisma.topic.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } });
  res.json(topics.map(toTopic));
});

topicsRouter.get('/:id', async (req: AuthedRequest, res) => {
  const t = await prisma.topic.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!t) return res.status(404).json({ message: 'Topic not found' });
  res.json(toTopic(t));
});
