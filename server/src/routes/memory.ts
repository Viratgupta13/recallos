import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthedRequest } from '../auth.js';
import { toMemory } from '../lib/serialize.js';

export const memoryRouter = Router();
memoryRouter.use(requireAuth);

memoryRouter.get('/', async (req: AuthedRequest, res) => {
  const states = await prisma.memoryState.findMany({
    where: { userId: req.userId },
    include: { topic: true },
    orderBy: { memoryStrength: 'asc' },
  });
  res.json(states.map(toMemory));
});

memoryRouter.get('/:topicId', async (req: AuthedRequest, res) => {
  const state = await prisma.memoryState.findFirst({
    where: { userId: req.userId, topicId: req.params.topicId },
    include: { topic: true },
  });
  if (!state) return res.status(404).json({ message: 'Memory state not found' });
  res.json(toMemory(state));
});
