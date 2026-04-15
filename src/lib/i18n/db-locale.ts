import { Locale as PrismaLocale } from "@prisma/client";

import type { Locale } from "./types";

export function toDbLocale(locale: Locale): PrismaLocale {
  switch (locale) {
    case "en":
      return PrismaLocale.EN;
    case "ru":
      return PrismaLocale.RU;
    case "et":
    default:
      return PrismaLocale.ET;
  }
}

export function fromDbLocale(locale: PrismaLocale | null | undefined): Locale {
  switch (locale) {
    case PrismaLocale.EN:
      return "en";
    case PrismaLocale.RU:
      return "ru";
    case PrismaLocale.ET:
    default:
      return "et";
  }
}

