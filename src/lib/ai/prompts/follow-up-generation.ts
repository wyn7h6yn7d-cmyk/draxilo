import type { PromptTemplate } from "@/lib/ai/types";

/**
 * Inputs:
 * - previousSubject/body: the previous message to follow up on
 * - a small new angle (optional)
 *
 * Expected output:
 * - STRICT JSON matching followUpSchema (src/lib/ai/schemas.ts)
 */
export type FollowUpInputs = {
  language: "et" | "en" | "ru";
  tone: "FRIENDLY" | "DIRECT" | "SHARP";
  length: "SHORT" | "MEDIUM";
  wordLimit: number;
  companyName?: string | null;
  previousSubject: string;
  previousBody: string;
  newAngle?: string | null;
  callToAction?: string | null;
};

export const followUpPrompt: PromptTemplate<FollowUpInputs> = {
  name: "follow_up_generation",
  version: "1.0",
  build(i) {
    const prompt = [
      "You write concise B2B email follow-ups.",
      "Return STRICT JSON that matches the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      `Language: ${i.language} (subject/body must be in this language)`,
      `Tone: ${i.tone}`,
      `Length: ${i.length} (hard body limit: ${i.wordLimit} words)`,
      "",
      "Rules:",
      "- Mention this is a quick follow-up (subtle, not needy).",
      "- Add ONE small new angle if provided; otherwise keep it minimal.",
      "- No spammy wording. No fake claims.",
      "",
      `CompanyName: ${i.companyName ?? ""}`,
      `CTA: ${i.callToAction ?? ""}`,
      `NewAngle: ${i.newAngle ?? ""}`,
      "",
      "PreviousEmail:",
      `Subject: ${i.previousSubject}`,
      "Body:",
      i.previousBody,
    ].join("\n");

    return { prompt };
  },
};

