import type { DemoScenario } from "@/lib/demo/sim/types";

export const maintenanceScenario: DemoScenario = {
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
};

