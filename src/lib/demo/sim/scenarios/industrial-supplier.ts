import type { DemoScenario } from "@/lib/demo/sim/types";

export const industrialSupplierScenario: DemoScenario = {
  id: "industrial_supplier",
  label: { et: "Tööstuslik tarnija", en: "Industrial supplier", ru: "Промышленный поставщик" },
  defaultIndustry: { et: "Tööstus ja logistika", en: "Industrial supply", ru: "Промышленность" },
  regions: ["Baltikum", "Skandinaavia", "Euroopa"],
  servicesOrProducts: ["Tarneahel", "Tarnetingimused", "Tooteportfell", "Kvaliteedisertifikaadid"],
  targetAudiences: ["Ostujuhid", "Tehased", "Hooldusosakonnad", "Logistikajuhid"],
  painPoints: [
    "Ostjad vajavad kiiret sobivuse kinnitust ja tarneaega",
    "Tooteinfo on keeruline ja spetsifikatsioonid on hajusad",
    "Uue tarnija risk on kõrge; vaja on tõendeid ja protsessi",
    "Hinnastamine ja MOQ tekitavad edasi-tagasi",
  ],
  websiteFindings: [
    "Tootevalik on olemas, kuid filtreerimine/leidmine on vaevaline",
    "Sertifikaadid on mainitud, kuid mitte ‘miks see loeb’ keeles",
    "Kontakt on olemas, kuid RFQ voog on pikk",
  ],
  opportunities: [
    "Paku 24h sobivuse kontroll + tarneaja hinnang",
    "Tee RFQ lühemaks: 3 välja ja konkreetne vastus",
    "Too esile riskimaandajad: sertifikaadid, SLA, varu",
  ],
  messageAngles: [
    "Kiire sobivuse kontroll + tarneaja signaal",
    "RFQ ilma edasi-tagasi: 3 küsimust, 1 vastus",
    "Risk maha: protsess + tõendid + varu",
  ],
};

