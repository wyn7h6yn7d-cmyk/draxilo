import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";
import { FutureLanding } from "@/components/marketing/future-landing";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "AI lead generation & outreach",
  description:
    "Find leads, enrich firmographics from the web, generate outreach in ET/EN/RU, and run campaigns with confidence.",
  openGraph: {
    title: `${BRAND_NAME} — AI lead generation & outreach`,
    description:
      "Find leads, enrich firmographics from the web, generate outreach in ET/EN/RU, and run campaigns with confidence.",
  },
  twitter: {
    title: `${BRAND_NAME} — AI lead generation & outreach`,
    description:
      "Find leads, enrich firmographics from the web, generate outreach in ET/EN/RU, and run campaigns with confidence.",
  },
};

export default async function Home() {
  const { locale, dict } = await getI18n();
  return <FutureLanding locale={locale} dict={dict} />;
}
