// Shared Google Gemini helper. One place that owns the HTTP call, the timeout,
// a single 503/429 retry (free tier is occasionally busy), and JSON parsing.
// Returns the parsed JSON response, or null on any problem (no key, network
// error, timeout, non-200, empty or invalid JSON) so callers can fall back.

const DEFAULT_TIMEOUT_MS = 15000;

export function geminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
}

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function geminiJSON(prompt: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<unknown | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${apiKey}`;
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      // temperature 0 = stable output; ask for raw JSON back.
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    }),
  };

  const call = async (): Promise<Response> => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let res = await call();
    // One short retry for transient 503 (high demand) / 429 (rate limit).
    if (res.status === 503 || res.status === 429) {
      await new Promise((r) => setTimeout(r, 700));
      res = await call();
    }
    if (!res.ok) return null;

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}
