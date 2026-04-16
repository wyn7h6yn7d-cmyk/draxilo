import { z } from "zod";

import { runStructuredJson } from "@/lib/ai/client";
import { draxionLeadAnalysisPrompt } from "@/lib/ai/prompts/draxion-lead-analysis";
import { DRAXION_LEAD_ANALYSIS_JSON_SCHEMA } from "@/lib/ai/json-schemas";
import { draxionLeadAnalysisSchema } from "@/lib/ai/schemas";
import { normalizeWhitespace } from "@/lib/ai/formatters";

export const leadAnalysisRequestSchema = z.object({
  language: z.enum(["et", "en", "ru"]).default("en"),
  companyName: z.string().min(2).max(140),
  domain: z.string().optional().nullable(),
  whatYouSell: z.string().min(2).max(400),
  enrichmentJson: z.string().max(20_000).optional().nullable(),
  model: z.string().min(1).optional(),
});
export type LeadAnalysisRequest = z.infer<typeof leadAnalysisRequestSchema>;

export async function runLeadAnalysisUseCase(req: LeadAnalysisRequest) {
  const model =
    req.model?.trim() ||
    process.env.AI_SCORE_MODEL ||
    process.env.AI_MESSAGE_MODEL ||
    process.env.AI_MODEL ||
    "gemini-2.0-flash";
  const prompt = draxionLeadAnalysisPrompt.build({
    language: req.language,
    companyName: normalizeWhitespace(req.companyName),
    domain: req.domain ?? null,
    whatYouSell: normalizeWhitespace(req.whatYouSell),
    enrichmentJson: req.enrichmentJson ? req.enrichmentJson.trim() : null,
  }).prompt;

  const ai = await runStructuredJson({
    model,
    temperature: 0.2,
    maxOutputTokens: 650,
    schemaName: "DraxionLeadAnalysis",
    jsonSchema: DRAXION_LEAD_ANALYSIS_JSON_SCHEMA as any,
    prompt,
    parse: (json) => draxionLeadAnalysisSchema.parse(json),
  });

  return { parsed: ai.parsed, meta: { model: ai.model, usage: ai.usage } };
}

