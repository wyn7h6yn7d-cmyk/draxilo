"use server";

import { EmailProvider } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";

export async function upsertResendConnectionAction(params: {
  name: string;
  fromEmail: string;
  fromName?: string | null;
  makeDefault?: boolean;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  if (!process.env.RESEND_API_KEY) return { ok: false as const, error: "RESEND_NOT_CONFIGURED" as const };

  if (!params.fromEmail.includes("@")) return { ok: false as const, error: "INVALID_INPUT" as const };

  const existing = await prisma.emailConnection.findFirst({
    where: { workspaceId: workspace.id, provider: EmailProvider.RESEND },
    orderBy: { createdAt: "desc" },
  });

  const connection = existing
    ? await prisma.emailConnection.update({
        where: { id: existing.id },
        data: {
          name: params.name,
          fromEmail: params.fromEmail,
          fromName: params.fromName ?? null,
          isDefault: params.makeDefault ?? existing.isDefault,
          isActive: true,
        },
      })
    : await prisma.emailConnection.create({
        data: {
          workspaceId: workspace.id,
          createdById: user.id,
          provider: EmailProvider.RESEND,
          name: params.name,
          fromEmail: params.fromEmail,
          fromName: params.fromName ?? null,
          isDefault: params.makeDefault ?? true,
          isActive: true,
          config: { provider: "resend" },
        },
      });

  if (params.makeDefault) {
    await prisma.emailConnection.updateMany({
      where: { workspaceId: workspace.id, provider: EmailProvider.RESEND, id: { not: connection.id } },
      data: { isDefault: false },
    });
  }

  return { ok: true as const, connectionId: connection.id };
}

