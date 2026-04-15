import type { PromptTemplate } from "@/lib/ai/types";

/**
 * Inputs:
 * - rawNotes: any messy notes/snippets (e.g., scraped fragments, sales notes)
 *
 * Expected output:
 * - STRICT JSON matching companySummarySchema (src/lib/ai/schemas.ts)
 */
export type CompanySummaryStructuringInputs = {
  companyName?: string | null;
  domain?: string | null;
  rawNotes: string;
};

export const companySummaryStructuringPrompt: PromptTemplate<CompanySummaryStructuringInputs> = {
  name: "company_summary_structuring",
  version: "1.0",
  build(i) {
    const prompt = [
      "You are structuring company research notes into a concise company profile.",
      "Return STRICT JSON that matches the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      "Rules:",
      "- Only use facts supported by the notes. If unknown, keep it generic and lower confidence.",
      "- Keep summary concise, neutral, and non-marketing.",
      "",
      `CompanyName: ${i.companyName ?? ""}`,
      `Domain: ${i.domain ?? ""}`,
      "",
      "Notes:",
      i.rawNotes,
    ].join("\n");

    return { prompt };
  },
};

