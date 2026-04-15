import { getI18n } from "@/lib/i18n/server";
import { LeadSearchV1 } from "@/components/leads/lead-search-v1";

export default async function LeadSearchPage() {
  const { locale, dict } = await getI18n();
  return (
    <div className="space-y-6">
      <LeadSearchV1 locale={locale} dict={dict} />
    </div>
  );
}

