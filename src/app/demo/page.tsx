import type { Metadata } from "next";

import { DemoPageClient } from "@/components/demo/demo-page-client";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  const title = dict.demo.metaTitle;
  const description = dict.demo.metaDescription;
  return {
    title,
    description,
    openGraph: { title, description, siteName: dict.app.name },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DemoPage() {
  const { locale, dict } = await getI18n();
  return <DemoPageClient locale={locale} dict={dict} />;
}
