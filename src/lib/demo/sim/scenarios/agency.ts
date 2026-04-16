import type { DemoScenario } from "@/lib/demo/sim/types";

export const agencyScenario: DemoScenario = {
  id: "agency",
  label: { et: "Agentuur", en: "Agency", ru: "Агентство" },
  defaultIndustry: { et: "Veeb ja turundus", en: "Web & marketing", ru: "Маркетинг и веб" },
  regions: ["Eesti", "Euroopa (remote)"],
  servicesOrProducts: ["Bränding", "Veeb", "Performance", "Sisutootmine"],
  targetAudiences: ["Turundusjuhid", "Founderid", "E-commerce", "B2B müük"],
  painPoints: [
    "Pakkumised on ajamahukad ja liiga üldised",
    "Prospektid ei näe erinevust ‘disaini’ ja ‘tulemuse’ vahel",
    "Case study’d ei seleta protsessi piisavalt",
    "Follow-up on nõrk ja pipeline on ebaühtlane",
  ],
  websiteFindings: [
    "Portfoolio on olemas, kuid tulemuste mõõdikud on peidus",
    "Protsess on kirjeldatud, kuid mitte ‘mida klient saab’ vaates",
    "CTA on olemas, kuid puudub konkreetne pakkumine (audit, workshop)",
  ],
  opportunities: [
    "Paku 20-min audit / teardown + 3 konkreetset soovitust",
    "Tee ‘paketid’ arusaadavaks ja outcome-põhiseks",
    "Automatiseeri follow-up: 2 sammu + väärtus",
  ],
  messageAngles: [
    "Audit + 3 konkreetset parandust enne kõnet",
    "Outcome-põhine pakkumine: mõõdikud ja risk maha",
    "Selge protsess: ajakava, deliverable’id, kontrollpunktid",
  ],
};

