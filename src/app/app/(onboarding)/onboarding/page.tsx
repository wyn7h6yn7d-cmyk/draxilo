import { redirect } from "next/navigation";

import { getI18n } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { fromDbLocale } from "@/lib/i18n/db-locale";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) redirect("/app");

  const { locale, dict } = await getI18n();

  const settings = workspace.settings
    ? {
        businessName: workspace.settings.businessName ?? "",
        websiteUrl: workspace.settings.websiteUrl ?? "",
        whatYouSell: workspace.settings.whatYouSell ?? "",
        targetCustomerDescription: workspace.settings.targetCustomerDescription ?? "",
        industries: workspace.settings.industries ?? [],
        countries: workspace.settings.countries ?? [],
        languagesToUse: (workspace.settings.languagesToUse ?? [])[0]
          ? workspace.settings.languagesToUse.map(fromDbLocale)
          : [locale],
        offerType: workspace.settings.offerType ?? "",
        callToAction: workspace.settings.callToAction ?? "",
        tonePreference: workspace.settings.tonePreference ?? "",
        preferredOutreachLanguage: fromDbLocale(workspace.settings.preferredOutreachLanguage),
        targetCompanySize: workspace.settings.targetCompanySize ?? "",
        targetRoles: workspace.settings.targetRoles ?? [],
        avoidIndustries: workspace.settings.avoidIndustries ?? [],
        idealCustomerExamples: workspace.settings.idealCustomerExamples ?? "",
      }
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <OnboardingWizard locale={locale} dict={dict} initial={settings} />
    </div>
  );
}

