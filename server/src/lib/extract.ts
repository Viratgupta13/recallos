// Deterministic topic + question generator (no LLM).
// Turns a learning material's raw text into a small set of topics, each with a
// recall question and the key concepts the grader checks the answer against.
// This is the non-AI stand-in for M3 (topic extraction) + M4 (question engine):
// explainable keyword/frequency heuristics, no model calls.

export interface GenQuestion {
  type: string;
  questionText: string;
  expectedAnswer: string;
  concepts: string[];
  difficulty: string;
}

export interface GenTopic {
  name: string;
  keywords: string[];
  description: string;
  questions: GenQuestion[];
}

const STOP = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'are', 'was', 'use', 'used', 'using', 'its',
  'from', 'into', 'than', 'then', 'them', 'they', 'their', 'there', 'these', 'those', 'such',
  'can', 'could', 'would', 'should', 'may', 'might', 'will', 'shall', 'must', 'have', 'has', 'had',
  'but', 'not', 'all', 'any', 'each', 'how', 'what', 'when', 'where', 'which', 'who', 'why',
  'while', 'also', 'more', 'most', 'some', 'only', 'very', 'much', 'many', 'both', 'either',
  'does', 'done', 'doing', 'been', 'being', 'because', 'between', 'about', 'across', 'after',
  'over', 'under', 'onto', 'off', 'out', 'via', 'per', 'versus', 'etc', 'example', 'examples',
  'like', 'good', 'make', 'makes', 'making', 'provides', 'provide', 'include', 'includes',
  'including', 'based', 'different', 'same', 'other', 'another', 'within', 'without', 'often',
  'usually', 'typically', 'however', 'therefore', 'thus', 'here', 'your', 'you', 'our',
  // common verbs / low-value words that make poor topic names
  'runs', 'run', 'gives', 'give', 'given', 'picks', 'pick', 'saves', 'save', 'loads', 'load',
  'causes', 'cause', 'decides', 'decide', 'adds', 'add', 'adding', 'sends', 'send', 'uses',
  'handles', 'handle', 'defines', 'define', 'means', 'needs', 'need', 'gets', 'goes', 'comes',
  'takes', 'take', 'puts', 'keeps', 'keep', 'works', 'work', 'helps', 'help', 'allows', 'allow',
  'first', 'next', 'each', 'every', 'because', 'simple', 'long', 'short', 'high', 'highest',
  'fixed', 'average', 'one', 'two', 'three', 'four', 'five', 'process', 'processes',
  'guarantees', 'guarantee', 'guaranteed', 'establishes', 'establish', 'established',
  'minimizes', 'minimize', 'maximizes', 'maximize', 'ensures', 'ensure', 'requires', 'require',
  'performs', 'perform', 'represents', 'represent', 'contains', 'contain', 'consists', 'consist',
  'occurs', 'occur', 'becomes', 'become', 'enables', 'enable', 'supports', 'determines',
  'transmits', 'transmit', 'divides', 'divide', 'stores', 'store', 'runs', 'lower', 'higher',
]);

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 4)
    .slice(0, 150);
}

function words(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
}

function significantWords(text: string): string[] {
  return words(text).filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w));
}

function titleCase(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function stem(w: string): string {
  return w.toLowerCase().slice(0, 6);
}

// Count significant-word frequency across a block of text.
function frequency(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const w of significantWords(text)) freq.set(w, (freq.get(w) ?? 0) + 1);
  return freq;
}

// Pick the top distinct significant words from a frequency map, de-duplicating
// by stem so "reliable"/"reliability" don't both appear, preserving first order.
function topWords(freq: Map<string, number>, limit: number, exclude: Set<string> = new Set()): string[] {
  const seen = new Set<string>();
  return [...freq.entries()]
    .filter(([w]) => !exclude.has(w))
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .filter((w) => {
      const s = stem(w);
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    })
    .slice(0, limit);
}

export function generateFromMaterial(title: string, content: string, category: string): GenTopic[] {
  const sentences = splitSentences(content);
  const inCat = category && category !== 'Uncategorized' ? ` in ${category}` : '';

  const contentFreq = frequency(content);

  // A candidate topic term: an acronym, a two-word phrase, or a single word.
  // `words` holds its lowercase components (for stem de-dup + sentence matching).
  type Cand = { display: string; words: string[]; score: number };
  const cands: Cand[] = [];

  // 1) Acronyms (TCP, FCFS, SJF, 3NF...) — the most reliable topic signals.
  for (const a of [...new Set((content.match(/\b[A-Z][A-Z0-9]{1,6}\b/g) ?? []))]) {
    cands.push({ display: a, words: [a.toLowerCase()], score: (contentFreq.get(a.toLowerCase()) ?? 0) + 8 });
  }

  // 2) Two-word phrases ("round robin", "context switch", "waiting time") — the
  //    best multi-word topic names, built from adjacent significant words.
  const bigramFreq = new Map<string, number>();
  for (const s of sentences) {
    const sw = significantWords(s);
    for (let i = 0; i < sw.length - 1; i++) bigramFreq.set(`${sw[i]} ${sw[i + 1]}`, (bigramFreq.get(`${sw[i]} ${sw[i + 1]}`) ?? 0) + 1);
  }
  for (const [phrase, count] of bigramFreq) {
    const parts = phrase.split(' ');
    cands.push({ display: parts.map(titleCase).join(' '), words: parts, score: count * 2 + 4 });
  }

  // 3) Single significant words — fallback so short notes still yield topics.
  for (const w of topWords(contentFreq, 12)) {
    cands.push({ display: titleCase(w), words: [w], score: contentFreq.get(w) ?? 1 });
  }

  const supportFor = (terms: string[]): string[] =>
    sentences.filter((s) => terms.every((t) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(s)));

  // Pick the strongest candidates, skipping any that reuse a word stem already
  // taken (so "CPU Scheduling" blocks a later bare "Scheduling" topic).
  const usedStems = new Set<string>();
  const chosen: (Cand & { support: string[] })[] = [];
  for (const c of cands.sort((a, b) => b.score - a.score)) {
    const stems = c.words.map(stem);
    if (stems.some((s) => usedStems.has(s))) continue;
    const support = supportFor(c.words);
    if (!support.length) continue;
    chosen.push({ ...c, support });
    stems.forEach((s) => usedStems.add(s));
    if (chosen.length >= 4) break;
  }

  const topics: GenTopic[] = [];

  for (const c of chosen) {
    const supportText = c.support.join(' ');
    const supportFreq = frequency(supportText);
    const concepts = topWords(supportFreq, 5, new Set(c.words));
    const description = c.support[0].slice(0, 180);
    const answer = c.support.slice(0, 2).join(' ').slice(0, 320);
    const difficulty = supportText.split(/\s+/).length > 25 ? 'medium' : 'easy';

    topics.push({
      name: c.display,
      keywords: concepts,
      description,
      questions: [
        {
          type: 'conceptual',
          questionText: `Explain ${c.display} and why it matters${inCat}.`,
          expectedAnswer: answer || description,
          concepts: concepts.length ? concepts : c.words,
          difficulty,
        },
      ],
    });
  }

  // Fallback: short or unstructured note — one topic from the title.
  if (topics.length === 0) {
    const concepts = topWords(contentFreq, 5);
    topics.push({
      name: title,
      keywords: concepts,
      description: (sentences[0] ?? content).slice(0, 180),
      questions: [
        {
          type: 'conceptual',
          questionText: `Explain the key ideas of "${title}"${inCat}.`,
          expectedAnswer: sentences.slice(0, 2).join(' ').slice(0, 320) || content.slice(0, 320),
          concepts: concepts.length ? concepts : significantWords(title).slice(0, 4),
          difficulty: 'easy',
        },
      ],
    });
  }

  // A synthesis "explain-back" question on the first topic, so every material
  // yields at least two questions and the recall loop has something to run.
  const overallConcepts = topWords(contentFreq, 6);
  topics[0].questions.push({
    type: 'explain-back',
    questionText: `Summarize the key points of "${title}" in your own words.`,
    expectedAnswer: sentences.slice(0, 3).join(' ').slice(0, 400) || content.slice(0, 400),
    concepts: overallConcepts.length ? overallConcepts : significantWords(title).slice(0, 4),
    difficulty: 'medium',
  });

  // If two strong topics exist, add one comparison question for variety.
  if (topics.length >= 2) {
    const [a, b] = topics;
    topics[0].questions.push({
      type: 'comparison',
      questionText: `Compare ${a.name} and ${b.name}. How do they differ?`,
      expectedAnswer: `${a.description} ${b.description}`.slice(0, 400),
      concepts: [...new Set([...a.keywords.slice(0, 3), ...b.keywords.slice(0, 3)])],
      difficulty: 'medium',
    });
  }

  return topics;
}
