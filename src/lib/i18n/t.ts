import { et } from "./dictionaries/et";
import { en } from "./dictionaries/en";
import { ru } from "./dictionaries/ru";
import type { Locale } from "./types";

type FlatDict = Record<string, string>;

function flatten(obj: unknown, prefix = "", out: FlatDict = {}) {
  if (!obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const nextKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[nextKey] = v;
    else flatten(v, nextKey, out);
  }
  return out;
}

const FLAT = {
  et: flatten(et),
  en: flatten(en),
  ru: flatten(ru),
} satisfies Record<Locale, FlatDict>;

export function tKey(locale: Locale, key: string) {
  return FLAT[locale]?.[key] ?? FLAT.et[key] ?? key;
}

