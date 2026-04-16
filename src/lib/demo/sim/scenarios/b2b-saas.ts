import type { DemoScenario } from "@/lib/demo/sim/types";

export const b2bSaasScenario: DemoScenario = {
  id: "b2b_saas",
  label: { et: "B2B SaaS", en: "B2B SaaS", ru: "B2B SaaS" },
  defaultIndustry: { et: "B2B tarkvara", en: "B2B software", ru: "B2B софт" },
  regions: ["Põhja-Euroopa", "Euroopa", "USA (EMEA müük)"],
  servicesOrProducts: ["Töövoo automatiseerimine", "Integratsioonid", "Raportid", "Auditijälg"],
  targetAudiences: ["Müügijuhid", "Operatsioonid", "Finants", "RevOps"],
  painPoints: [
    "Andmed on eri tööriistades ja raportid on käsitöö",
    "Pipeline’i kvaliteet on ebaühtlane, duplikaadid segavad",
    "Meeskond kulutab liiga palju aega copy/paste’ile",
    "Järeltegevused jäävad tegemata, sest rutiin on nõrk",
  ],
  websiteFindings: [
    "Väärtuslubadus on olemas, kuid konkreetne ‘enne/pärast’ näide puudub",
    "Integratsioonid on mainitud, kuid use-case ei ole selge",
    "Puudub tugev social proof konkreetsete tulemustega",
  ],
  opportunities: [
    "Näita 1 konkreetset töövoogu algusest lõpuni (30 sek)",
    "Paku kiiret auditit: ‘kus pipeline lekib’ kontroll",
    "Sõnasta ROI: aeg tagasi, vähem käsitööd, rohkem vastuseid",
  ],
  messageAngles: [
    "Signaal → kontekst → sõnum: vähem käsitööd, parem kvaliteet",
    "Dedupe + rikastus = puhtam pipeline ja parem deliverability",
    "Üks töövoog: otsingust kampaaniani",
  ],
};

