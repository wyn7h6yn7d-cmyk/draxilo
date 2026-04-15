import { redirect } from "next/navigation";

import { getI18n } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const { locale, dict } = await getI18n();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) redirect("/app");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const settings = await prisma.workspaceSettings.findUnique({ where: { workspaceId: workspace.id } });

  const connection = await prisma.emailConnection.findFirst({
    where: { workspaceId: workspace.id, provider: "RESEND" },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <SettingsClient
      dict={dict}
      locale={locale}
      initial={{
        profile: {
          fullName: profile?.fullName ?? "",
          timezone: profile?.timezone ?? "",
          locale,
        },
        workspace: { name: workspace.name },
        workspaceSettings: {
          websiteUrl: settings?.websiteUrl ?? "",
          whatYouSell: settings?.whatYouSell ?? "",
          callToAction: settings?.callToAction ?? "",
          targetCustomerDescription: settings?.targetCustomerDescription ?? "",
          languagesToUse: ((settings?.languagesToUse as any) ?? ["ET"]).map((l: any) =>
            l === "EN" ? "en" : l === "RU" ? "ru" : "et",
          ),
          preferredOutreachLanguage:
            (settings?.preferredOutreachLanguage as any) === "EN"
              ? "en"
              : (settings?.preferredOutreachLanguage as any) === "RU"
                ? "ru"
                : "et",
          tonePreference: settings?.tonePreference ?? "",
          defaultMessageLength: (settings?.defaultMessageLength as any) ?? "",
          extraAiInstruction: settings?.extraAiInstruction ?? "",
        },
        email: {
          connection: connection
            ? { name: connection.name, fromEmail: connection.fromEmail ?? "", fromName: connection.fromName ?? "" }
            : null,
          resendConfigured: !!process.env.RESEND_API_KEY,
        },
      }}
    />
  );
}

