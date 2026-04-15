import { getI18n } from "@/lib/i18n/server";
import { CsvImportWizard } from "@/components/leads/csv-import-wizard";

export default async function LeadsImportPage() {
  const { locale, dict } = await getI18n();
  return (
    <div className="space-y-6">
      <CsvImportWizard locale={locale} dict={dict} />
    </div>
  );
}

