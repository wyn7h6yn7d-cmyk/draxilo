import type { MessageLength } from "./types";

function wordCount(text: string) {
  const words = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  return words.length;
}

function limitFor(length: MessageLength) {
  return length === "SHORT" ? 120 : 220;
}

const SPAMMY_PATTERNS = [
  /\b(act now|limited time|guarantee|guaranteed|risk[- ]free|best price|lowest price)\b/i,
  /\b(click here)\b/i,
  /!!!+/,
  /\b(buy now|free money)\b/i,
];

const VAGUE_PATTERNS = [
  /\b(we help (businesses|companies) (grow|scale|succeed))\b/i,
  /\b(synergy|game[- ]changer|cutting[- ]edge solution)\b/i,
  /\b(unlock|supercharge|skyrocket)\b/i,
];

const UNSUPPORTED_CLAIM_PATTERNS = [
  /\b(increase|boost|improve)\b.*\b(\d+%|\d+\s*(x|times))\b/i,
  /\bguarantee\b/i,
];

export type QaResult = {
  ok: boolean;
  issues: string[];
  wordCount: number;
};

export function qaMessage(output: { subject: string; body: string; length: MessageLength }): QaResult {
  const issues: string[] = [];

  const wc = wordCount(output.body);
  const limit = limitFor(output.length);
  if (wc > limit) issues.push(`Body exceeds word limit (${wc}/${limit}).`);

  const combined = `${output.subject}\n${output.body}`;

  if (SPAMMY_PATTERNS.some((r) => r.test(combined))) issues.push("Spammy wording detected.");
  if (VAGUE_PATTERNS.some((r) => r.test(combined))) issues.push("Vague/generic wording detected.");
  if (UNSUPPORTED_CLAIM_PATTERNS.some((r) => r.test(combined)))
    issues.push("Potential unsupported claim detected.");

  // Too much fluff heuristic: too many adjectives or long opening.
  if (output.body.split("\n")[0]?.length > 200) issues.push("Opening line too long.");

  // Subject sanity.
  if (output.subject.length > 80) issues.push("Subject too long.");

  return { ok: issues.length === 0, issues, wordCount: wc };
}

