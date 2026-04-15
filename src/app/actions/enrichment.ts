"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { bulkEnrichLeads, enrichLeadById } from "@/lib/enrichment/service";

export async function enrichLeadAction(params: { leadId: string }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const res = await enrichLeadById({ workspaceId: workspace.id, leadId: params.leadId });
  return res;
}

export async function bulkEnrichLeadsAction(params: { leadIds: string[] }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const results = await bulkEnrichLeads({ workspaceId: workspace.id, leadIds: params.leadIds });
  return { ok: true as const, results };
}

