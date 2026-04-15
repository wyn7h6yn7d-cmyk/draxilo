"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { toDbLocale } from "@/lib/i18n/db-locale";
import { LOCALES } from "@/lib/i18n/types";

const localeEnum = z.enum(LOCALES);

export async function updateProfileAction(input: unknown) {
  const schema = z.object({
    fullName: z.string().trim().max(120).optional().or(z.literal("")),
    timezone: z.string().trim().max(64).optional().or(z.literal("")),
    locale: localeEnum.optional(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fullName: parsed.data.fullName || null,
      timezone: parsed.data.timezone || null,
      locale: parsed.data.locale ? toDbLocale(parsed.data.locale) : undefined,
    } as any,
    update: {
      fullName: parsed.data.fullName || null,
      timezone: parsed.data.timezone || null,
      ...(parsed.data.locale ? { locale: toDbLocale(parsed.data.locale) } : {}),
    },
  });

  revalidatePath("/app/settings");
  return { ok: true as const };
}

export async function updateWorkspaceAction(input: unknown) {
  const schema = z.object({
    workspaceName: z.string().trim().min(2).max(120),
    websiteUrl: z.string().trim().url().optional().or(z.literal("")),
    whatYouSell: z.string().trim().max(500).optional().or(z.literal("")),
    callToAction: z.string().trim().max(160).optional().or(z.literal("")),
    targetCustomerDescription: z.string().trim().max(800).optional().or(z.literal("")),
    languagesToUse: z.array(localeEnum).min(1).max(3),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const, issues: parsed.error.issues };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { name: parsed.data.workspaceName },
  });

  await prisma.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    create: {
      workspaceId: workspace.id,
      websiteUrl: parsed.data.websiteUrl || null,
      whatYouSell: parsed.data.whatYouSell || null,
      callToAction: parsed.data.callToAction || null,
      targetCustomerDescription: parsed.data.targetCustomerDescription || null,
      languagesToUse: parsed.data.languagesToUse.map(toDbLocale) as any,
    },
    update: {
      websiteUrl: parsed.data.websiteUrl || null,
      whatYouSell: parsed.data.whatYouSell || null,
      callToAction: parsed.data.callToAction || null,
      targetCustomerDescription: parsed.data.targetCustomerDescription || null,
      languagesToUse: parsed.data.languagesToUse.map(toDbLocale) as any,
    },
  });

  revalidatePath("/app/settings");
  return { ok: true as const };
}

export async function updateLocalizationAction(input: unknown) {
  const schema = z.object({
    preferredOutreachLanguage: localeEnum,
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  await prisma.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    create: {
      workspaceId: workspace.id,
      preferredOutreachLanguage: toDbLocale(parsed.data.preferredOutreachLanguage) as any,
      languagesToUse: [toDbLocale(parsed.data.preferredOutreachLanguage)] as any,
    },
    update: {
      preferredOutreachLanguage: toDbLocale(parsed.data.preferredOutreachLanguage) as any,
    },
  });

  revalidatePath("/app/settings");
  return { ok: true as const };
}

export async function updateAiSettingsAction(input: unknown) {
  const schema = z.object({
    tonePreference: z.string().trim().max(80).optional().or(z.literal("")),
    defaultMessageLength: z.enum(["SHORT", "MEDIUM"]).optional(),
    extraAiInstruction: z.string().trim().max(800).optional().or(z.literal("")),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  await prisma.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    create: {
      workspaceId: workspace.id,
      tonePreference: parsed.data.tonePreference || null,
      defaultMessageLength: parsed.data.defaultMessageLength ?? null,
      extraAiInstruction: parsed.data.extraAiInstruction || null,
    },
    update: {
      tonePreference: parsed.data.tonePreference || null,
      defaultMessageLength: parsed.data.defaultMessageLength ?? null,
      extraAiInstruction: parsed.data.extraAiInstruction || null,
    },
  });

  revalidatePath("/app/settings");
  return { ok: true as const };
}

