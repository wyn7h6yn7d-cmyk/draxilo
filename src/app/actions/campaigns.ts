"use server";

import { CampaignStatus, CampaignLeadStatus, JobType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { campaignCreateSchema } from "@/lib/validation/campaign";
import { toDbLocale } from "@/lib/i18n/db-locale";
import { generateOutreachMessage } from "@/lib/messages/service";
import { sendApprovedCampaignEmails, sendCampaignLeadEmail } from "@/lib/email/send-service";
import { runJob } from "@/lib/jobs/executor";

export async function createCampaignAction(input: unknown) {
  const parsed = campaignCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.id,
      createdById: user.id,
      name: parsed.data.name,
      objective: parsed.data.objective || null,
      status: CampaignStatus.DRAFT,
      localeDefault: toDbLocale(parsed.data.localeDefault),
    },
  });

  return { ok: true as const, campaignId: campaign.id };
}

export async function addLeadsToCampaignAction(params: {
  campaignId: string;
  leadIds: string[];
  language: "et" | "en" | "ru";
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.campaignId, workspaceId: workspace.id },
  });
  if (!campaign) return { ok: false as const, error: "NOT_FOUND" as const };

  const leadIds = Array.from(new Set(params.leadIds)).slice(0, 500);
  await prisma.campaignLead.createMany({
    data: leadIds.map((leadId) => ({
      workspaceId: workspace.id,
      campaignId: campaign.id,
      leadId,
      status: CampaignLeadStatus.DRAFT,
      language: toDbLocale(params.language),
    })),
    skipDuplicates: true,
  });

  return { ok: true as const };
}

export async function generateMessagesForCampaignLeadsAction(params: {
  campaignId: string;
  leadIds: string[];
  style: "COLD_INTRO" | "QUICK_AUDIT" | "FOLLOW_UP";
  tone: "FRIENDLY" | "DIRECT" | "SHARP";
  length: "SHORT" | "MEDIUM";
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.campaignId, workspaceId: workspace.id },
  });
  if (!campaign) return { ok: false as const, error: "NOT_FOUND" as const };

  const target = Array.from(new Set(params.leadIds)).slice(0, 100);

  const job = await runJob({
    workspaceId: workspace.id,
    triggeredById: user.id,
    type: JobType.MESSAGE_GENERATION,
    link: { campaignId: campaign.id },
    payload: {
      campaignId: campaign.id,
      leadIds: target,
      style: params.style,
      tone: params.tone,
      length: params.length,
    },
    handler: async () => {
      const generated: { leadId: string; ok: boolean }[] = [];

      for (const leadId of target) {
        const cl = await prisma.campaignLead.findFirst({
          where: { campaignId: campaign.id, leadId, workspaceId: workspace.id },
        });
        if (!cl) continue;

        const language = cl.language === "EN" ? "en" : cl.language === "RU" ? "ru" : "et";

        const msg = await generateOutreachMessage({
          channel: "EMAIL",
          style: params.style,
          tone: params.tone,
          length: params.length,
          language,
          workspaceId: workspace.id,
          leadId,
        });

        if (!msg.ok) {
          generated.push({ leadId, ok: false });
          await prisma.campaignLead.update({
            where: { id: cl.id },
            data: { lastError: "Message generation failed" },
          });
          continue;
        }

        const variant = await prisma.messageVariant.create({
          data: {
            workspaceId: workspace.id,
            campaignId: campaign.id,
            language: cl.language,
            purpose: "INITIAL",
            subject: msg.output.subject || null,
            bodyText: msg.output.body,
            aiOutput: {
              style: params.style,
              tone: params.tone,
              length: params.length,
              personalizationRationale: msg.output.personalizationRationale,
              confidenceScore: msg.output.confidenceScore,
              qa: msg.qa,
              meta: {
                model: String(msg.meta?.model ?? ""),
                usage: msg.meta?.usage
                  ? {
                      input_tokens: msg.meta.usage.input_tokens ?? null,
                      output_tokens: msg.meta.usage.output_tokens ?? null,
                      total_tokens: msg.meta.usage.total_tokens ?? null,
                    }
                  : null,
                regenerated: !!msg.meta?.regenerated,
                firstQaIssues: (msg.meta as any)?.firstQaIssues ?? null,
              },
            },
            model: msg.meta?.model ?? null,
            prompt: msg.prompt,
            tokensIn: msg.meta?.usage?.input_tokens ?? null,
            tokensOut: msg.meta?.usage?.output_tokens ?? null,
          },
        });

        await prisma.campaignLead.update({
          where: { id: cl.id },
          data: { selectedVariantId: variant.id },
        });

        generated.push({ leadId, ok: true });
      }

      return { generated };
    },
  });

  return { ok: true as const, jobRunId: job.jobRunId, generated: (job as any).result?.generated ?? [] };
}

export async function updateCampaignLeadMessageAction(params: {
  campaignLeadId: string;
  subject: string;
  bodyText: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const cl = await prisma.campaignLead.findFirst({
    where: { id: params.campaignLeadId, workspaceId: workspace.id },
  });
  if (!cl?.selectedVariantId) return { ok: false as const, error: "NOT_FOUND" as const };

  await prisma.messageVariant.update({
    where: { id: cl.selectedVariantId },
    data: { subject: params.subject || null, bodyText: params.bodyText },
  });

  return { ok: true as const };
}

export async function approveCampaignLeadsAction(params: { campaignLeadIds: string[] }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  await prisma.campaignLead.updateMany({
    where: { id: { in: params.campaignLeadIds.slice(0, 500) }, workspaceId: workspace.id },
    data: { status: CampaignLeadStatus.READY },
  });

  return { ok: true as const };
}

export async function sendCampaignNowAction(params: { campaignId: string }) {
  // V1: sending is gated behind email provider configuration.
  // We intentionally do NOT fake sending.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.campaignId, workspaceId: workspace.id },
  });
  if (!campaign) return { ok: false as const, error: "NOT_FOUND" as const };

  if (!process.env.RESEND_API_KEY) return { ok: false as const, error: "SENDING_NOT_CONFIGURED" as const };

  const job = await runJob({
    workspaceId: workspace.id,
    triggeredById: user.id,
    type: JobType.CAMPAIGN_SEND,
    link: { campaignId: campaign.id },
    payload: { campaignId: campaign.id, limit: 50 },
    handler: async () => {
      const results = await sendApprovedCampaignEmails({
        workspaceId: workspace.id,
        campaignId: campaign.id,
        actorUserId: user.id,
        limit: 50,
      });
      return { results };
    },
  });

  return { ok: true as const, jobRunId: job.jobRunId, results: (job as any).result?.results ?? [] };
}

export async function sendCampaignLeadNowAction(params: { campaignId: string; campaignLeadId: string }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  if (!process.env.RESEND_API_KEY) return { ok: false as const, error: "SENDING_NOT_CONFIGURED" as const };

  const res = await sendCampaignLeadEmail({
    workspaceId: workspace.id,
    campaignId: params.campaignId,
    campaignLeadId: params.campaignLeadId,
    actorUserId: user.id,
  });

  return res;
}

