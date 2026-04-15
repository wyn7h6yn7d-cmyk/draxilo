import type { WebsiteEnrichment } from "@/lib/ai/schemas";

type ScoreBreakdown = {
  total: number;
  factors: {
    websiteCompleteness: number;
    serviceMatch: number;
    industryMatch: number;
    geographyMatch: number;
    contactability: number;
    enrichmentConfidence: number;
  };
  explanation: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9äöõü-]+/gi, " ")
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 3)
    .slice(0, 200);
}

function overlapScore(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const hits = a.filter((t) => setB.has(t)).length;
  return hits / Math.max(1, Math.min(a.length, 30));
}

export function computeLeadScore(params: {
  workspace: {
    whatYouSell?: string | null;
    industries?: string[] | null;
    countries?: string[] | null;
  };
  lead: {
    hasWebsite: boolean;
    companyCountry?: string | null;
    hasContactEmail: boolean;
  };
  enrichment?: WebsiteEnrichment | null;
}): ScoreBreakdown {
  const explanation: string[] = [];

  const websiteCompleteness = params.lead.hasWebsite ? 15 : 0;
  if (websiteCompleteness === 0) explanation.push("No website/domain found.");

  const contactability = params.lead.hasContactEmail ? 20 : 5;
  if (!params.lead.hasContactEmail) explanation.push("No contact email detected.");

  const enrichmentConfidence = params.enrichment
    ? Math.round(clamp(params.enrichment.confidence, 0, 1) * 15)
    : 0;
  if (!params.enrichment) explanation.push("No enrichment available yet.");

  // Service match: token overlap between whatYouSell and website services/products + summary.
  const sellTokens = tokenize(params.workspace.whatYouSell ?? "");
  const siteTokens = params.enrichment
    ? tokenize(
        [
          params.enrichment.companySummary,
          params.enrichment.likelyServicesOrProducts.join(" "),
        ].join(" "),
      )
    : [];
  const serviceMatch = Math.round(clamp(overlapScore(sellTokens, siteTokens) * 20, 0, 20));
  if (sellTokens.length > 0 && serviceMatch < 6) explanation.push("Weak service match based on site text.");

  // Industry match: compare workspace industries to likelyIndustry.
  const industryTokens = tokenize((params.enrichment?.likelyIndustry ?? "").toString());
  const desiredIndustriesTokens = tokenize((params.workspace.industries ?? []).join(" "));
  const industryMatch = desiredIndustriesTokens.length
    ? Math.round(clamp(overlapScore(desiredIndustriesTokens, industryTokens) * 15, 0, 15))
    : 8; // neutral default

  // Geography match: workspace target countries vs company country.
  const desiredCountries = (params.workspace.countries ?? []).map((c) => c.toUpperCase());
  const companyCountry = (params.lead.companyCountry ?? "").toUpperCase();
  const geographyMatch =
    desiredCountries.length === 0
      ? 10
      : desiredCountries.includes(companyCountry)
        ? 15
        : companyCountry
          ? 5
          : 7;

  const factors = {
    websiteCompleteness,
    serviceMatch,
    industryMatch,
    geographyMatch,
    contactability,
    enrichmentConfidence,
  };

  const total = clamp(
    factors.websiteCompleteness +
      factors.serviceMatch +
      factors.industryMatch +
      factors.geographyMatch +
      factors.contactability +
      factors.enrichmentConfidence,
    0,
    100,
  );

  return {
    total,
    factors,
    explanation,
  };
}

