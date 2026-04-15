"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { toDbLocale } from "@/lib/i18n/db-locale";
import { onboardingFullSchema } from "@/lib/validation/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";

export async function saveOnboardingAction(input: unknown) {
  const parsed = onboardingFullSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, issues: parsed.error.issues };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return { ok: false as const, issues: [] };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, issues: [] };

  const data = parsed.data;

  await prisma.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    create: {
      workspaceId: workspace.id,
      businessName: data.businessName,
      websiteUrl: data.websiteUrl || null,
      whatYouSell: data.whatYouSell,
      targetCustomerDescription: data.targetCustomerDescription,
      industries: data.industries,
      countries: data.countries,
      languagesToUse: data.languagesToUse.map(toDbLocale),
      preferredOutreachLanguage: toDbLocale(data.preferredOutreachLanguage),
      offerType: data.offerType || null,
      callToAction: data.callToAction || null,
      tonePreference: data.tonePreference || null,
      targetCompanySize: data.targetCompanySize || null,
      targetRoles: data.targetRoles,
      avoidIndustries: data.avoidIndustries,
      idealCustomerExamples: data.idealCustomerExamples || null,
      onboardingCompletedAt: new Date(),
    },
    update: {
      businessName: data.businessName,
      websiteUrl: data.websiteUrl || null,
      whatYouSell: data.whatYouSell,
      targetCustomerDescription: data.targetCustomerDescription,
      industries: data.industries,
      countries: data.countries,
      languagesToUse: data.languagesToUse.map(toDbLocale),
      preferredOutreachLanguage: toDbLocale(data.preferredOutreachLanguage),
      offerType: data.offerType || null,
      callToAction: data.callToAction || null,
      tonePreference: data.tonePreference || null,
      targetCompanySize: data.targetCompanySize || null,
      targetRoles: data.targetRoles,
      avoidIndustries: data.avoidIndustries,
      idealCustomerExamples: data.idealCustomerExamples || null,
      onboardingCompletedAt: new Date(),
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true as const };
}

export async function skipOnboardingAction() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return { ok: false as const };
  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const };

  await prisma.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    create: { workspaceId: workspace.id, onboardingCompletedAt: new Date() },
    update: { onboardingCompletedAt: new Date() },
  });

  revalidatePath("/app");
  return { ok: true as const };
}

