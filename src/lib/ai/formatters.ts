export function normalizeWhitespace(s: string) {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function safeUserFacingErrorCode(e: unknown): "ai_failed" | "ai_unavailable" {
  const msg = e instanceof Error ? e.message : String(e);
  if (/Missing GEMINI_API_KEY/i.test(msg)) return "ai_unavailable";
  return "ai_failed";
}

export function clampArray<T>(arr: T[], max: number) {
  return arr.length <= max ? arr : arr.slice(0, max);
}

