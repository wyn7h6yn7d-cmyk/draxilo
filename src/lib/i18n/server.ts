import { getLocale } from "./locale";
import { getDictionary } from "./dictionary";

export async function getI18n() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return { locale, dict };
}

