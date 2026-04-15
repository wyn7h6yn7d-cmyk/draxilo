import type { PromptTemplate } from "@/lib/ai/types";

export type FormEnrichmentInputs = {
  companyName: string;
  domain: string | null;
  whatYouSell: string;
  language: "et" | "en" | "ru";
};

/**
 * Used when the demo cannot fetch HTML (missing/invalid URL or fetch error).
 * Mirrors website enrichment shape so downstream prompts stay identical to production.
 */
export const formEnrichmentPrompt: PromptTemplate<FormEnrichmentInputs> = {
  name: "demo_form_enrichment_inference",
  version: "1.0",
  build(i) {
    return {
      prompt: [
        "You are a careful B2B research assistant.",
        "NO website was crawled. Infer conservatively ONLY from the user-provided fields below.",
        "Return STRICT JSON that matches the provided JSON Schema exactly (no markdown, no extra keys).",
        "",
        "Rules:",
        "- Do not claim you saw the website. Use wording like 'likely', 'typical for', 'based on the stated offer'.",
        "- confidence must stay <= 0.55 unless the user gave unusually specific, verifiable detail.",
        "- possiblePainPoints: 3–5 plausible business pains for this offer (hypotheses, not facts).",
        "- companySummary: 2–4 sentences tying name, domain hint, and what they sell.",
        "- websiteLanguages: best guess; always include the RequestedOutreachLanguage in the array.",
        "- likelyServicesOrProducts: derive from WhatTheySell; split into concrete bullets if needed.",
        "- contactPageUrl and pricingPageUrl: null (unknown without crawling).",
        "",
        `RequestedOutreachLanguage: ${i.language}`,
        `CompanyName: ${i.companyName}`,
        `Domain: ${i.domain ?? ""}`,
        `WhatTheySell_UserProvided: ${i.whatYouSell}`,
      ].join("\n"),
    };
  },
};
