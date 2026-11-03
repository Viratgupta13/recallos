// Deterministic recall grader (no LLM).
// Scores a typed answer by how many of the question's key concepts it covers,
// using keyword overlap, and returns remembered/missing concepts + feedback.

export interface GradeResult {
  recallScore: number;
  rememberedConcepts: string[];
  missingConcepts: string[];
  feedback: string;
}

const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'are', 'was', 'use', 'used', 'using', 'its']);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
  );
}

// Stem match: two words count as the same if they share a 5+ char prefix,
// so "reliable" matches "reliability" and "connection" matches "connectionless".
function stemHit(word: string, answerTokens: Set<string>, answerLower: string): boolean {
  if (answerTokens.has(word) || answerLower.includes(word)) return true;
  const stem = word.slice(0, Math.min(word.length, 6));
  if (stem.length < 5) return false;
  for (const t of answerTokens) {
    if (t.startsWith(stem) || word.startsWith(t.slice(0, 6))) return true;
  }
  return false;
}

function conceptMatched(concept: string, answerTokens: Set<string>, answerLower: string): boolean {
  const key = concept.toLowerCase();
  // Direct substring match for short/compound concepts (e.g. "o(log n)", "syn-ack").
  if (key.length <= 8 && answerLower.includes(key)) return true;
  const words = key
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  if (words.length === 0) return answerLower.includes(key);
  const hits = words.filter((w) => stemHit(w, answerTokens, answerLower)).length;
  // A concept counts as recalled if at least half of its significant words appear.
  return hits >= Math.ceil(words.length / 2);
}

export function gradeAnswer(userAnswer: string, concepts: string[]): GradeResult {
  const answer = (userAnswer || '').trim();
  const answerLower = answer.toLowerCase();
  const answerTokens = tokens(answer);

  const remembered: string[] = [];
  const missing: string[] = [];

  for (const c of concepts) {
    if (conceptMatched(c, answerTokens, answerLower)) remembered.push(c);
    else missing.push(c);
  }

  let score: number;
  if (concepts.length === 0) {
    // No concept list: fall back to a length-based heuristic.
    score = Math.min(90, 30 + answerTokens.size * 4);
  } else {
    score = Math.round((remembered.length / concepts.length) * 100);
  }

  // Penalise empty/one-word answers; nudge up for genuinely detailed ones.
  if (answerTokens.size <= 1) score = Math.min(score, 10);
  else if (answerTokens.size >= 25 && score < 100) score = Math.min(100, score + 5);

  score = Math.max(0, Math.min(100, score));

  let feedback: string;
  if (score >= 85) {
    feedback = 'Excellent recall! Your answer covers the key concepts clearly and in depth.';
  } else if (score >= 65) {
    feedback = missing.length
      ? `Good effort! You covered the main ideas. To go further, work in: ${missing.join(', ')}.`
      : 'Good effort! Your answer covers the main ideas well.';
  } else if (score >= 35) {
    feedback = `Partial recall. You touched on some points but missed: ${missing.join(', ')}. Review these and try again.`;
  } else {
    feedback = `Your answer shows limited recall of this topic. Focus your revision on: ${missing.join(', ') || 'the core concepts'}.`;
  }

  return { recallScore: score, rememberedConcepts: remembered, missingConcepts: missing, feedback };
}
