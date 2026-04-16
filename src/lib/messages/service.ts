import { prisma } from "@/lib/db";
import { normalizeDomain } from "@/lib/leads/normalize";
import { qaMessage } from "@/lib/messages/qa";
import type { MessageChannel, MessageLength, MessageLocale, MessageStyle, MessageTone } from "@/lib/messages/types";
import { runStructuredJson } from "@/lib/ai/client";
import { outreachBodySchema } from "@/lib/ai/schemas";
import { outreachBodyPrompt } from "@/lib/ai/prompts/outreach-body-generation";
import type { WebsiteEnrichment } from "@/lib/ai/schemas";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(fn: () => Promise<T>, attempts: number) {
  let last: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await sleep(400 * Math.pow(2, i));
    }
  }
  throw last;
}

export async function generateOutreachMessage(params: {
  channel: MessageChannel; // EMAIL only in V1
  style: MessageStyle;
  tone: MessageTone;
  length: MessageLength;
  language: MessageLocale;
  workspaceId: string;
  leadId: string;
  customInstruction?: string | null;
}) {
  // Load lead + workspace settings + last enrichment.
  const [lead, settings, enrichment] = await Promise.all([
    prisma.lead.findFirst({
      where: { id: params.leadId, workspaceId: params.workspaceId },
      include: { company: true },
    }),
    prisma.workspaceSettings.findUnique({
      where: { workspaceId: params.workspaceId },
    }),
    prisma.leadEnrichment.findFirst({
      where: { leadId: params.leadId, workspaceId: params.workspaceId, status: "COMPLETE" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!lead) return { ok: false as const, error: "NOT_FOUND" as const };

  const companyName = lead.company?.name ?? lead.displayName ?? null;
  const domain = normalizeDomain(lead.company?.domain ?? lead.domain ?? lead.company?.websiteUrl ?? null);

  const enrichmentOutput = (enrichment?.output ?? null) as WebsiteEnrichment | null;

  const wordLimit = params.length === "SHORT" ? 120 : 220;
  const basePrompt = outreachBodyPrompt.build({
    language: params.language,
    style: params.style === "FOLLOW_UP" ? "COLD_INTRO" : (params.style as any),
    tone: params.tone,
    length: params.length,
    wordLimit,
    workspaceBusinessName: settings?.businessName ?? null,
    whatYouSell: settings?.whatYouSell ?? null,
    offerType: settings?.offerType ?? null,
    callToAction: settings?.callToAction ?? null,
    companyName,
    domain,
    companySummary: enrichmentOutput?.companySummary ?? null,
    painPoints: enrichmentOutput?.possiblePainPoints ?? null,
    customInstruction: params.customInstruction ?? null,
    evidenceConfidence: enrichmentOutput?.confidence ?? null,
  }).prompt;

  const first = await retry(
    () =>
      runStructuredJson({
        model: process.env.AI_MESSAGE_MODEL ?? process.env.AI_MODEL ?? "gemini-2.0-flash",
        temperature: 0.2,
        maxOutputTokens: 900,
        schemaName: "DraxionOutreachBody",
        jsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            languageUsed: { type: "string", enum: ["et", "en", "ru"] },
            body: { type: "string" },
            personalizationRationale: { type: "array", items: { type: "string" } },
            confidence: { type: "number", minimum: 0, maximum: 1 },
          },
          required: ["languageUsed", "body", "personalizationRationale", "confidence"],
        },
        prompt: basePrompt,
        parse: (json) => outreachBodySchema.parse(json),
      }),
    2,
  );
  const qa1 = qaMessage({
    channel: "EMAIL",
    style: params.style,
    tone: params.tone,
    length: params.length,
    languageUsed: first.parsed.languageUsed,
    subject: "(subject generated separately)",
    body: first.parsed.body,
    personalizationRationale: first.parsed.personalizationRationale,
    confidenceScore: first.parsed.confidence,
  } as any);

  if (qa1.ok) {
    return {
      ok: true as const,
      output: {
        channel: "EMAIL",
        style: params.style,
        tone: params.tone,
        length: params.length,
        languageUsed: first.parsed.languageUsed,
        subject: "",
        body: first.parsed.body,
        personalizationRationale: first.parsed.personalizationRationale,
        confidenceScore: first.parsed.confidence,
      },
      qa: qa1,
      meta: { model: first.model, usage: first.usage, regenerated: false },
      prompt: basePrompt,
    };
  }

  // One regeneration with stricter guidance + include QA issues to fix.
  const second = await retry(
    () =>
      runStructuredJson({
        model: process.env.AI_MESSAGE_MODEL ?? process.env.AI_MODEL ?? "gemini-2.0-flash",
        temperature: 0.2,
        maxOutputTokens: 900,
        schemaName: "DraxionOutreachBody",
        jsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            languageUsed: { type: "string", enum: ["et", "en", "ru"] },
            body: { type: "string" },
            personalizationRationale: { type: "array", items: { type: "string" } },
            confidence: { type: "number", minimum: 0, maximum: 1 },
          },
          required: ["languageUsed", "body", "personalizationRationale", "confidence"],
        },
        prompt:
          outreachBodyPrompt.build({
            language: params.language,
            style: params.style === "FOLLOW_UP" ? "COLD_INTRO" : (params.style as any),
            tone: params.tone,
            length: params.length,
            wordLimit,
            workspaceBusinessName: settings?.businessName ?? null,
            whatYouSell: settings?.whatYouSell ?? null,
            offerType: settings?.offerType ?? null,
            callToAction: settings?.callToAction ?? null,
            companyName,
            domain,
            companySummary: enrichmentOutput?.companySummary ?? null,
            painPoints: enrichmentOutput?.possiblePainPoints ?? null,
            customInstruction: params.customInstruction ?? null,
            evidenceConfidence: enrichmentOutput?.confidence ?? null,
          }).prompt +
          "\n\nQA findings to fix:\n" +
          qa1.issues.map((i) => `- ${i}`).join("\n") +
          "\n\nRegenerate once, fixing the findings.",
        parse: (json) => outreachBodySchema.parse(json),
      }),
    2,
  );
  const qa2 = qaMessage({
    channel: "EMAIL",
    style: params.style,
    tone: params.tone,
    length: params.length,
    languageUsed: second.parsed.languageUsed,
    subject: "(subject generated separately)",
    body: second.parsed.body,
    personalizationRationale: second.parsed.personalizationRationale,
    confidenceScore: second.parsed.confidence,
  } as any);

  return {
    ok: true as const,
    output: {
      channel: "EMAIL",
      style: params.style,
      tone: params.tone,
      length: params.length,
      languageUsed: second.parsed.languageUsed,
      subject: "",
      body: second.parsed.body,
      personalizationRationale: second.parsed.personalizationRationale,
      confidenceScore: second.parsed.confidence,
    },
    qa: qa2,
    meta: { model: second.model, usage: second.usage, regenerated: true, firstQaIssues: qa1.issues },
    prompt: basePrompt,
  };
}

