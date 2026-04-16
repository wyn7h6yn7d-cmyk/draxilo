import type { DemoScenario } from "@/lib/demo/sim/types";

export const DEMO_SCENARIOS: readonly DemoScenario[] = [
  {
    id: "maintenance",
    label: { et: "Hooldus / kinnisvara", en: "Maintenance / property", ru: "Обслуживание / недвижимость" },
    defaultIndustry: { et: "Tehniline hooldus", en: "Property maintenance", ru: "Техническое обслуживание" },
    regions: ["Eesti", "Baltikum", "Põhja-Euroopa"],
    servicesOrProducts: ["Hooldusplaanid", "Avarii- ja väljakutsetööd", "Ennetav hooldus", "Tööde ajastamine"],
    targetAudiences: ["Korteriühistud", "Ärikinnisvara omanikud", "Haldusfirmad", "Tööstuspargid"],
    painPoints: [
      "Hoolduse tellimine on killustunud ja ajakulukas",
      "Avariitööd on ettearvamatud ja keerulise koordineerimisega",
      "Teenuse kvaliteet on raske võrrelda ja mõõta",
      "SLA ootused on ebamäärased ning dokumentatsioon hajub",
    ],
    websiteFindings: [
      "Teenused on kirjeldatud, kuid SLA ja protsess ei ole piisavalt nähtav",
      "Kontaktivorm on olemas, kuid hinnastuse loogika jääb ebaselgeks",
      "Puudub kiire ‘mis juhtub järgmise sammuna’ selgitus",
    ],
    opportunities: [
      "Tõsta usaldust: näita SLA, reageerimisajad ja 3 sammu protsess",
      "Paku auditit: tasuta hooldusplaani kontroll / riskikohtade nimekiri",
      "Too välja tõendid: objektid, sertifikaadid, mõõdikud",
    ],
    messageAngles: [
      "SLA nähtavaks + automaatne tööde koordineerimine",
      "Ennetav hooldus = vähem avariisid ja vähem katkestusi",
      "Standardne aruandlus juhatusele / haldurile",
    ],
  },
  {
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
  },
  {
    id: "local_service",
    label: { et: "Kohalik teenus", en: "Local service", ru: "Локальный сервис" },
    defaultIndustry: { et: "Kohalik teenus", en: "Local services", ru: "Локальные услуги" },
    regions: ["Eesti", "Linn / maakond"],
    servicesOrProducts: ["Teenusepaketid", "Kiirreageerimine", "Hinnastamise raam", "Garantii"],
    targetAudiences: ["Väikeettevõtted", "Kodutarbijad", "Kinnisvarahaldus", "Ühistud"],
    painPoints: [
      "Tellimused tulevad ebaregulaarselt ja sõltuvad soovitustest",
      "Aeg läheb hinnapäringute peale, mis ei konverteeru",
      "Teenuse eristus ei tule veebis piisavalt välja",
      "Järelpäringud ja follow-up jäävad hajuma",
    ],
    websiteFindings: [
      "Teenused on loetletud, kuid väärtus ja garantii pole esiplaanil",
      "Puudub kiire pakkumise raam (mis sisaldub, mis mitte)",
      "Kontakt on olemas, kuid CTA on nõrk",
    ],
    opportunities: [
      "Tee selge ‘paketi’ struktuur + hinnavahemik",
      "Lisa 3 tõendit: hinnangud, pildid, garantiid",
      "Automatiseeri järelpäring: 1–2 hästi kirjutatud malliga",
    ],
    messageAngles: [
      "Kiire audit + pakkumise raam: vähem edasi-tagasi",
      "Garantii ja kvaliteedi tõendid esiplaanile",
      "Sõnumid, mis annavad vastuse kohe: hind/ajakava/garantii",
    ],
  },
  {
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
  },
  {
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
  },
] as const;

export function getScenarioById(id: string | null | undefined) {
  return DEMO_SCENARIOS.find((s) => s.id === id) ?? null;
}

