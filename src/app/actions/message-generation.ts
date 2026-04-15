"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { generateOutreachMessage } from "@/lib/messages/service";
import { messageLengthSchema, messageStyleSchema, messageToneSchema } from "@/lib/messages/types";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMessageForLeadAction(input: {
  leadId: string;
  style: unknown;
  tone: unknown;
  length: unknown;
  customInstruction?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const style = messageStyleSchema.safeParse(input.style);
  const tone = messageToneSchema.safeParse(input.tone);
  const length = messageLengthSchema.safeParse(input.length);
  if (!style.success || !tone.success || !length.success) {
    return { ok: false as const, error: "INVALID_INPUT" as const };
  }

  const locale = await getLocale();

  // V1: only EMAIL output.
  const res = await generateOutreachMessage({
    channel: "EMAIL",
    style: style.data,
    tone: tone.data,
    length: length.data,
    language: locale,
    workspaceId: workspace.id,
    leadId: input.leadId,
    customInstruction: input.customInstruction ?? null,
  });

  return res;
}

