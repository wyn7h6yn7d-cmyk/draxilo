import type { DemoLanguage, DemoTone } from "@/lib/demo/types";

export type DemoScenarioId = "maintenance" | "b2b_saas" | "local_service" | "industrial_supplier" | "agency";

export type DemoScenario = {
  id: DemoScenarioId;
  label: { et: string; en: string; ru: string };
  defaultIndustry: { et: string; en: string; ru: string };
  regions: string[];
  servicesOrProducts: string[];
  targetAudiences: string[];
  painPoints: string[];
  websiteFindings: string[];
  opportunities: string[];
  messageAngles: string[];
};

export type DemoSimInput = {
  companyName: string;
  websiteUrl: string;
  whatYouSell: string;
  language: DemoLanguage;
  tone: DemoTone;
  variantSalt?: number;
  intent?: "full" | "regenerate_email";
  scenarioHint?: DemoScenarioId | null;
};

