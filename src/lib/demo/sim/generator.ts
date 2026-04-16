import type { DemoAnalysisResponse, DemoRequestBody } from "@/lib/demo/types";
import { resolveScenario, makeSeed, rngFor, simulateEnrichment, simulateEmailBody, simulateScore, simulateSubject, localizedAngle } from "@/lib/demo/sim/mappers";

function langLabel(lang: "et" | "en" | "ru"): string {
  if (lang === "ru") return "Русский";
  if (lang === "en") return "English";
  return "Eesti";
}

function campaignCopy(lang: "et" | "en" | "ru") {
  if (lang === "ru") {
    return {
      statusLabel: "Готово в превью",
      messageType: "Холодное intro (письмо 1)",
      sendReadiness: "Отправка после подтверждения",
    };
  }
  if (lang === "en") {
    return {
      statusLabel: "Ready in preview",
      messageType: "Cold intro (email 1)",
      sendReadiness: "Send after approval",
    };
  }
  return {
    statusLabel: "Valmis eelvaates",
    messageType: "Külm sissejuhatus (1. kiri)",
    sendReadiness: "Saatmiseks pärast kinnitust",
  };
}

function defaultCta(lang: "et" | "en" | "ru"): string {
  if (lang === "ru") return "Короткий 15-минутный звонок или ответ на это письмо.";
  if (lang === "en") return "A short 15-minute call or a reply to this email.";
  return "Lühike 15-minutine kõne või vastus sellele kirjale.";
}

export function simulateDemoAnalysis(req: DemoRequestBody): DemoAnalysisResponse {
  const scenario = resolveScenario({
    companyName: req.companyName,
    websiteUrl: req.websiteUrl,
    whatYouSell: req.whatYouSell,
    scenarioHint: req.scenarioHint ?? null,
  });

  const seed = makeSeed({
    companyName: req.companyName,
    websiteUrl: req.websiteUrl,
    whatYouSell: req.whatYouSell,
    language: req.language,
    tone: req.tone,
    variantSalt: req.variantSalt ?? 0,
    scenarioId: scenario.id,
  });
  const rng = rngFor(seed);

  const enrichment =
    req.continuation?.enrichment ??
    simulateEnrichment({
      scenario,
      rng,
      lang: req.language,
      companyName: req.companyName,
      websiteUrl: req.websiteUrl,
      whatYouSell: req.whatYouSell,
    });

  const angle = localizedAngle(rng, scenario);
  const subject = simulateSubject({ rng, lang: req.language, companyName: req.companyName, angle });
  const body = simulateEmailBody({
    rng,
    lang: req.language,
    tone: req.tone,
    companyName: req.companyName,
    whatYouSell: req.whatYouSell,
    angle,
    painPoints: enrichment.possiblePainPoints,
    cta: defaultCta(req.language),
  });

  const score = simulateScore({ confidence: enrichment.confidence, painCount: enrichment.possiblePainPoints.length, rng });
  const scoreWhy =
    req.language === "ru"
      ? `Скор ${score}/100: понятная ниша, боли и угол сообщения. Уверенность ${Math.round(enrichment.confidence * 100)}%.`
      : req.language === "en"
        ? `Score ${score}/100: clear niche, pains, and message angle. Confidence ${Math.round(enrichment.confidence * 100)}%.`
        : `Skoor ${score}/100: selge nišš, valupunktid ja sõnuminurk. Kindlus ${Math.round(enrichment.confidence * 100)}%.`;

  const detectedLang = `${enrichment.websiteLanguages.map((l) => l.toUpperCase()).join(", ")} · ${langLabel(req.language)}`;
  const camp = campaignCopy(req.language);
  const opportunities = enrichment.targetAudience.slice(0, 4);

  return {
    company: {
      name: req.companyName,
      likelyIndustry: enrichment.likelyIndustry,
      summary: enrichment.companySummary,
      detectedLanguage: detectedLang,
      region: enrichment.locationClues[0] ?? "—",
      confidence: enrichment.confidence,
    },
    painPoints: enrichment.possiblePainPoints.slice(0, 5),
    websiteFindings: scenario.websiteFindings.slice(0, 4),
    outreachOpportunities: scenario.opportunities.slice(0, 4),
    whyFit: scenario.opportunities[0] ?? enrichment.companySummary.slice(0, 220),
    messageAngle: angle,
    generatedEmail: { subject, body },
    leadScore: score,
    leadScoreWhy: scoreWhy,
    campaignPreview: {
      statusLabel: camp.statusLabel,
      language: req.language.toUpperCase(),
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
      fetchedFromUrl: req.continuation?.fetchedFromUrl ?? null,
    },
  };
}

