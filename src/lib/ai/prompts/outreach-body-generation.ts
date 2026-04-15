import type { PromptTemplate } from "@/lib/ai/types";

/**
 * Inputs:
 * - language: et|en|ru
 * - style/tone/length: controls voice and constraints
 * - offer + CTA + evidence: used for personalization
 *
 * Expected output:
 * - STRICT JSON matching outreachBodySchema (src/lib/ai/schemas.ts)
 */
export type OutreachBodyInputs = {
  language: "et" | "en" | "ru";
  style: "COLD_INTRO" | "QUICK_AUDIT";
  tone: "FRIENDLY" | "DIRECT" | "SHARP";
  length: "SHORT" | "MEDIUM";
  wordLimit: number;
  workspaceBusinessName?: string | null;
  whatYouSell?: string | null;
  offerType?: string | null;
  callToAction?: string | null;
  companyName?: string | null;
  domain?: string | null;
  companySummary?: string | null;
  painPoints?: string[] | null;
  customInstruction?: string | null;
  evidenceConfidence?: number | null;
};

export const outreachBodyPrompt: PromptTemplate<OutreachBodyInputs> = {
  name: "outreach_body_generation",
  version: "1.0",
  build(i) {
    const prompt = [
      "You write personalized B2B outreach emails that sound human.",
      "Return STRICT JSON that matches the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      `Language: ${i.language} (body must be in this language)`,
      `Style: ${i.style}`,
      `Tone: ${i.tone}`,
      `Length: ${i.length} (hard body limit: ${i.wordLimit} words)`,
      "",
      "Rules:",
      "- No spammy marketing wording. No hype. No fake claims.",
      "- Avoid generic fluff ('we help businesses grow').",
      "- Use evidence when available; if evidenceConfidence is low, be honest and softer.",
      "- Keep CTA to one clear ask. Do not include links unless provided as evidence.",
      "",
      "Inputs:",
      `WorkspaceBusinessName: ${i.workspaceBusinessName ?? ""}`,
      `WhatYouSell: ${i.whatYouSell ?? ""}`,
      `OfferType: ${i.offerType ?? ""}`,
      `CallToAction: ${i.callToAction ?? ""}`,
      `CompanyName: ${i.companyName ?? ""}`,
      `Domain: ${i.domain ?? ""}`,
      `CompanySummary: ${i.companySummary ?? ""}`,
      `PainPoints: ${(i.painPoints ?? []).join("; ")}`,
      `EvidenceConfidence: ${typeof i.evidenceConfidence === "number" ? i.evidenceConfidence : ""}`,
      i.customInstruction ? `CustomInstruction: ${i.customInstruction}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return { prompt };
  },
};

