import type { PromptTemplate } from "@/lib/ai/types";

/**
 * Inputs:
 * - homepageUrl/domain: used for context only
 * - detected contact/pricing URLs: hints (may be empty)
 * - cleanedVisibleText: pre-extracted visible text, already truncated
 *
 * Expected output:
 * - STRICT JSON matching the JSON Schema passed to the model (see src/lib/ai/schemas.ts websiteEnrichmentSchema)
 */
export type WebsiteEnrichmentExtractionInputs = {
  homepageUrl: string;
  domain: string | null;
  contactPageUrlDetected: string | null;
  pricingPageUrlDetected: string | null;
  cleanedVisibleText: string;
};

export const websiteEnrichmentExtractionPrompt: PromptTemplate<WebsiteEnrichmentExtractionInputs> = {
  name: "website_enrichment_extraction",
  version: "1.0",
  build(i) {
    const prompt = [
      "You are a careful B2B research assistant.",
      "Return STRICT JSON that matches the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      "Rules:",
      "- Use ONLY the website text provided. Do not invent facts.",
      "- If uncertain, make a best-effort guess but lower confidence.",
      "- websiteLanguages must be a subset of: et, en, ru (pick what seems present).",
      "- contactPageUrl/pricingPageUrl: use detected URLs if relevant, otherwise null.",
      "",
      `HomepageUrl: ${i.homepageUrl}`,
      `Domain: ${i.domain ?? ""}`,
      `ContactPageUrlDetected: ${i.contactPageUrlDetected ?? ""}`,
      `PricingPageUrlDetected: ${i.pricingPageUrlDetected ?? ""}`,
      "",
      "WebsiteText (visible, cleaned, truncated):",
      i.cleanedVisibleText,
    ].join("\n");

    return { prompt };
  },
};

