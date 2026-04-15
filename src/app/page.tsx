import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";
import { FutureLanding } from "@/components/marketing/future-landing";

export const metadata: Metadata = {
  title: "Draxilo — AI lead gen & outreach",
  description: "Find leads, enrich them, generate outreach in ET/EN/RU, and send campaigns.",
};

export default async function Home() {
  const { locale, dict } = await getI18n();
  return <FutureLanding locale={locale} dict={dict} />;
}
