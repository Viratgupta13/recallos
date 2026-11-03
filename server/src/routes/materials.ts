import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, type AuthedRequest } from '../auth.js';
import { toMaterial, toJson } from '../lib/serialize.js';
import { generateFromMaterial } from '../lib/extract.js';

export const materialsRouter = Router();
materialsRouter.use(requireAuth);

materialsRouter.get('/', async (req: AuthedRequest, res) => {
  const materials = await prisma.learningMaterial.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(materials.map(toMaterial));
});

materialsRouter.get('/:id', async (req: AuthedRequest, res) => {
  const m = await prisma.learningMaterial.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!m) return res.status(404).json({ message: 'Material not found' });
  res.json(toMaterial(m));
});

materialsRouter.post('/', async (req: AuthedRequest, res) => {
  const { title, content, category } = req.body ?? {};
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
  const wordCount = String(content).trim().split(/\s+/).filter(Boolean).length;
  const m = await prisma.learningMaterial.create({
    data: {
      userId: req.userId!,
      title,
      content,
      category: category || 'Uncategorized',
      wordCount,
      topicCount: 0,
      extractionStatus: 'pending',
    },
  });
  res.status(201).json(toMaterial(m));
});

materialsRouter.put('/:id', async (req: AuthedRequest, res) => {
  const existing = await prisma.learningMaterial.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) return res.status(404).json({ message: 'Material not found' });
  const { title, content, category, extractionStatus } = req.body ?? {};
  const m = await prisma.learningMaterial.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content, wordCount: String(content).trim().split(/\s+/).filter(Boolean).length } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(extractionStatus !== undefined ? { extractionStatus } : {}),
    },
  });
  res.json(toMaterial(m));
});

materialsRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const existing = await prisma.learningMaterial.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) return res.status(404).json({ message: 'Material not found' });
  await prisma.learningMaterial.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// Topic extraction without an LLM: deterministic keyword/frequency heuristics
// turn the material's text into topics, each with recall questions and a fresh
// memory state, so a brand-new user's own notes feed the revision loop.
// Idempotent: if topics already exist for this material, it just recounts.
materialsRouter.post('/:id/extract-topics', async (req: AuthedRequest, res) => {
  const m = await prisma.learningMaterial.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!m) return res.status(404).json({ message: 'Material not found' });

  const existing = await prisma.topic.count({ where: { sourceMaterialId: m.id } });
  if (existing > 0) {
    await prisma.learningMaterial.update({
      where: { id: m.id },
      data: { extractionStatus: 'completed', topicCount: existing },
    });
    return res.json({ topicCount: existing });
  }

  const generated = generateFromMaterial(m.title, m.content, m.category);
  const now = new Date();

  for (const gt of generated) {
    const topic = await prisma.topic.create({
      data: {
        userId: req.userId!,
        name: gt.name,
        category: m.category,
        keywords: toJson(gt.keywords),
        description: gt.description,
        sourceMaterialId: m.id,
        relatedTopics: toJson([]),
        prerequisiteTopics: toJson([]),
      },
    });

    // New, unlearned topic: medium strength, due now so it surfaces immediately.
    await prisma.memoryState.create({
      data: {
        userId: req.userId!,
        topicId: topic.id,
        memoryStrength: 40,
        confidence: 40,
        difficulty: gt.questions[0]?.difficulty ?? 'medium',
        reviewCount: 0,
        easeFactor: 2.5,
        intervalDays: 0,
        lastReviewed: now,
        nextReview: now,
      },
    });

    for (const q of gt.questions) {
      await prisma.question.create({
        data: {
          topicId: topic.id,
          materialId: m.id,
          type: q.type,
          questionText: q.questionText,
          expectedAnswer: q.expectedAnswer,
          concepts: toJson(q.concepts),
          difficulty: q.difficulty,
        },
      });
    }
  }

  await prisma.learningMaterial.update({
    where: { id: m.id },
    data: { extractionStatus: 'completed', topicCount: generated.length },
  });

  res.json({ topicCount: generated.length });
});
