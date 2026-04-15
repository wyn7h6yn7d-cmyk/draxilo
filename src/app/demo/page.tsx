import type { Metadata } from "next";

import { DemoPageClient } from "@/components/demo/demo-page-client";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.demo.metaTitle,
    description: dict.demo.metaDescription,
  };
}

export default async function DemoPage() {
  const { locale, dict } = await getI18n();
  return <DemoPageClient locale={locale} dict={dict} />;
}
