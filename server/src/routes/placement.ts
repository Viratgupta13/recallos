import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';
import { toPlacementTest, toInterviewQuestion } from '../lib/serialize.js';

export const placementRouter = Router();
export const interviewRouter = Router();

placementRouter.use(requireAuth);
interviewRouter.use(requireAuth);

placementRouter.get('/tests', async (_req, res) => {
  const tests = await prisma.placementTest.findMany({ orderBy: { order: 'asc' } });
  res.json(tests.map(toPlacementTest));
});

placementRouter.get('/tests/:id', async (req, res) => {
  const t = await prisma.placementTest.findUnique({ where: { id: req.params.id } });
  if (!t) return res.status(404).json({ message: 'Test not found' });
  res.json(toPlacementTest(t));
});

interviewRouter.get('/questions', async (_req, res) => {
  const questions = await prisma.interviewQuestion.findMany({ orderBy: { order: 'asc' } });
  res.json(questions.map(toInterviewQuestion));
});
