import { LeadEnrichmentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { normalizeDomain } from "@/lib/leads/normalize";
import { cleanAndTruncateText, extractVisibleText, fetchHomepageHtml, findLikelyPageUrls } from "@/lib/enrichment/html";
import { websiteEnrichmentExtractionPrompt } from "@/lib/ai/prompts/website-enrichment-extraction";
import { runStructuredJson } from "@/lib/ai/client";
import { websiteEnrichmentSchema } from "@/lib/ai/schemas";

function backoffMs(attempt: number) {
  return 500 * Math.pow(2, attempt);
}

async function retry<T>(fn: () => Promise<T>, attempts: number) {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, backoffMs(i)));
    }
  }
  throw lastErr;
}

function pickHomepageUrl(company: { websiteUrl: string | null; domain: string | null }) {
  if (company.websiteUrl) return company.websiteUrl;
  const domain = normalizeDomain(company.domain ?? null);
  return domain ? `https://${domain}` : null;
}

export async function enrichLeadById(params: { workspaceId: string; leadId: string }) {
  const lead = await prisma.lead.findFirst({
    where: { id: params.leadId, workspaceId: params.workspaceId },
    include: { company: true, enrichments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!lead) return { ok: false as const, error: "NOT_FOUND" as const };
  if (!lead.company) return { ok: false as const, error: "NO_COMPANY" as const };

  const homepageUrl = pickHomepageUrl({ websiteUrl: lead.company.websiteUrl, domain: lead.company.domain });
  if (!homepageUrl) return { ok: false as const, error: "NO_WEBSITE" as const };

  const enrichment = await prisma.leadEnrichment.create({
    data: {
      workspaceId: params.workspaceId,
      leadId: lead.id,
      companyId: lead.companyId,
      status: LeadEnrichmentStatus.RUNNING,
      input: { homepageUrl },
    },
  });

  try {
    const fetched = await retry(() => fetchHomepageHtml(homepageUrl).then((r) => {
      if (!r.ok) throw new Error(`FETCH_${r.error}`);
      return r;
    }), 2);

    const extracted = extractVisibleText(fetched.html);
    const cleaned = cleanAndTruncateText(extracted, 22_000);
    const links = findLikelyPageUrls(homepageUrl, fetched.html);

    const prompt = websiteEnrichmentExtractionPrompt.build({
      homepageUrl,
      domain: normalizeDomain(lead.company.domain ?? lead.company.websiteUrl ?? null),
      contactPageUrlDetected: links.contactPageUrl,
      pricingPageUrlDetected: links.pricingPageUrl,
      cleanedVisibleText: cleaned,
    }).prompt;

    const ai = await retry(
      () =>
        runStructuredJson({
          model: process.env.OPENAI_ENRICH_MODEL ?? "gpt-4o-mini",
          temperature: 0.2,
          maxOutputTokens: 800,
          schemaName: "DraxionWebsiteEnrichment",
          jsonSchema: {
            type: "object",
            additionalProperties: false,
            properties: {
              companySummary: { type: "string" },
              likelyIndustry: { type: "string" },
              likelyServicesOrProducts: { type: "array", items: { type: "string" } },
              targetAudience: { type: "array", items: { type: "string" } },
              possiblePainPoints: { type: "array", items: { type: "string" } },
              websiteLanguages: {
                type: "array",
                items: { type: "string", enum: ["et", "en", "ru"] },
                minItems: 1,
                maxItems: 3,
              },
              locationClues: { type: "array", items: { type: "string" } },
              contactPageUrl: { anyOf: [{ type: "string" }, { type: "null" }] },
              pricingPageUrl: { anyOf: [{ type: "string" }, { type: "null" }] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
            required: [
              "companySummary",
              "likelyIndustry",
              "likelyServicesOrProducts",
              "targetAudience",
              "possiblePainPoints",
              "websiteLanguages",
              "locationClues",
              "contactPageUrl",
              "pricingPageUrl",
              "confidence",
            ],
          },
          prompt,
          parse: (json) => websiteEnrichmentSchema.parse(json),
        }),
      2,
    );

    await prisma.leadEnrichment.update({
      where: { id: enrichment.id },
      data: {
        status: LeadEnrichmentStatus.COMPLETE,
        input: {
          homepageUrl,
          contentType: fetched.contentType,
          bytes: fetched.bytes,
          extractedTextLen: extracted.length,
          cleanedTextLen: cleaned.length,
          links,
          rawHtml: fetched.html,
          extractedText: extracted,
          cleanedText: cleaned,
        },
        output: ai.parsed as any,
        model: ai.model ?? undefined,
        prompt,
        completion: ai.rawText,
        tokensIn: ai.usage?.input_tokens ?? undefined,
        tokensOut: ai.usage?.output_tokens ?? undefined,
        error: null,
      },
    });

    return { ok: true as const, enrichmentId: enrichment.id };
  } catch (e: any) {
    await prisma.leadEnrichment.update({
      where: { id: enrichment.id },
      data: {
        status: LeadEnrichmentStatus.FAILED,
        error: e?.message ?? "Enrichment failed",
      },
    });
    return { ok: false as const, error: "FAILED" as const };
  }
}

export async function bulkEnrichLeads(params: { workspaceId: string; leadIds: string[] }) {
  const results: { leadId: string; ok: boolean }[] = [];
  for (const leadId of params.leadIds.slice(0, 50)) {
    const r = await enrichLeadById({ workspaceId: params.workspaceId, leadId });
    results.push({ leadId, ok: r.ok });
  }
  return results;
}

