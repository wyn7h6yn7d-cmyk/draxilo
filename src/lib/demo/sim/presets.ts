import type { DemoScenarioId } from "@/lib/demo/sim/types";

export type DemoPreset = {
  id: string;
  companyName: string;
  websiteUrl: string;
  whatYouSell: string;
  scenarioHint?: DemoScenarioId;
};

export const DEMO_PRESETS: readonly DemoPreset[] = [
  {
    id: "energy",
    companyName: "Baltic Current OÜ",
    websiteUrl: "https://balticcurrent.example.ee",
    whatYouSell: "Taastuvenergia lahendused ja võrgu bilansi teenused ettevõtetele",
    scenarioHint: "b2b_saas",
  },
  {
    id: "agency",
    companyName: "Northloom Studio",
    websiteUrl: "https://northloom.example.com",
    whatYouSell: "Bränding, veeb ja performance turundus B2B klientidele",
    scenarioHint: "agency",
  },
  {
    id: "saas",
    companyName: "Pipeledger",
    websiteUrl: "https://pipeledger.example.com",
    whatYouSell: "Finants- ja arvete töövoogude tarkvara kasvavatele tiimidele",
    scenarioHint: "b2b_saas",
  },
  {
    id: "local",
    companyName: "Hea Kodu Hooldus",
    websiteUrl: "https://heakodu.example.ee",
    whatYouSell: "Korteriühistute ja ärikinnisvara tehniline hooldus",
    scenarioHint: "maintenance",
  },
  {
    id: "industrial",
    companyName: "Venipak Eesti OÜ",
    websiteUrl: "https://www.venipak.ee",
    whatYouSell: "Pakkide ja aluste transport",
    scenarioHint: "industrial_supplier",
  },
  {
    id: "supplier",
    companyName: "Nordic Fasteners",
    websiteUrl: "https://nordicfasteners.example.com",
    whatYouSell: "Tööstuslikud kinnitustarvikud, tarneahel ja RFQ teenus",
    scenarioHint: "industrial_supplier",
  },
] as const;

