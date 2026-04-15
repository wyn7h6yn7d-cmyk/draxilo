import type { PromptTemplate } from "@/lib/ai/types";

/**
 * Inputs:
 * - language: et|en|ru
 * - a short context about lead/company + offer + CTA
 *
 * Expected output:
 * - STRICT JSON matching outreachSubjectSchema (src/lib/ai/schemas.ts)
 */
export type OutreachSubjectInputs = {
  language: "et" | "en" | "ru";
  companyName?: string | null;
  domain?: string | null;
  oneLineContext?: string | null;
  callToAction?: string | null;
  style: "COLD_INTRO" | "QUICK_AUDIT" | "FOLLOW_UP";
};

export const outreachSubjectPrompt: PromptTemplate<OutreachSubjectInputs> = {
  name: "outreach_subject_generation",
  version: "1.0",
  build(i) {
    const prompt = [
      "You write short, human-sounding B2B email subjects.",
      "Return STRICT JSON that matches the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      `Language: ${i.language} (subject must be in this language)`,
      `Style: ${i.style}`,
      "",
      "Rules:",
      "- No spammy words. No hype. No exclamation marks.",
      "- Keep it under ~7 words if possible.",
      "- Be specific to the company/context when available.",
      "",
      `CompanyName: ${i.companyName ?? ""}`,
      `Domain: ${i.domain ?? ""}`,
      `Context: ${i.oneLineContext ?? ""}`,
      `CTA: ${i.callToAction ?? ""}`,
    ].join("\n");

    return { prompt };
  },
};

