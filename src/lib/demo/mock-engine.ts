import type { WebsiteEnrichment } from "@/lib/ai/schemas";

import type { DemoAnalysisResponse, DemoLanguage, DemoRequestBody, DemoTone } from "./types";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]!;
}

type Vertical = "energy" | "agency" | "saas" | "local" | "generic";

type CopyPack = {
  regions: string[];
  painEnergy: string[];
  painAgency: string[];
  painSaas: string[];
  painLocal: string[];
  painGeneric: string[];
  webEnergy: string[];
  webAgency: string[];
  webSaas: string[];
  webLocal: string[];
  webGeneric: string[];
  oppEnergy: string[];
  oppAgency: string[];
  oppSaas: string[];
  oppLocal: string[];
  oppGeneric: string[];
  industries: Record<Vertical, string>;
  summaries: (ctx: { company: string; sell: string; ind: string }) => string;
  whyFit: (ctx: { company: string; sell: string; ind: string }) => string;
  angle: (ctx: { tone: DemoTone; sell: string; ind: string }) => string;
  email: (ctx: {
    tone: DemoTone;
    company: string;
    sell: string;
    ind: string;
    domain: string;
    salt: number;
  }) => { subject: string; body: string };
  scoreWhy: (score: number, ind: string) => string;
  campaignStatus: string;
  messageType: string;
  readiness: string;
};

const COPY: Record<DemoLanguage, CopyPack> = {
  et: {
    regions: ["Balti regioon", "Põhjamaad", "Euroopa", "Kaugem turg"],
    painEnergy: [
      "Kasvav võimsusvajadus vs. ajakohastamata hooldusgraafikud",
      "CO₂ eesmärgid nõuavad täpsemat tarbimise jälgimist",
      "Lepingute haldus killustatud süsteemides",
    ],
    painAgency: [
      "Projektide marginaalid kannatavad scope creep’i all",
      "Kliendisuhtlus hajutatud Slacki, meili ja trellode vahel",
      "Pakkumiste kvaliteet sõltub liiga palju ühest copywriter’ist",
    ],
    painSaas: [
      "Churn seostub onboarding’i aegluse ja ebaselge väägiga",
      "Sales ja product andmed ei kohtu — ICP segane",
      "Outbound on käsitsi, ilma selge signaalita, kellele kirjutada",
    ],
    painLocal: [
      "Hooajalisus teeb tööjõu planeerimise keeruliseks",
      "Kohalik konkurents surub hindu, eristumine nõrk",
      "Telefon ja e-post ei jõua järgi päringute mahule",
    ],
    painGeneric: [
      "Müügitoru vajab stabiilsemat kõrgkvaliteediliste kohtumiste voogu",
      "Andmed klientidest on killustatud, otsused aeglased",
      "Kasvu planeerimine bez prognoositava pipeline’i",
    ],
    webEnergy: [
      "Teenuslehel puudub selge CTA suurklientidele",
      "Tehnilised juhendid PDF-is, mitte struktureeritud andmetena",
      "Mobiilivaade laguneb pikkade tabelite tõttu",
    ],
    webAgency: [
      "Case study’d on vanad, usaldusväärne sotsiaalne tõend nõrk",
      "Veeb laadib aeglaselt — bounce risk",
      "Kontaktivorm ei kogu kvalifikatsiooniinfot",
    ],
    webSaas: [
      "Hinnakujundus lehel segane, väägtõend nõrk",
      "Integratsioonide loend ei ole filtreeritav rolli järgi",
      "Dokumentatsioon otsinguta — aeglustab müüki",
    ],
    webLocal: [
      "Google’i profiil ja veeb ei ühti (aadress, lahtiolek)",
      "Teenuste kirjeldused liiga üldised",
      "Uuringute / broneeringute voog ei ole ühendatud CRM-iga",
    ],
    webGeneric: [
      "Meta-kirjeldused ja pealkirjad ei võta ICP valu kinni",
      "Sisu on staatiline, vähe tõendeid ja arve",
      "Veeb ei näita selgelt, kellele toode on esmajoones",
    ],
    oppEnergy: [
      "Hoolduslepingute pikendamine ennetava hoolduse paketiga",
      "Ettevõtte energiaaudit kui sissejuhatus suurele raamlepingule",
    ],
    oppAgency: [
      "KVartaalse retainership väikeste e-kaubanduse brändidega",
      "Performance audit →90-päevane kasvuprogramm",
    ],
    oppSaas: [
      "Outbound sari sarnaste ICP-de seas pärast case study’d",
      "Tasuta tööriista kasutajate üleviimine tasulisele kihile",
    ],
    oppLocal: [
      "Kiire reageerimise lisateenus premium-kliendile",
      "Hooaja ettemüügi kampaania koos lokaalse partneriga",
    ],
    oppGeneric: [
      "Külma e-kirja sari juhtidele, kellel on hiljuti rollimuutus",
      "Sündmuse/pakkumise järgne lühike follow-up voog",
    ],
    industries: {
      energy: "Energeetika ja kommunaalteenused",
      agency: "Loov- ja digibüroo",
      saas: "B2B SaaS / tarkvara",
      local: "Kohalik teenusettevõte",
      generic: "B2B teenus / tootmine",
    },
    summaries: ({ company, sell, ind }) =>
      `${company} tegutseb valdkonnas „${ind}“. Põhitegevus keskendub: ${sell}. Veebisignaalid viitavad struktureeritud müügivõimalusele, kui sõnum on konkreetne ja usaldusväärne.`,
    whyFit: ({ company, sell, ind }) =>
      `${company} kombinatsioon (${ind}) ja pakkumine „${sell}“ annab selge haagi: ostuotsuseid mõjutavad tegurid on nähtavad ja sõnum saab olla spetsiifiline, mitte üldine.`,
    angle: ({ tone, sell, ind }) => {
      const base =
        tone === "friendly"
          ? "Kõnetoon inimlik ja koostööline — rõhk kasulikkusel, mitte survvel."
          : tone === "direct"
            ? "Lühike faktipõhine sõnum: probleem → tõend → üks selge järgmine samm."
            : "Terav nurk: konkurentsieelis või risk, mida teadmata jättes jääb võimalus lauale.";
      return `${base} Haak: kuidas ${sell} aitab just ${ind} kontekstis.`;
    },
    email: ({ tone, company, sell, ind, domain, salt }) => {
      const t =
        tone === "friendly"
          ? { o: "Tere!", c: "Kui sobib, võin jagada 2 konkreetset ideed, kuidas seda skaleerida." }
          : tone === "direct"
            ? { o: "Tere,", c: "Kas vaataksite 12-minutilist demo nädala sees?" }
            : { o: "Tere,", c: "Ilma korrektse sõnumita jääb pipeline juhuslikuks — seda saab parandada kiiresti." };
      const subjects = [
        `Ideid ${company} jaoks — ${sell}`,
        `Lühike ettepanek: ${sell} (${ind})`,
        `${company}: üks konkreetne nurk`,
      ];
      const body = `${t.o} Märkasin ${domain} ja seda, et ${company} fokusseerub „${sell}“ peale. ${t.c}

Lühidalt: Draxion aitab leida sarnaseid kontosid, rikastada konteksti ja kirjutada ${ind} jaoks sobiva tooniga sõnumeid — ilma käsitsi copy paste’ta.

Parimate soovidega`;

      return {
        subject: pick(subjects, salt),
        body: body.trim(),
      };
    },
    scoreWhy: (score, ind) =>
      `Skoor ${score} põhineb ICP selgusel, veebisignaalide tugevusel ja sõnumi sobivusel valdkonnale „${ind}“. Demo režiimis on see illustratiivne.`,
    campaignStatus: "Valmis eelvaates",
    messageType: "Külm sissejuhatus (1. kiri)",
    readiness: "Saatmiseks pärast kinnitust",
  },
  en: {
    regions: ["Baltics", "Nordics", "EU", "Broader EU"],
    painEnergy: [
      "Rising capacity needs vs. outdated maintenance schedules",
      "CO₂ targets need finer consumption telemetry",
      "Contract management fragmented across tools",
    ],
    painAgency: [
      "Project margins hurt by scope creep",
      "Client comms split across Slack, email, boards",
      "Proposal quality depends too much on one writer",
    ],
    painSaas: [
      "Churn tied to slow onboarding and fuzzy value proof",
      "Sales and product data don’t meet — ICP drifts",
      "Outbound is manual without a signal on who to contact",
    ],
    painLocal: [
      "Seasonality makes staffing forecasts brittle",
      "Local competition compresses pricing; differentiation weak",
      "Phone and inbox can’t keep up with inbound volume",
    ],
    painGeneric: [
      "Pipeline needs a steadier flow of qualified conversations",
      "Customer context is fragmented; decisions slow",
      "Growth planning without a forecastable top of funnel",
    ],
    webEnergy: [
      "Service pages lack a clear enterprise CTA",
      "Technical specs live in PDFs, not structured content",
      "Mobile layout breaks on long spec tables",
    ],
    webAgency: [
      "Case studies are dated; social proof is thin",
      "Site performance is slow — bounce risk",
      "Contact form doesn’t capture qualification data",
    ],
    webSaas: [
      "Pricing page is confusing; value proof is weak",
      "Integrations list isn’t filterable by buyer role",
      "Docs lack search — slows sales cycles",
    ],
    webLocal: [
      "Google profile and site facts diverge (hours, address)",
      "Service descriptions are too generic",
      "Booking flow isn’t wired to CRM follow-up",
    ],
    webGeneric: [
      "Meta titles don’t capture ICP pain tightly",
      "Content is static; few proof points",
      "Site doesn’t state primary buyer clearly",
    ],
    oppEnergy: [
      "Renew maintenance contracts with a preventive bundle",
      "Energy audit as a wedge into a larger frame agreement",
    ],
    oppAgency: [
      "Quarterly retainer for a cluster of SMB e‑commerce brands",
      "Performance audit → 90‑day growth sprint",
    ],
    oppSaas: [
      "Outbound to look‑alike ICPs after a flagship case study",
      "Convert free‑tool users into paid with a tight sequence",
    ],
    oppLocal: [
      "Priority response tier for premium clients",
      "Seasonal pre‑sale campaign with a local partner",
    ],
    oppGeneric: [
      "Cold outreach to leaders with recent role changes",
      "Post‑event offer with a short follow‑up track",
    ],
    industries: {
      energy: "Energy & utilities",
      agency: "Creative / digital agency",
      saas: "B2B SaaS / software",
      local: "Local services business",
      generic: "B2B services / manufacturing",
    },
    summaries: ({ company, sell, ind }) =>
      `${company} operates in “${ind}”. Core focus: ${sell}. Web signals suggest a structured sales motion if messaging stays specific and credible.`,
    whyFit: ({ company, sell, ind }) =>
      `The pairing of ${company} (${ind}) with “${sell}” gives a sharp hook: buying factors are visible, so outreach can be concrete—not generic.`,
    angle: ({ tone, sell, ind }) => {
      const base =
        tone === "friendly"
          ? "Warm, collaborative tone—lead with usefulness, not pressure."
          : tone === "direct"
            ? "Short fact-led note: problem → proof → one next step."
            : "Sharp angle: edge or risk left on the table if ignored.";
      return `${base} Hook: how ${sell} wins in an ${ind} context.`;
    },
    email: ({ tone, company, sell, ind, domain, salt }) => {
      const t =
        tone === "friendly"
          ? { o: "Hi —", c: "Happy to share two concrete ideas if helpful." }
          : tone === "direct"
            ? { o: "Hi,", c: "Open to a 12‑minute walkthrough this week?" }
            : { o: "Hi,", c: "Without a tight message, pipeline stays random—that’s fixable fast." };
      const subjects = [
        `A few ideas for ${company} — ${sell}`,
        `Quick proposal: ${sell} (${ind})`,
        `${company}: one specific angle`,
      ];
      const body = `${t.o} I noticed ${domain} and that ${company} focuses on “${sell}”. ${t.c}

Briefly: Draxion helps find similar accounts, enrich context, and draft on‑brand outreach—without manual copy‑paste.

Best`;

      return {
        subject: pick(subjects, salt),
        body: body.trim(),
      };
    },
    scoreWhy: (score, ind) =>
      `Score ${score} reflects ICP clarity, web signal strength, and message fit for “${ind}”. Illustrative in demo mode.`,
    campaignStatus: "Ready in preview",
    messageType: "Cold intro (email1)",
    readiness: "Send after approval",
  },
  ru: {
    regions: ["Прибалтика", "Скандинавия", "ЕС", "Шире ЕС"],
    painEnergy: [
      "Рост нагрузки vs. устаревшие графики обслуживания",
      "Цели по CO₂ требуют более точной телеметрии",
      "Договоры размазаны по разным системам",
    ],
    painAgency: [
      "Маржа страдает от расширения scope",
      "Коммуникации в Slack, почте, досках — нет единого контура",
      "Качество предложений зависит от одного автора",
    ],
    painSaas: [
      "Отток связан с медленным онбордингом и размытой ценностью",
      "Данные sales/product не сходятся — ICP плывёт",
      "Аутрич вручную, без сигнала «кому писать»",
    ],
    painLocal: [
      "Сезонность ломает прогноз по персоналу",
      "Локальная конкуренция давит на цену; слабое отличие",
      "Телефон и почта не справляются с потоком заявок",
    ],
    painGeneric: [
      "Воронке нужен стабильный поток квалифицированных встреч",
      "Контекст по клиентам фрагментирован — решения медленные",
      "Рост без прогнозируемого верха воронки",
    ],
    webEnergy: [
      "На услугах нет ясного CTA для крупных клиентов",
      "Спеки в PDF, а не в структурированном виде",
      "Мобильная вёрстка ломается на длинных таблицах",
    ],
    webAgency: [
      "Кейсы устарели; мало социальных доказательств",
      "Сайт медленный — риск отказов",
      "Форма не собирает квалификацию",
    ],
    webSaas: [
      "Страница цен запутана; слабое доказательство ценности",
      "Список интеграций без фильтра по роли покупателя",
      "Доки без поиска — тормозит продажи",
    ],
    webLocal: [
      "Google‑профиль и сайт расходятся (часы, адрес)",
      "Описания услуг слишком общие",
      "Бронирование не связано с CRM",
    ],
    webGeneric: [
      "Meta‑заголовки слабо бьют в боль ICP",
      "Контент статичный; мало доказательств",
      "Не ясно, кому продукт «в первую очередь»",
    ],
    oppEnergy: [
      "Продление сервисных контрактов с пакетом профилактики",
      "Энергоаудит как вход в крупный рамочный контракт",
    ],
    oppAgency: [
      "Квартальный retainer для кластера SMB e‑commerce",
      "Performance‑аудит → 90‑дневный спринт роста",
    ],
    oppSaas: [
      "Аутрич на look‑alike ICP после сильного кейса",
      "Конверсия free‑tool → paid короткой цепочкой",
    ],
    oppLocal: [
      "Приоритетный ответ для premium‑клиентов",
      "Сезонная предпродажа с локальным партнёром",
    ],
    oppGeneric: [
      "Холодная цепочка лидерам после смены роли",
      "Короткий follow‑up после оффера/ивента",
    ],
    industries: {
      energy: "Энергетика и коммунальные услуги",
      agency: "Креативное / digital‑агентство",
      saas: "B2B SaaS / ПО",
      local: "Локальный сервисный бизнес",
      generic: "B2B‑услуги / производство",
    },
    summaries: ({ company, sell, ind }) =>
      `${company} работает в сегменте «${ind}». Фокус: ${sell}. По веб‑сигналам видно структурированную продажу, если сообщение конкретное.`,
    whyFit: ({ company, sell, ind }) =>
      `Сочетание ${company} (${ind}) и предложения «${sell}» даёт чёткий крючок: факторы покупки читаются, письмо может быть предметным.`,
    angle: ({ tone, sell, ind }) => {
      const base =
        tone === "friendly"
          ? "Тёплый тон, упор на пользу без давления."
          : tone === "direct"
            ? "Коротко: проблема → доказательство → один шаг."
            : "Резкий угол: риск или упущенная выгода.";
      return `${base} Крючок: как ${sell} заходит в контексте «${ind}».`;
    },
    email: ({ tone, company, sell, ind, domain, salt }) => {
      const t =
        tone === "friendly"
          ? { o: "Здравствуйте!", c: "Могу прислать 2 конкретные идеи, если интересно." }
          : tone === "direct"
            ? { o: "Здравствуйте,", c: "Удобно 12‑минутный разбор на этой неделе?" }
            : { o: "Здравствуйте,", c: "Без чёткого сообщения воронка остаётся случайной — это быстро чинится." };
      const subjects = [
        `Идеи для ${company} — ${sell}`,
        `Короткое предложение: ${sell} (${ind})`,
        `${company}: один конкретный угол`,
      ];
      const body = `${t.o} Заметил(а) ${domain}: ${company} фокусируется на «${sell}». ${t.c}

Коротко: Draxion помогает находить похожие компании, обогащать контекст и писать outreach в нужном тоне — без ручного копипаста.

С уважением`;

      return {
        subject: pick(subjects, salt),
        body: body.trim(),
      };
    },
    scoreWhy: (score, ind) =>
      `Оценка ${score} отражает ясность ICP, силу веб‑сигналов и fit сообщения для «${ind}». В демо это иллюстративно.`,
    campaignStatus: "Готово в превью",
    messageType: "Холодное intro (письмо 1)",
    readiness: "Отправка после подтверждения",
  },
};

function verticalPools(c: CopyPack, vertical: Vertical) {
  switch (vertical) {
    case "energy":
      return { pain: c.painEnergy, web: c.webEnergy, opp: c.oppEnergy };
    case "agency":
      return { pain: c.painAgency, web: c.webAgency, opp: c.oppAgency };
    case "saas":
      return { pain: c.painSaas, web: c.webSaas, opp: c.oppSaas };
    case "local":
      return { pain: c.painLocal, web: c.webLocal, opp: c.oppLocal };
    default:
      return { pain: c.painGeneric, web: c.webGeneric, opp: c.oppGeneric };
  }
}

function detectVertical(text: string): Vertical {
  const t = text.toLowerCase();
  if (/energia|energy|elektri|elec|solar|tuul|wind|gaas|grid|võrk/i.test(t)) return "energy";
  if (/agency|büroo|disain|design|veeb|web|reklaam|creative|studio/i.test(t)) return "agency";
  if (/saas|software|tarkvara|platform|api|subscription|crm/i.test(t)) return "saas";
  if (/hooldus|remont|restoran|kliinik|puhastus|ehitus|local|teenus/i.test(t)) return "local";
  return "generic";
}

function domainFromUrl(url: string): string {
  try {
    const u = url.startsWith("http") ? new URL(url) : new URL(`https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "example.com";
  }
}

export function buildDemoAnalysis(body: DemoRequestBody): DemoAnalysisResponse {
  const lang = body.language;
  const c = COPY[lang] ?? COPY.et;
  const seed =
    hashSeed(
      `${body.companyName}|${body.websiteUrl}|${body.whatYouSell}|${body.tone}|${body.language}|${body.variantSalt ?? 0}`,
    ) + (body.variantSalt ?? 0) * 17;
  const vertical = detectVertical(`${body.companyName} ${body.whatYouSell}`);
  const ind = c.industries[vertical];
  const { pain: painPool, web: webPool, opp: oppPool } = verticalPools(c, vertical);

  const painPoints = [pick(painPool, seed), pick(painPool, seed + 1), pick(painPool, seed + 2)];
  const websiteFindings = [pick(webPool, seed + 3), pick(webPool, seed + 4)];
  const outreachOpportunities = [pick(oppPool, seed + 5), pick(oppPool, seed + 6)];

  const domain = domainFromUrl(body.websiteUrl || "example.com");
  const companyName = body.companyName.trim() || domain;

  const summary = c.summaries({ company: companyName, sell: body.whatYouSell.trim() || "—", ind });
  const whyFit = c.whyFit({ company: companyName, sell: body.whatYouSell.trim() || "—", ind });
  const messageAngle = c.angle({ tone: body.tone, sell: body.whatYouSell.trim() || "—", ind });
  const email = c.email({
    tone: body.tone,
    company: companyName,
    sell: body.whatYouSell.trim() || "your offer",
    ind,
    domain,
    salt: seed,
  });

  const scoreBase = 62 + (seed % 28);
  const leadScore = Math.min(96, Math.max(58, scoreBase));
  const leadScoreWhy = c.scoreWhy(leadScore, ind);

  const langLabel = lang === "et" ? "Eesti" : lang === "ru" ? "Русский" : "English";

  const region = pick(c.regions, seed + 9);
  const conf = 0.72 + (seed % 18) / 100;
  const enrichment: WebsiteEnrichment = {
    companySummary: summary,
    likelyIndustry: ind,
    likelyServicesOrProducts: [body.whatYouSell.trim().slice(0, 120) || ind.slice(0, 80)],
    targetAudience: outreachOpportunities.slice(0, 4),
    possiblePainPoints: painPoints,
    websiteLanguages: [lang],
    locationClues: [region],
    contactPageUrl: null,
    pricingPageUrl: null,
    confidence: conf,
  };

  return {
    company: {
      name: companyName,
      likelyIndustry: ind,
      summary,
      detectedLanguage: langLabel,
      region,
      confidence: conf,
    },
    painPoints,
    websiteFindings,
    outreachOpportunities,
    whyFit,
    messageAngle,
    generatedEmail: email,
    leadScore,
    leadScoreWhy,
    campaignPreview: {
      statusLabel: c.campaignStatus,
      language: lang.toUpperCase(),
      messageType: c.messageType,
      sendReadiness: c.readiness,
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
      fetchedFromUrl: null,
    },
  };
}
