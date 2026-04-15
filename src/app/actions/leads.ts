"use server";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { bulkEnrichLeads } from "@/lib/enrichment/service";
import { computeLeadScore } from "@/lib/leads/scoring";
import type { WebsiteEnrichment } from "@/lib/ai/schemas";
import { runJob } from "@/lib/jobs/executor";
import { JobType } from "@prisma/client";

export async function bulkArchiveLeadsAction(params: { leadIds: string[] }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };
  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  await prisma.lead.updateMany({
    where: { workspaceId: workspace.id, id: { in: params.leadIds.slice(0, 500) } },
    data: { archivedAt: new Date(), status: "ARCHIVED" },
  });
  return { ok: true as const };
}

export async function bulkEnrichLeadsAction(params: { leadIds: string[] }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };
  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const leadIds = Array.from(new Set(params.leadIds)).slice(0, 50);
  const job = await runJob({
    workspaceId: workspace.id,
    triggeredById: user.id,
    type: JobType.ENRICHMENT,
    payload: { leadIds },
    handler: async () => {
      const results = await bulkEnrichLeads({ workspaceId: workspace.id, leadIds });
      return { results };
    },
  });

  return { ok: job.ok as any, jobRunId: job.jobRunId, results: (job as any).result?.results ?? [] };
}

export async function bulkScoreLeadsAction(params: { leadIds: string[] }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };
  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const settings = await prisma.workspaceSettings.findUnique({ where: { workspaceId: workspace.id } });

  const leads = await prisma.lead.findMany({
    where: { workspaceId: workspace.id, id: { in: params.leadIds.slice(0, 200) } },
    include: { company: true, contact: true },
  });

  for (const lead of leads) {
    const latest = await prisma.leadEnrichment.findFirst({
      where: { workspaceId: workspace.id, leadId: lead.id, status: "COMPLETE" },
      orderBy: { createdAt: "desc" },
    });
    const enrichment = (latest?.output ?? null) as WebsiteEnrichment | null;

    const breakdown = computeLeadScore({
      workspace: {
        whatYouSell: settings?.whatYouSell ?? null,
        industries: settings?.industries ?? [],
        countries: settings?.countries ?? [],
      },
      lead: {
        hasWebsite: !!(lead.company?.websiteUrl || lead.company?.domain || lead.domain),
        companyCountry: lead.company?.country ?? null,
        hasContactEmail: !!(lead.contact?.email || lead.email),
      },
      enrichment,
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        score: breakdown.total,
        scoreDetails: breakdown as any,
        scoredAt: new Date(),
      },
    });
  }

  return { ok: true as const };
}

