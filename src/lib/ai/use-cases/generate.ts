import { z } from "zod";

import { runStructuredJson } from "@/lib/ai/client";
import {
  LEAD_SCORE_JSON_SCHEMA,
  OUTREACH_BODY_JSON_SCHEMA,
  OUTREACH_SUBJECT_JSON_SCHEMA,
  WEBSITE_ENRICHMENT_JSON_SCHEMA,
} from "@/lib/ai/json-schemas";
import {
  leadScoreSchema,
  outreachBodySchema,
  outreachSubjectSchema,
  websiteEnrichmentSchema,
  type LeadScore,
  type OutreachBody,
  type OutreachSubject,
  type WebsiteEnrichment,
} from "@/lib/ai/schemas";
import { leadScoringPrompt } from "@/lib/ai/prompts/lead-scoring";
import { outreachBodyPrompt } from "@/lib/ai/prompts/outreach-body-generation";
import { outreachSubjectPrompt } from "@/lib/ai/prompts/outreach-subject-generation";
import { websiteEnrichmentExtractionPrompt } from "@/lib/ai/prompts/website-enrichment-extraction";

const localeSchema = z.enum(["et", "en", "ru"]);

export const aiGenerateRequestSchema = z.object({
  useCase: z.enum(["website_enrichment", "outreach_subject", "outreach_body", "lead_score"]),
  model: z.string().min(1).optional(),
  // Optional de-dupe key to prevent accidental double-submits
  dedupeKey: z.string().min(8).max(200).optional(),
  input: z.record(z.string(), z.any()),
});

export type AiGenerateRequest = z.infer<typeof aiGenerateRequestSchema>;

export type AiGenerateResponse =
  | { ok: true; useCase: AiGenerateRequest["useCase"]; data: WebsiteEnrichment | OutreachSubject | OutreachBody | LeadScore; meta: any }
  | { ok: false; error: "validation" | "ai_unavailable" | "ai_failed" };

function pickModel(useCase: AiGenerateRequest["useCase"], override?: string) {
  if (override?.trim()) return override.trim();
  const base = process.env.AI_MODEL ?? "gemini-2.0-flash";
  if (useCase === "website_enrichment") return process.env.AI_ENRICH_MODEL ?? base;
  if (useCase === "lead_score") return process.env.AI_SCORE_MODEL ?? process.env.AI_MESSAGE_MODEL ?? base;
  return process.env.AI_MESSAGE_MODEL ?? base;
}

export async function runAiGenerateUseCase(req: AiGenerateRequest): Promise<AiGenerateResponse> {
  const model = pickModel(req.useCase, req.model);

  if (req.useCase === "website_enrichment") {
    const inputSchema = z.object({
      homepageUrl: z.string().min(1),
      domain: z.string().nullable(),
      contactPageUrlDetected: z.string().nullable(),
      pricingPageUrlDetected: z.string().nullable(),
      cleanedVisibleText: z.string().min(1),
    });
    const i = inputSchema.parse(req.input);
    const prompt = websiteEnrichmentExtractionPrompt.build(i).prompt;
    const ai = await runStructuredJson({
      model,
      temperature: 0.2,
      maxOutputTokens: 800,
      schemaName: "DraxionWebsiteEnrichment",
      jsonSchema: WEBSITE_ENRICHMENT_JSON_SCHEMA as any,
      prompt,
      parse: (json) => websiteEnrichmentSchema.parse(json),
    });
    return { ok: true, useCase: req.useCase, data: ai.parsed, meta: { model: ai.model, usage: ai.usage } };
  }

  if (req.useCase === "outreach_subject") {
    const inputSchema = z.object({
      language: localeSchema,
      companyName: z.string().min(1),
      domain: z.string().optional().default(""),
      oneLineContext: z.string().min(1),
      callToAction: z.string().min(1),
      style: z.enum(["COLD_INTRO", "QUICK_AUDIT", "FOLLOW_UP"]),
    });
    const i = inputSchema.parse(req.input);
    const prompt = outreachSubjectPrompt.build(i as any).prompt;
    const ai = await runStructuredJson({
      model,
      temperature: 0.2,
      maxOutputTokens: 200,
      schemaName: "DraxionOutreachSubject",
      jsonSchema: OUTREACH_SUBJECT_JSON_SCHEMA as any,
      prompt,
      parse: (json) => outreachSubjectSchema.parse(json),
    });
    return { ok: true, useCase: req.useCase, data: ai.parsed, meta: { model: ai.model, usage: ai.usage } };
  }

  if (req.useCase === "outreach_body") {
    const inputSchema = z.object({
      language: localeSchema,
      style: z.enum(["COLD_INTRO", "QUICK_AUDIT", "FOLLOW_UP"]),
      tone: z.enum(["FRIENDLY", "DIRECT", "SHARP"]),
      length: z.enum(["SHORT", "MEDIUM"]),
      wordLimit: z.number().int().min(60).max(500),
      workspaceBusinessName: z.string().nullable(),
      whatYouSell: z.string().nullable(),
      offerType: z.string().nullable(),
      callToAction: z.string().min(1),
      companyName: z.string().nullable(),
      domain: z.string().nullable(),
      companySummary: z.string().nullable(),
      painPoints: z.array(z.string()).nullable(),
      customInstruction: z.string().nullable(),
      evidenceConfidence: z.number().min(0).max(1).nullable(),
    });
    const i = inputSchema.parse(req.input);
    const prompt = outreachBodyPrompt.build(i as any).prompt;
    const ai = await runStructuredJson({
      model,
      temperature: 0.2,
      maxOutputTokens: 900,
      schemaName: "DraxionOutreachBody",
      jsonSchema: OUTREACH_BODY_JSON_SCHEMA as any,
      prompt,
      parse: (json) => outreachBodySchema.parse(json),
    });
    return { ok: true, useCase: req.useCase, data: ai.parsed, meta: { model: ai.model, usage: ai.usage } };
  }

  // lead_score
  const inputSchema = z.object({
    language: localeSchema,
    whatYouSell: z.string().min(1),
    targetCustomerDescription: z.string().nullable(),
    offerType: z.string().nullable(),
    callToAction: z.string().min(1),
    companyName: z.string().min(1),
    domain: z.string().optional().default(""),
    enrichmentJson: z.string().min(2),
  });
  const i = inputSchema.parse(req.input);
  const prompt = leadScoringPrompt.build(i as any).prompt;
  const ai = await runStructuredJson({
    model,
    temperature: 0.2,
    maxOutputTokens: 500,
    schemaName: "DraxionLeadScore",
    jsonSchema: LEAD_SCORE_JSON_SCHEMA as any,
    prompt,
    parse: (json) => leadScoreSchema.parse(json),
  });
  return { ok: true, useCase: req.useCase, data: ai.parsed, meta: { model: ai.model, usage: ai.usage } };
}

