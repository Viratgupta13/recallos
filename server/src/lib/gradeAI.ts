// Gemini-backed answer grader (hybrid).
// Uses Google Gemini to judge a typed answer by meaning, so a correct answer in
// the student's own words / synonyms scores fairly. If no GEMINI_API_KEY is set,
// or the call fails / returns bad data, it falls back to the deterministic
// keyword grader in grade.ts — so the app never breaks and works offline too.

import { gradeAnswer, type GradeResult } from './grade.js';
import { geminiJSON, hasGeminiKey } from './gemini.js';

const GRADE_TIMEOUT_MS = 8000;

interface GeminiParams {
  questionText: string;
  expectedAnswer: string;
  userAnswer: string;
  concepts: string[];
}

// Grade one answer. Returns a GradeResult plus which path produced it, so the
// caller/logs can tell AI vs deterministic grading apart.
export async function gradeWithGemini(
  params: GeminiParams
): Promise<GradeResult & { gradedBy: 'ai' | 'deterministic' }> {
  const { questionText, expectedAnswer, userAnswer, concepts } = params;

  const fallback = (): GradeResult & { gradedBy: 'deterministic' } => ({
    ...gradeAnswer(userAnswer, concepts),
    gradedBy: 'deterministic',
  });

  // No key, or a trivial/empty answer: skip the API call entirely.
  if (!hasGeminiKey() || !userAnswer || userAnswer.trim().length < 2) return fallback();

  const prompt = `You are grading a student's short answer for a computer-science revision app.

Question: ${questionText}
Reference answer: ${expectedAnswer || '(none provided)'}
Key concepts the answer should cover: ${concepts.length ? concepts.join(', ') : '(none provided)'}
Student's answer: ${userAnswer}

Grade how well the student's answer shows real understanding. Be fair: accept correct
answers written in the student's own words or with synonyms, even if phrased very
differently from the reference. Ignore spelling and grammar. Do not reward empty,
off-topic, or copied-question answers.

Respond with ONLY a JSON object (no markdown, no extra text) with exactly these fields:
{
  "recallScore": <integer 0-100>,
  "rememberedConcepts": [<the key concepts the student DID cover, from the list above>],
  "missingConcepts": [<the key concepts the student MISSED, from the list above>],
  "feedback": "<one or two short, specific, encouraging sentences>"
}`;

  const parsed = (await geminiJSON(prompt, GRADE_TIMEOUT_MS)) as Partial<GradeResult> | null;
  if (!parsed) return fallback();

  const rawScore = Number(parsed.recallScore);
  if (!Number.isFinite(rawScore)) return fallback();

  const recallScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const rememberedConcepts = Array.isArray(parsed.rememberedConcepts)
    ? parsed.rememberedConcepts.map(String)
    : [];
  const missingConcepts = Array.isArray(parsed.missingConcepts)
    ? parsed.missingConcepts.map(String)
    : [];
  const feedback =
    typeof parsed.feedback === 'string' && parsed.feedback.trim()
      ? parsed.feedback.trim()
      : 'Answer graded.';

  return { recallScore, rememberedConcepts, missingConcepts, feedback, gradedBy: 'ai' };
}
