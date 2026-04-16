import type { DemoScenario } from "@/lib/demo/sim/types";

export const localServiceScenario: DemoScenario = {
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
};

