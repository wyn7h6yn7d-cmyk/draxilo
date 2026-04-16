import type { DemoLanguage, DemoTone } from "@/lib/demo/types";
import { getScenarioById, DEMO_SCENARIOS } from "@/lib/demo/sim/scenarios";
import type { DemoScenario, DemoScenarioId } from "@/lib/demo/sim/types";
import { hashStringToUint32, mulberry32, pick, pickManyUnique, clampInt } from "@/lib/demo/sim/seed";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function stripTrailingSlash(url: string) {
  const t = url.trim();
  if (!t) return "";
  return t.endsWith("/") ? t.slice(0, -1) : t;
}

function guessScenarioFromText(text: string): DemoScenarioId | null {
  const t = normalize(text);
  if (!t) return null;
  if (/(saas|workflow|crm|pipeline|integratsioon|integration|revops|outbound)/i.test(t)) return "b2b_saas";
  if (/(hooldus|korteri|ühist|kinnisvara|sla|avarii|maintenance|property)/i.test(t)) return "maintenance";
  if (/(agentuur|studio|disain|branding|turundus|marketing|agency|creative)/i.test(t)) return "agency";
  if (/(tarn|logistik|tehas|industrial|supplier|rfq|moq|sertifikaat)/i.test(t)) return "industrial_supplier";
  if (/(kohalik|teenus|service|remont|puhastus|plumber|electric)/i.test(t)) return "local_service";
  return null;
}

export function resolveScenario(params: {
  companyName: string;
  websiteUrl: string;
  whatYouSell: string;
  scenarioHint?: DemoScenarioId | null;
}): DemoScenario {
  const hint = params.scenarioHint ? getScenarioById(params.scenarioHint) : null;
  if (hint) return hint;
  const fromSell = guessScenarioFromText(params.whatYouSell);
  if (fromSell) return getScenarioById(fromSell) ?? DEMO_SCENARIOS[0]!;
  const fromUrl = guessScenarioFromText(params.websiteUrl);
  if (fromUrl) return getScenarioById(fromUrl) ?? DEMO_SCENARIOS[0]!;
  const fromName = guessScenarioFromText(params.companyName);
  if (fromName) return getScenarioById(fromName) ?? DEMO_SCENARIOS[0]!;
  return DEMO_SCENARIOS[0]!;
}

export function makeSeed(input: {
  companyName: string;
  websiteUrl: string;
  whatYouSell: string;
  language: DemoLanguage;
  tone: DemoTone;
  variantSalt?: number;
  scenarioId: string;
}) {
  return hashStringToUint32(
    [
      input.scenarioId,
      input.language,
      input.tone,
      String(input.variantSalt ?? 0),
      input.companyName,
      input.websiteUrl,
      input.whatYouSell,
    ].join("|"),
  );
}

export function simulateConfidence(rng: () => number) {
  // Keep demo confidence high but not perfect.
  return Math.max(0.62, Math.min(0.9, 0.72 + (rng() - 0.5) * 0.22));
}

export function simulateScore(params: { confidence: number; painCount: number; rng: () => number }) {
  const base = 56 + params.confidence * 30;
  const boost = Math.min(14, params.painCount * 2);
  const jitter = (params.rng() - 0.5) * 6;
  return clampInt(base + boost + jitter, 42, 92);
}

export function localizedIndustry(s: DemoScenario, lang: DemoLanguage) {
  if (lang === "ru") return s.defaultIndustry.ru;
  if (lang === "en") return s.defaultIndustry.en;
  return s.defaultIndustry.et;
}

export function localizedAngle(rng: () => number, s: DemoScenario) {
  return pick(rng, s.messageAngles);
}

export function simulateEnrichment(params: {
  scenario: DemoScenario;
  rng: () => number;
  lang: DemoLanguage;
  companyName: string;
  websiteUrl: string;
  whatYouSell: string;
}) {
  const confidence = simulateConfidence(params.rng);
  const services = pickManyUnique(params.rng, params.scenario.servicesOrProducts, 4);
  const painPoints = pickManyUnique(params.rng, params.scenario.painPoints, 4);
  const audiences = pickManyUnique(params.rng, params.scenario.targetAudiences, 4);

  // Make the summary feel tailored by blending scenario + form inputs.
  const summarySeed = [
    params.whatYouSell.trim() ? `Fookus: ${params.whatYouSell.trim()}` : null,
    audiences[0] ? `Siht: ${audiences[0]}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const companySummary =
    params.lang === "et"
      ? `${params.companyName} — ${localizedIndustry(params.scenario, params.lang)}. ${summarySeed || "Selge pakkumine ja sihtrühm, kuid kommunikatsioon vajab teravust."}`
      : params.lang === "ru"
        ? `${params.companyName} — ${localizedIndustry(params.scenario, params.lang)}. ${summarySeed || "Позиционирование понятное, но сообщение можно усилить."}`
        : `${params.companyName} — ${localizedIndustry(params.scenario, params.lang)}. ${summarySeed || "Clear offer and audience; messaging can be sharpened."}`;

  const websiteLanguages: DemoLanguage[] =
    params.lang === "et" ? ["et", "en"] : params.lang === "ru" ? ["ru", "en"] : ["en"];

  return {
    companySummary: companySummary.slice(0, 780),
    likelyIndustry: localizedIndustry(params.scenario, params.lang).slice(0, 110),
    likelyServicesOrProducts: services,
    targetAudience: audiences,
    possiblePainPoints: painPoints,
    websiteLanguages,
    locationClues: pickManyUnique(params.rng, params.scenario.regions, 2),
    contactPageUrl: params.websiteUrl.trim() ? `${stripTrailingSlash(params.websiteUrl)}/contact` : null,
    pricingPageUrl: params.websiteUrl.trim() ? `${stripTrailingSlash(params.websiteUrl)}/pricing` : null,
    confidence,
  };
}

function greeting(lang: DemoLanguage, tone: DemoTone) {
  if (lang === "ru") return tone === "friendly" ? "Привет!" : tone === "sharp" ? "Здравствуйте." : "Добрый день.";
  if (lang === "en") return tone === "friendly" ? "Hi!" : tone === "sharp" ? "Hello," : "Hi,";
  return tone === "friendly" ? "Tere!" : tone === "sharp" ? "Tere." : "Tere,";
}

function signoff(lang: DemoLanguage, tone: DemoTone) {
  if (lang === "ru") return tone === "friendly" ? "Спасибо!\n— Draxion" : "С уважением,\n— Draxion";
  if (lang === "en") return tone === "friendly" ? "Thanks,\n— Draxion" : "Best,\n— Draxion";
  return tone === "friendly" ? "Aitäh!\n— Draxion" : "Parimat,\n— Draxion";
}

export function simulateSubject(params: { rng: () => number; lang: DemoLanguage; companyName: string; angle: string }) {
  const variants =
    params.lang === "et"
      ? [
          `Kiire mõte: ${params.companyName}`,
          `${params.companyName} — ${params.angle}`,
          `Kas see sobib: ${params.angle}?`,
        ]
      : params.lang === "ru"
        ? [
            `Идея для: ${params.companyName}`,
            `${params.companyName} — ${params.angle}`,
            `Подойдёт ли: ${params.angle}?`,
          ]
        : [`Quick idea for ${params.companyName}`, `${params.companyName} — ${params.angle}`, `Would this help: ${params.angle}?`];
  return pick(params.rng, variants).slice(0, 110);
}

export function simulateEmailBody(params: {
  rng: () => number;
  lang: DemoLanguage;
  tone: DemoTone;
  companyName: string;
  whatYouSell: string;
  angle: string;
  painPoints: string[];
  cta: string;
}) {
  const pain = params.painPoints[0] ?? "";
  const opener =
    params.lang === "et"
      ? [
          `${greeting(params.lang, params.tone)} Vaatasin ${params.companyName} konteksti ja jäin mõtlema ühele lihtsale võidule.`,
          `${greeting(params.lang, params.tone)} Kiire küsimus ${params.companyName} kohta — kas see on teil hetkel teema?`,
        ]
      : params.lang === "ru"
        ? [
            `${greeting(params.lang, params.tone)} Быстро посмотрел контекст ${params.companyName} — есть одна понятная точка улучшения.`,
            `${greeting(params.lang, params.tone)} Вопрос по ${params.companyName}: это сейчас актуально?`,
          ]
        : [
            `${greeting(params.lang, params.tone)} I looked at ${params.companyName} and there’s one straightforward win.`,
            `${greeting(params.lang, params.tone)} Quick question about ${params.companyName} — is this relevant right now?`,
          ];

  const middle =
    params.lang === "et"
      ? [
          `Kui ${pain ? pain.toLowerCase() : "kvaliteet ja järjepidevus"} on oluline, siis ${params.angle.toLowerCase()} annab tavaliselt kiire efekti.`,
          `Tihti piisab, kui teha signaal → kontekst → sõnum töövoog ühtlaseks — nii et iga pöördumine tundub kirjutatud “just nendele”.`,
        ]
      : params.lang === "ru"
        ? [
            `Если важна тема “${pain}”, то подход “${params.angle}” обычно даёт быстрый эффект.`,
            `Обычно достаточно выстроить поток сигнал → контекст → сообщение — чтобы каждое письмо звучало “про них”.`,
          ]
        : [
            `If “${pain || "consistency"}” matters, an angle like “${params.angle}” often moves the needle quickly.`,
            `Usually it’s about tightening signal → context → message so every touchpoint feels written just for them.`,
          ];

  const close =
    params.lang === "et"
      ? [`Kui tahad, saadan 2–3 konkreetset näidet teie valdkonna keeles. ${params.cta}`, `Sobib, kui võtame 15 min ja paneme paika nurga + järgmised sammud?`]
      : params.lang === "ru"
        ? [`Если хотите, пришлю 2–3 примера под вашу нишу. ${params.cta}`, `Ок, если созвонимся на 15 минут и зафиксируем угол + следующие шаги?`]
        : [`If helpful, I can send 2–3 examples tailored to your niche. ${params.cta}`, `Open to a quick 15-minute call to lock the angle + next steps?`];

  const body = [pick(params.rng, opener), "", pick(params.rng, middle), "", pick(params.rng, close), "", signoff(params.lang, params.tone)].join(
    "\n",
  );
  return body;
}

export function rngFor(seed: number) {
  return mulberry32(seed);
}

