// Gemini-backed topic + question generator (hybrid).
// Turns a learning material's text into clean, well-named CS topics and
// interview-style recall questions. Returns the SAME GenTopic[] shape as the
// deterministic generator in extract.ts, so it is a drop-in replacement.
// Falls back to generateFromMaterial when no GEMINI_API_KEY is set or the call
// fails / returns invalid data — so the app never breaks and works offline.

import { generateFromMaterial, type GenTopic, type GenQuestion } from './extract.js';
import { geminiJSON, hasGeminiKey } from './gemini.js';

const GENERATE_TIMEOUT_MS = 20000;
const MAX_CONTENT_CHARS = 8000; // keep the prompt small for the free tier
const VALID_DIFFICULTY = new Set(['easy', 'medium', 'hard']);

export async function generateWithGemini(
  title: string,
  content: string,
  category: string
): Promise<GenTopic[]> {
  const fallback = () => generateFromMaterial(title, content, category);

  // No key, or too little text to be worth an LLM call.
  if (!hasGeminiKey() || !content || content.trim().length < 40) return fallback();

  const cat = category && category !== 'Uncategorized' ? category : 'computer science';
  const prompt = `You are helping a computer-science student revise for placement/technical interviews.

From the study notes below, extract the 3 to 5 MOST important topics. For each topic give:
- "name": a short, correct topic name using the standard CS term (e.g. "TCP", "CPU Scheduling", "Normalization") — not a vague phrase.
- "keywords": 3 to 5 key concepts a strong answer must cover.
- "description": one plain sentence explaining the topic.
- "questions": 1 to 2 interview-style recall questions. Vary the "type" among "conceptual", "comparison", "explain-back", "scenario". Each question has a concise, correct model "expectedAnswer", the "concepts" it should contain (3 to 5), and a "difficulty" of "easy", "medium", or "hard".

Subject area: ${cat}
Title: ${title}
Notes:
"""
${content.slice(0, MAX_CONTENT_CHARS)}
"""

Respond with ONLY a JSON array (no markdown, no extra text). Each element:
{
  "name": "...",
  "keywords": ["...", "..."],
  "description": "...",
  "questions": [
    {
      "type": "conceptual",
      "questionText": "...",
      "expectedAnswer": "...",
      "concepts": ["...", "..."],
      "difficulty": "medium"
    }
  ]
}`;

  const raw = await geminiJSON(prompt, GENERATE_TIMEOUT_MS);
  if (!Array.isArray(raw)) return fallback();

  const topics: GenTopic[] = [];
  for (const t of raw as Record<string, unknown>[]) {
    if (!t || typeof t.name !== 'string' || !t.name.trim()) continue;

    const questionsRaw = Array.isArray(t.questions) ? (t.questions as Record<string, unknown>[]) : [];
    const questions: GenQuestion[] = [];
    for (const q of questionsRaw) {
      if (!q || typeof q.questionText !== 'string' || !q.questionText.trim()) continue;
      questions.push({
        type: typeof q.type === 'string' && q.type.trim() ? q.type.trim() : 'conceptual',
        questionText: q.questionText.trim(),
        expectedAnswer: typeof q.expectedAnswer === 'string' ? q.expectedAnswer.trim() : '',
        concepts: Array.isArray(q.concepts) ? q.concepts.map(String).filter(Boolean).slice(0, 6) : [],
        difficulty: typeof q.difficulty === 'string' && VALID_DIFFICULTY.has(q.difficulty) ? q.difficulty : 'medium',
      });
    }
    if (questions.length === 0) continue;

    topics.push({
      name: t.name.trim().slice(0, 80),
      keywords: Array.isArray(t.keywords) ? t.keywords.map(String).filter(Boolean).slice(0, 6) : [],
      description: typeof t.description === 'string' ? t.description.trim().slice(0, 300) : '',
      questions: questions.slice(0, 3),
    });
  }

  // Any valid topic parsed? Use it; otherwise fall back to deterministic.
  return topics.length ? topics.slice(0, 6) : fallback();
}
