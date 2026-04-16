import { websiteEnrichmentExtractionPrompt } from "@/lib/ai/prompts/website-enrichment-extraction";
import { outreachBodyPrompt } from "@/lib/ai/prompts/outreach-body-generation";
import { outreachSubjectPrompt } from "@/lib/ai/prompts/outreach-subject-generation";
import { leadScoringPrompt } from "@/lib/ai/prompts/lead-scoring";
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
  type WebsiteEnrichment,
} from "@/lib/ai/schemas";
import { cleanAndTruncateText, extractVisibleText, fetchHomepageHtml, findLikelyPageUrls } from "@/lib/enrichment/html";
import { normalizeDomain } from "@/lib/leads/normalize";
import { formEnrichmentPrompt } from "@/lib/demo/prompts/form-enrichment-inference";
import type { DemoAnalysisResponse, DemoLanguage, DemoRequestBody, DemoTone } from "@/lib/demo/types";
import { qaMessage } from "@/lib/messages/qa";

// Schemas are centralized in src/lib/ai/json-schemas.ts

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(fn: () => Promise<T>, attempts: number) {
  let last: unknown;
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

function resolveHomepageUrl(websiteUrl: string): string | null {
  const t = websiteUrl.trim();
  if (!t) return null;
  try {
    const u = t.includes("://") ? new URL(t) : new URL(`https://${t}`);
    if (!u.hostname) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function mapDemoTone(t: DemoTone): "FRIENDLY" | "DIRECT" | "SHARP" {
  if (t === "friendly") return "FRIENDLY";
  if (t === "sharp") return "SHARP";
  return "DIRECT";
}

function defaultCta(lang: DemoLanguage): string {
  switch (lang) {
    case "et":
      return "Lühike 15-minutine kõne või vastus sellele kirjale.";
    case "ru":
      return "Короткий 15-минутный звонок или ответ на это письмо.";
    default:
      return "A short 15-minute call or a reply to this email.";
  }
}

function langLabel(lang: DemoLanguage): string {
  switch (lang) {
    case "et":
      return "Eesti";
    case "ru":
      return "Русский";
    default:
      return "English";
  }
}

function campaignCopy(lang: DemoLanguage) {
  switch (lang) {
    case "et":
      return {
        statusLabel: "Valmis eelvaates",
        messageType: "Külm sissejuhatus (1. kiri)",
        sendReadiness: "Saatmiseks pärast kinnitust",
      };
    case "ru":
      return {
        statusLabel: "Готово в превью",
        messageType: "Холодное intro (письмо 1)",
        sendReadiness: "Отправка после подтверждения",
      };
    default:
      return {
        statusLabel: "Ready in preview",
        messageType: "Cold intro (email 1)",
        sendReadiness: "Send after approval",
      };
  }
}

function websiteFindingsFromEnrichment(enrichment: WebsiteEnrichment, lang: DemoLanguage): string[] {
  const services = enrichment.likelyServicesOrProducts.slice(0, 3);
  const langs = enrichment.websiteLanguages.join(", ").toUpperCase();
  const contact = enrichment.contactPageUrl;
  const pricing = enrichment.pricingPageUrl;

  if (lang === "et") {
    return [
      ...services.map((s) => `Teenus / pakkumine: ${s}`),
      `Veebi keeled (hinnang): ${langs}`,
      contact ? `Kontakt: leitud URL` : `Kontakt: ei tuvastatud usaldusväärset URL-i`,
      pricing ? `Hinnakiri: leitud URL` : null,
    ].filter(Boolean) as string[];
  }
  if (lang === "ru") {
    return [
      ...services.map((s) => `Услуга / продукт: ${s}`),
      `Языки сайта (оценка): ${langs}`,
      contact ? `Контакты: URL найден` : `Контакты: URL не выявлен`,
      pricing ? `Прайс: URL найден` : null,
    ].filter(Boolean) as string[];
  }
  return [
    ...services.map((s) => `Service / offer: ${s}`),
    `Site languages (estimate): ${langs}`,
    contact ? `Contact: URL detected` : `Contact: no reliable URL detected`,
    pricing ? `Pricing: URL detected` : null,
  ].filter(Boolean) as string[];
}

async function enrichFromWebsite(homepageUrl: string, domain: string | null, model: string): Promise<WebsiteEnrichment | null> {
  let fetched: Awaited<ReturnType<typeof fetchHomepageHtml>>;
  try {
    fetched = await retry(() => fetchHomepageHtml(homepageUrl), 2);
  } catch {
    // Network/DNS/timeout errors should not kill the demo — fall back to form-only enrichment.
    return null;
  }
  if (!fetched.ok) return null;

  const extracted = extractVisibleText(fetched.html);
  const cleaned = cleanAndTruncateText(extracted, 22_000);
  const links = findLikelyPageUrls(homepageUrl, fetched.html);

  const prompt =
    websiteEnrichmentExtractionPrompt.build({
      homepageUrl,
      domain,
      contactPageUrlDetected: links.contactPageUrl,
      pricingPageUrlDetected: links.pricingPageUrl,
      cleanedVisibleText: cleaned,
    }).prompt + "\n\nReturn ONLY a single valid JSON object matching the schema. No markdown, no extra text.";

  const ai = await retry(
    () =>
      runStructuredJson({
        model,
        temperature: 0.15,
        maxOutputTokens: 1200,
        schemaName: "DraxionWebsiteEnrichment",
        jsonSchema: WEBSITE_ENRICHMENT_JSON_SCHEMA,
        prompt,
        parse: (json) => websiteEnrichmentSchema.parse(json),
      }),
    2,
  );
  return ai.parsed;
}

async function enrichFromForm(input: DemoRequestBody, model: string): Promise<WebsiteEnrichment> {
  const domain = normalizeDomain(input.websiteUrl);
  const prompt =
    formEnrichmentPrompt.build({
      companyName: input.companyName,
      domain,
      whatYouSell: input.whatYouSell,
      language: input.language,
    }).prompt + "\n\nReturn ONLY a single valid JSON object matching the schema. No markdown, no extra text.";

  const ai = await retry(
    () =>
      runStructuredJson({
        model,
        temperature: 0.15,
        maxOutputTokens: 1200,
        schemaName: "DraxionWebsiteEnrichment",
        jsonSchema: WEBSITE_ENRICHMENT_JSON_SCHEMA,
        prompt,
        parse: (json) => websiteEnrichmentSchema.parse(json),
      }),
    2,
  );
  return ai.parsed;
}

// Schemas are centralized in src/lib/ai/json-schemas.ts

export async function runAIDemoPipeline(input: DemoRequestBody): Promise<DemoAnalysisResponse> {
  const configuredBaseModel = process.env.AI_MODEL ?? "gemini-2.0-flash";
  // Preview models occasionally ignore/violate JSON mode. Keep the public demo reliable.
  const baseModel = /preview/i.test(configuredBaseModel) ? "gemini-2.0-flash" : configuredBaseModel;
  const enrichModel = /preview/i.test(process.env.AI_ENRICH_MODEL ?? "")
    ? "gemini-2.0-flash"
    : (process.env.AI_ENRICH_MODEL ?? baseModel);
  const msgModel = /preview/i.test(process.env.AI_MESSAGE_MODEL ?? "")
    ? "gemini-2.0-flash"
    : (process.env.AI_MESSAGE_MODEL ?? baseModel);
  const scoreModel = /preview/i.test(process.env.AI_SCORE_MODEL ?? "")
    ? "gemini-2.0-flash"
    : (process.env.AI_SCORE_MODEL ?? msgModel);
  const domain = normalizeDomain(input.websiteUrl);
  const isVercel = Boolean(process.env.VERCEL);
  const attempts = isVercel ? 1 : 2;

  let enrichment: WebsiteEnrichment;
  let fetchedFromUrl: string | null = null;

  if (input.continuation?.enrichment) {
    enrichment = input.continuation.enrichment;
    fetchedFromUrl = input.continuation.fetchedFromUrl ?? null;
  } else {
    const homepageUrl = resolveHomepageUrl(input.websiteUrl);
    if (homepageUrl) {
      const fromWeb = await enrichFromWebsite(homepageUrl, domain, enrichModel);
      if (fromWeb) {
        enrichment = fromWeb;
        fetchedFromUrl = homepageUrl;
      } else {
        enrichment = await enrichFromForm(input, enrichModel);
        fetchedFromUrl = null;
      }
    } else {
      enrichment = await enrichFromForm(input, enrichModel);
      fetchedFromUrl = null;
    }
  }

  const tone = mapDemoTone(input.tone);
  const wordLimit = 220;
  const salt = input.variantSalt ?? 0;
  const variationNote =
    salt > 0
      ? input.language === "et"
        ? `Variatsioon ${salt}: vali teine konkreetne haak; ära korda eelmisi fraase.`
        : input.language === "ru"
          ? `Вариация ${salt}: другой конкретный крючок; не повторяй прежние формулировки.`
          : `Variation ${salt}: use a different concrete hook; do not repeat earlier phrasing.`
      : "";

  const subjectContext = [enrichment.companySummary, variationNote].filter(Boolean).join("\n\n");

  const subjectAiPromise = retry(
    () =>
      runStructuredJson({
        model: msgModel,
        temperature: 0.2,
        maxOutputTokens: 200,
        schemaName: "DraxionOutreachSubject",
        jsonSchema: OUTREACH_SUBJECT_JSON_SCHEMA,
        prompt: outreachSubjectPrompt.build({
          language: input.language,
          companyName: input.companyName,
          domain: domain ?? "",
          oneLineContext: subjectContext,
          callToAction: defaultCta(input.language),
          style: "COLD_INTRO",
        }).prompt,
        parse: (json) => outreachSubjectSchema.parse(json),
      }),
    attempts,
  );

  const bodyAiPromise = retry(
    () =>
      runStructuredJson({
        model: msgModel,
        temperature: 0.2,
        maxOutputTokens: 900,
        schemaName: "DraxionOutreachBody",
        jsonSchema: OUTREACH_BODY_JSON_SCHEMA,
        prompt: outreachBodyPrompt.build({
          language: input.language,
          style: "COLD_INTRO",
          tone,
          length: "MEDIUM",
          wordLimit,
          workspaceBusinessName: null,
          whatYouSell: input.whatYouSell,
          offerType: null,
          callToAction: defaultCta(input.language),
          companyName: input.companyName,
          domain: domain ?? "",
          companySummary: enrichment.companySummary,
          painPoints: enrichment.possiblePainPoints,
          customInstruction: variationNote || null,
          evidenceConfidence: enrichment.confidence,
        }).prompt,
        parse: (json) => outreachBodySchema.parse(json),
      }),
    attempts,
  );

  const scoreAiPromise = retry(
    () =>
      runStructuredJson({
        model: scoreModel,
        temperature: 0.2,
        maxOutputTokens: 500,
        schemaName: "DraxionLeadScore",
        jsonSchema: LEAD_SCORE_JSON_SCHEMA,
        prompt: leadScoringPrompt.build({
          language: input.language,
          whatYouSell: input.whatYouSell,
          targetCustomerDescription: null,
          offerType: null,
          callToAction: defaultCta(input.language),
          companyName: input.companyName,
          domain: domain ?? "",
          enrichmentJson: JSON.stringify(enrichment),
        }).prompt,
        parse: (json) => leadScoreSchema.parse(json),
      }),
    attempts,
  );

  let [subjectAi, bodyAi, scoreAi] = await Promise.all([subjectAiPromise, bodyAiPromise, scoreAiPromise]);

  let qa = qaMessage({
    subject: subjectAi.parsed.subject,
    body: bodyAi.parsed.body,
    length: "MEDIUM",
  });

  // Re-running body generation is expensive and often pushes Vercel demos into timeouts.
  // Keep the demo snappy: only do a second pass outside of Vercel.
  if (!qa.ok && !isVercel) {
    bodyAi = await retry(
      () =>
        runStructuredJson({
          model: msgModel,
          temperature: 0.2,
          maxOutputTokens: 900,
          schemaName: "DraxionOutreachBody",
          jsonSchema: OUTREACH_BODY_JSON_SCHEMA,
          prompt:
            outreachBodyPrompt.build({
              language: input.language,
              style: "COLD_INTRO",
              tone,
              length: "MEDIUM",
              wordLimit,
              workspaceBusinessName: null,
              whatYouSell: input.whatYouSell,
              offerType: null,
              callToAction: defaultCta(input.language),
              companyName: input.companyName,
              domain: domain ?? "",
              companySummary: enrichment.companySummary,
              painPoints: enrichment.possiblePainPoints,
              customInstruction: variationNote || null,
              evidenceConfidence: enrichment.confidence,
            }).prompt +
            "\n\nQA issues to fix:\n" +
            qa.issues.map((i) => `- ${i}`).join("\n"),
          parse: (json) => outreachBodySchema.parse(json),
        }),
      attempts,
    );
    qa = qaMessage({
      subject: subjectAi.parsed.subject,
      body: bodyAi.parsed.body,
      length: "MEDIUM",
    });
  }

  const camp = campaignCopy(input.language);
  const siteLangs = enrichment.websiteLanguages.map((l) => l.toUpperCase()).join(", ");

  const opportunities = enrichment.targetAudience.slice(0, 4);
  const whyFit = scoreAi.parsed.reasons[0] ?? enrichment.companySummary.slice(0, 240);
  const messageAngle =
    bodyAi.parsed.personalizationRationale[0] ?? scoreAi.parsed.reasons[0] ?? enrichment.companySummary.slice(0, 200);

  return {
    company: {
      name: input.companyName,
      likelyIndustry: enrichment.likelyIndustry,
      summary: enrichment.companySummary,
      detectedLanguage: siteLangs ? `${siteLangs} · ${langLabel(input.language)}` : langLabel(input.language),
      region: enrichment.locationClues[0] ?? "—",
      confidence: enrichment.confidence,
    },
    painPoints: enrichment.possiblePainPoints.slice(0, 5),
    websiteFindings: websiteFindingsFromEnrichment(enrichment, input.language),
    outreachOpportunities: opportunities,
    whyFit,
    messageAngle,
    generatedEmail: {
      subject: subjectAi.parsed.subject,
      body: bodyAi.parsed.body,
    },
    leadScore: scoreAi.parsed.score,
    leadScoreWhy: scoreAi.parsed.reasons.slice(0, 4).join(" "),
    campaignPreview: {
      statusLabel: camp.statusLabel,
      language: input.language.toUpperCase(),
      messageType: camp.messageType,
      sendReadiness: camp.sendReadiness,
      stages: [
        { key: "analyze", done: true },
        { key: "enrich", done: true },
        { key: "compose", done: true },
        { key: "approve", done: false },
        { key: "send", done: false },
      ],
    },
    continuation: {
      enrichment,
      fetchedFromUrl,
    },
  };
}

