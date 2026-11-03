// Spaced-repetition scheduler (SM-2 style) and forgetting-risk model.
// Drives memoryStrength, nextReview and risk levels from recall scores.

const DAY_MS = 24 * 60 * 60 * 1000;

export interface MemoryLike {
  memoryStrength: number;
  confidence: number;
  reviewCount: number;
  easeFactor: number;
  intervalDays: number;
  lastReviewed: Date;
}

export interface SchedulerUpdate {
  memoryStrength: number;
  confidence: number;
  reviewCount: number;
  easeFactor: number;
  intervalDays: number;
  lastReviewed: Date;
  nextReview: Date;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

// Apply one review with a recall score (0-100) at time `now`.
export function applyReview(prev: MemoryLike, recallScore: number, now = new Date()): SchedulerUpdate {
  const quality = Math.max(0, Math.min(5, Math.round(recallScore / 20))); // SM-2 quality 0..5

  let ease = prev.easeFactor || 2.5;
  let interval = prev.intervalDays || 0;
  let reviewCount = prev.reviewCount || 0;

  if (quality < 3) {
    // Failed recall: reset the repetition, revisit within a day.
    reviewCount = 0;
    interval = 1;
  } else {
    if (reviewCount === 0) interval = 1;
    else if (reviewCount === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reviewCount += 1;
  }

  // SM-2 ease-factor update, floored at 1.3.
  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // Blend previous strength with the fresh score so it moves but is not jumpy.
  const memoryStrength = clamp(0.4 * (prev.memoryStrength ?? 50) + 0.6 * recallScore);
  const confidence = clamp(0.4 * (prev.confidence ?? 50) + 0.6 * recallScore);

  const nextReview = new Date(now.getTime() + interval * DAY_MS);

  return {
    memoryStrength,
    confidence,
    reviewCount,
    easeFactor: ease,
    intervalDays: interval,
    lastReviewed: now,
    nextReview,
  };
}

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskInfo {
  riskScore: number;
  riskLevel: RiskLevel;
  recommendedAction: string;
}

// Forgetting risk from current strength and how overdue the next review is.
export function riskFor(memoryStrength: number, nextReview: Date, now = new Date()): RiskInfo {
  const overdueDays = Math.max(0, (now.getTime() - new Date(nextReview).getTime()) / DAY_MS);
  const riskScore = clamp((100 - memoryStrength) * 0.75 + Math.min(overdueDays, 14) * 2.5 * 0.7);

  let riskLevel: RiskLevel;
  let recommendedAction: string;
  if (riskScore >= 65) {
    riskLevel = 'high';
    recommendedAction = 'Revise immediately — memory critically low';
  } else if (riskScore >= 38) {
    riskLevel = 'medium';
    recommendedAction = 'Schedule revision within 2 days';
  } else {
    riskLevel = 'low';
    recommendedAction = 'Good retention — review as scheduled';
  }
  return { riskScore, riskLevel, recommendedAction };
}

export function difficultyToScore(d: string): number {
  return d === 'easy' ? 85 : d === 'hard' ? 50 : 68;
}
