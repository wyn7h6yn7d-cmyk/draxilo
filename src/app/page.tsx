import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";
import { FutureLanding } from "@/components/marketing/future-landing";
import { BRAND_NAME } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  const title = `${BRAND_NAME} — ${dict.marketing.headline}`;
  const description = dict.marketing.subheadline;
  return {
    title,
    description,
    openGraph: { title, description, siteName: dict.app.name },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Home() {
  const { locale, dict } = await getI18n();
  return <FutureLanding locale={locale} dict={dict} />;
}
