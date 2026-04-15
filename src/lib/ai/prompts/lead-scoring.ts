import type { PromptTemplate } from "@/lib/ai/types";

/**
 * Inputs:
 * - workspace context (what is being sold + CTA)
 * - lead/company info + enrichment
 *
 * Expected output:
 * - STRICT JSON matching leadScoreSchema (src/lib/ai/schemas.ts)
 */
export type LeadScoringInputs = {
  language: "et" | "en" | "ru";
  whatYouSell?: string | null;
  targetCustomerDescription?: string | null;
  offerType?: string | null;
  callToAction?: string | null;
  companyName?: string | null;
  domain?: string | null;
  enrichmentJson?: string | null; // already serialized structured enrichment if available
};

export const leadScoringPrompt: PromptTemplate<LeadScoringInputs> = {
  name: "lead_scoring",
  version: "1.0",
  build(i) {
    const prompt = [
      "You are scoring how well a company matches a B2B offer for outbound outreach.",
      "Return STRICT JSON that matches the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      `Language: ${i.language} (reasons must be in this language)`,
      "",
      "Rules:",
      "- Use evidence only. If uncertain, lower confidence and score conservatively.",
      "- Score: 0-100. Tier: A (80-100), B (60-79), C (40-59), D (0-39).",
      "- Reasons should be specific, not generic.",
      "",
      "WorkspaceContext:",
      `WhatYouSell: ${i.whatYouSell ?? ""}`,
      `TargetCustomer: ${i.targetCustomerDescription ?? ""}`,
      `OfferType: ${i.offerType ?? ""}`,
      `CTA: ${i.callToAction ?? ""}`,
      "",
      "Lead:",
      `CompanyName: ${i.companyName ?? ""}`,
      `Domain: ${i.domain ?? ""}`,
      `Enrichment: ${i.enrichmentJson ?? "null"}`,
    ].join("\n");

    return { prompt };
  },
};

