import type { WebsiteEnrichment } from "@/lib/ai/schemas";

export type DemoLanguage = "et" | "en" | "ru";
export type DemoTone = "friendly" | "direct" | "sharp";

export type DemoContinuation = {
  enrichment: WebsiteEnrichment;
  fetchedFromUrl: string | null;
};

export type DemoRequestBody = {
  companyName: string;
  websiteUrl: string;
  whatYouSell: string;
  language: DemoLanguage;
  tone: DemoTone;
  /** Optional scenario hint for offline simulation. */
  scenarioHint?: "maintenance" | "b2b_saas" | "local_service" | "industrial_supplier" | "agency" | null;
  /** Bump to vary generated email wording */
  variantSalt?: number;
  /** full | regenerate_email — same pipeline, different salt behavior */
  intent?: "full" | "regenerate_email";
  /** Echo from last response to skip re-fetching / re-enriching (regenerate, new tone) */
  continuation?: DemoContinuation | null;
};

export type DemoCampaignStageKey = "analyze" | "enrich" | "compose" | "approve" | "send";

export type DemoAnalysisResponse = {
  company: {
    name: string;
    likelyIndustry: string;
    summary: string;
    detectedLanguage: string;
    region: string;
    confidence: number;
  };
  painPoints: string[];
  websiteFindings: string[];
  outreachOpportunities: string[];
  whyFit: string;
  messageAngle: string;
  generatedEmail: {
    subject: string;
    body: string;
  };
  leadScore: number;
  leadScoreWhy: string;
  campaignPreview: {
    statusLabel: string;
    language: string;
    messageType: string;
    sendReadiness: string;
    stages: { key: DemoCampaignStageKey; done: boolean }[];
  };
  /** Pass back on the next request to reuse enrichment (faster regen / tone change). */
  continuation: DemoContinuation;
};
