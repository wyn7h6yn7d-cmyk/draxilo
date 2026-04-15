import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";
import { FutureLanding } from "@/components/marketing/future-landing";

export const metadata: Metadata = {
  title: "AI lead generation & outreach",
  description:
    "Find leads, enrich firmographics from the web, generate outreach in ET/EN/RU, and run campaigns with confidence.",
  openGraph: {
    title: "Draxion — AI lead generation & outreach",
    description:
      "Find leads, enrich firmographics from the web, generate outreach in ET/EN/RU, and run campaigns with confidence.",
  },
  twitter: {
    title: "Draxion — AI lead generation & outreach",
    description:
      "Find leads, enrich firmographics from the web, generate outreach in ET/EN/RU, and run campaigns with confidence.",
  },
};

export default async function Home() {
  const { locale, dict } = await getI18n();
  return <FutureLanding locale={locale} dict={dict} />;
}
