import { z } from "zod";

import { runStructuredJson } from "@/lib/ai/client";
import { normalizeWhitespace } from "@/lib/ai/formatters";
import { draxionAuditPrompt } from "@/lib/ai/prompts/draxion-audit";
import { DRAXION_AUDIT_JSON_SCHEMA } from "@/lib/ai/json-schemas";
import { draxionAuditSchema } from "@/lib/ai/schemas";

export const auditRequestSchema = z.object({
  language: z.enum(["et", "en", "ru"]).default("en"),
  companyName: z.string().min(2).max(140),
  websiteUrl: z.string().url().optional().nullable(),
  whatYouSell: z.string().min(2).max(400),
  websiteText: z.string().max(25_000).optional().nullable(),
  model: z.string().min(1).optional(),
});
export type AuditRequest = z.infer<typeof auditRequestSchema>;

export async function runAuditUseCase(req: AuditRequest) {
  const model =
    req.model?.trim() ||
    process.env.AI_MESSAGE_MODEL ||
    process.env.AI_MODEL ||
    "gemini-2.0-flash";
  const prompt = draxionAuditPrompt.build({
    language: req.language,
    companyName: normalizeWhitespace(req.companyName),
    websiteUrl: req.websiteUrl ?? null,
    whatYouSell: normalizeWhitespace(req.whatYouSell),
    websiteText: req.websiteText ? normalizeWhitespace(req.websiteText) : null,
  }).prompt;

  const ai = await runStructuredJson({
    model,
    temperature: 0.25,
    maxOutputTokens: 900,
    schemaName: "DraxionAudit",
    jsonSchema: DRAXION_AUDIT_JSON_SCHEMA as any,
    prompt,
    parse: (json) => draxionAuditSchema.parse(json),
  });

  return { parsed: ai.parsed, meta: { model: ai.model, usage: ai.usage } };
}

