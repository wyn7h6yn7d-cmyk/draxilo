import type { PromptTemplate } from "@/lib/ai/types";

export type DraxionLeadAnalysisInputs = {
  language: "et" | "en" | "ru";
  companyName: string;
  domain?: string | null;
  whatYouSell: string;
  enrichmentJson?: string | null;
};

export const draxionLeadAnalysisPrompt: PromptTemplate<DraxionLeadAnalysisInputs> = {
  name: "draxion_lead_analysis",
  version: "1.0",
  build(i) {
    const prompt = [
      "You are Draxion AI. Score a lead for outbound fit.",
      "Return STRICT JSON matching the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      "Rules:",
      "- Base reasons on inputs only. If enrichmentJson is empty, be conservative.",
      "- Score is 0-100; tier A/B/C/D; confidence 0-1.",
      "",
      `Language: ${i.language}`,
      `CompanyName: ${i.companyName}`,
      `Domain: ${i.domain ?? ""}`,
      `WhatWeSell: ${i.whatYouSell}`,
      "",
      "EnrichmentJson (optional):",
      i.enrichmentJson ?? "",
    ].join("\n");

    return { prompt };
  },
};

