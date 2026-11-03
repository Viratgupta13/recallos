// Convert Prisma rows (JSON-string arrays, Date objects) into the exact shapes
// the frontend's src/types/index.ts expects.

const iso = (d: Date | null | undefined): string | undefined =>
  d ? new Date(d).toISOString() : undefined;

const arr = (s: string | null | undefined): string[] => {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

export const toJson = (v: unknown): string => JSON.stringify(v ?? []);

export function toUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? undefined,
    preferences: {
      theme: u.theme,
      dailyRevisionTarget: u.dailyRevisionTarget,
      preferredSessionLength: u.preferredSessionLength,
      notificationsEnabled: u.notificationsEnabled,
    },
    createdAt: iso(u.createdAt)!,
    updatedAt: iso(u.updatedAt)!,
  };
}

export function toMaterial(m: any) {
  return {
    id: m.id,
    userId: m.userId,
    title: m.title,
    content: m.content,
    category: m.category,
    wordCount: m.wordCount,
    topicCount: m.topicCount,
    extractionStatus: m.extractionStatus,
    createdAt: iso(m.createdAt)!,
    updatedAt: iso(m.updatedAt)!,
  };
}

export function toTopic(t: any) {
  return {
    id: t.id,
    userId: t.userId,
    name: t.name,
    category: t.category,
    keywords: arr(t.keywords),
    description: t.description,
    sourceMaterialId: t.sourceMaterialId,
    parentTopic: t.parentTopic ?? undefined,
    relatedTopics: arr(t.relatedTopics),
    prerequisiteTopics: arr(t.prerequisiteTopics),
    createdAt: iso(t.createdAt)!,
  };
}

export function toQuestion(q: any) {
  return {
    id: q.id,
    topicId: q.topicId,
    materialId: q.materialId,
    type: q.type,
    questionText: q.questionText,
    options: q.options ? arr(q.options) : undefined,
    expectedAnswer: q.expectedAnswer,
    concepts: arr(q.concepts),
    difficulty: q.difficulty,
    createdAt: iso(q.createdAt)!,
  };
}

export function toSession(s: any) {
  return {
    id: s.id,
    userId: s.userId,
    topicIds: arr(s.topicIds),
    questionIds: arr(s.questionIds),
    startedAt: iso(s.startedAt)!,
    completedAt: iso(s.completedAt),
    averageRecall: s.averageRecall,
    questionsCompleted: s.questionsCompleted,
    durationMinutes: s.durationMinutes ?? undefined,
  };
}

export function toAttempt(a: any) {
  return {
    id: a.id,
    sessionId: a.sessionId ?? '',
    questionId: a.questionId,
    topicId: a.topicId,
    userAnswer: a.userAnswer,
    recallScore: a.recallScore,
    rememberedConcepts: arr(a.rememberedConcepts),
    missingConcepts: arr(a.missingConcepts),
    feedback: a.feedback,
    createdAt: iso(a.createdAt)!,
  };
}

// MemoryState query must include the related topic for name/category.
export function toMemory(m: any) {
  return {
    id: m.id,
    userId: m.userId,
    topicId: m.topicId,
    topicName: m.topic?.name ?? '',
    topicCategory: m.topic?.category ?? '',
    memoryStrength: m.memoryStrength,
    confidence: m.confidence,
    difficulty: m.difficulty,
    reviewCount: m.reviewCount,
    lastReviewed: iso(m.lastReviewed)!,
    nextReview: iso(m.nextReview)!,
  };
}

export function toPlacementTest(p: any) {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    subCategory: p.subCategory,
    questionCount: p.questionCount,
    duration: p.duration,
    difficulty: p.difficulty,
    lastAttempted: iso(p.lastAttempted),
    bestScore: p.bestScore ?? undefined,
    status: p.status,
  };
}

export function toInterviewQuestion(q: any) {
  return {
    id: q.id,
    category: q.category,
    questionText: q.questionText,
    stage: q.stage,
    difficulty: q.difficulty,
    topicId: q.topicId ?? undefined,
  };
}
