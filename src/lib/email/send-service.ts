import { CampaignLeadStatus, EmailMessageDirection, EmailMessageStatus, EmailProvider } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getResendClient } from "@/lib/email/resend-client";
import { renderBasicEmailHtml } from "@/lib/email/templates/basic-email";

function backoffMs(attempt: number) {
  return 600 * Math.pow(2, attempt);
}

async function retry<T>(fn: () => Promise<T>, attempts: number) {
  let last: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, backoffMs(i)));
    }
  }
  throw last;
}

export async function getDefaultEmailConnection(workspaceId: string) {
  return prisma.emailConnection.findFirst({
    where: { workspaceId, provider: EmailProvider.RESEND, isActive: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * Idempotency strategy:
 * - Before sending, check if an OUTBOUND EmailMessage already exists for this campaignLead
 *   with a providerMessageId OR status not FAILED. If so, return it.
 * - Create EmailMessage with status QUEUED, then send with Resend idempotency key = emailMessage.id.
 */
export async function sendCampaignLeadEmail(params: {
  workspaceId: string;
  campaignId: string;
  campaignLeadId: string;
  actorUserId?: string | null;
}) {
  const [cl, connection] = await Promise.all([
    prisma.campaignLead.findFirst({
      where: { id: params.campaignLeadId, workspaceId: params.workspaceId, campaignId: params.campaignId },
      include: {
        lead: { include: { contact: true, company: true } },
        selectedVariant: true,
      },
    }),
    getDefaultEmailConnection(params.workspaceId),
  ]);

  if (!cl) return { ok: false as const, error: "NOT_FOUND" as const };
  if (cl.status !== CampaignLeadStatus.READY) return { ok: false as const, error: "NOT_READY" as const };
  if (!cl.selectedVariant) return { ok: false as const, error: "NO_MESSAGE" as const };

  const toEmail = cl.lead.contact?.email ?? cl.lead.email ?? null;
  if (!toEmail) return { ok: false as const, error: "NO_RECIPIENT" as const };

  if (!process.env.RESEND_API_KEY) return { ok: false as const, error: "RESEND_NOT_CONFIGURED" as const };
  if (!connection?.fromEmail) return { ok: false as const, error: "SENDER_NOT_CONFIGURED" as const };

  // Idempotency: if already queued/sent, do not send again.
  const existing = await prisma.emailMessage.findFirst({
    where: {
      workspaceId: params.workspaceId,
      campaignLeadId: cl.id,
      direction: EmailMessageDirection.OUTBOUND,
      status: { notIn: [EmailMessageStatus.FAILED] },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing && (existing.providerMessageId || existing.status !== EmailMessageStatus.FAILED)) {
    return { ok: true as const, emailMessageId: existing.id, alreadySent: true as const };
  }

  const subject = cl.selectedVariant.subject ?? "(no subject)";
  const bodyText = cl.selectedVariant.bodyText;
  const bodyHtml = renderBasicEmailHtml({ subject, bodyText });

  const emailMessage = await prisma.emailMessage.create({
    data: {
      workspaceId: params.workspaceId,
      campaignId: params.campaignId,
      campaignLeadId: cl.id,
      leadId: cl.leadId,
      emailConnectionId: connection.id,
      direction: EmailMessageDirection.OUTBOUND,
      status: EmailMessageStatus.QUEUED,
      fromEmail: connection.fromEmail,
      toEmail,
      subject,
      bodyText,
      bodyHtml,
      raw: { provider: "resend", idempotencyKey: null },
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId: params.workspaceId,
      actorUserId: params.actorUserId ?? null,
      entityType: "EMAIL_MESSAGE",
      entityId: emailMessage.id,
      action: "email.queued",
      campaignId: params.campaignId,
      leadId: cl.leadId,
      emailMessageId: emailMessage.id,
      metadata: { toEmail },
    },
  });

  const resend = getResendClient();

  try {
    const sent = await retry(
      async () => {
        const from = connection.fromName
          ? `${connection.fromName} <${connection.fromEmail}>`
          : connection.fromEmail;
        if (!from) throw new Error("Sender fromEmail missing");
        const res = await resend.emails.send({
          from,
          to: [toEmail],
          subject,
          html: bodyHtml,
          text: bodyText,
          headers: {
            "Idempotency-Key": emailMessage.id,
          },
        });
        if ((res as any)?.error) throw new Error((res as any).error?.message ?? "Resend send failed");
        return res as any;
      },
      2,
    );

    const providerMessageId = sent?.data?.id ?? sent?.id ?? null;

    await prisma.emailMessage.update({
      where: { id: emailMessage.id },
      data: {
        providerMessageId,
        status: EmailMessageStatus.SENT,
        sentAt: new Date(),
        raw: { provider: "resend", response: sent, idempotencyKey: emailMessage.id },
      },
    });

    await prisma.campaignLead.update({
      where: { id: cl.id },
      data: { status: CampaignLeadStatus.SENT, sentAt: new Date(), lastError: null },
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: params.workspaceId,
        actorUserId: params.actorUserId ?? null,
        entityType: "EMAIL_MESSAGE",
        entityId: emailMessage.id,
        action: "email.sent",
        campaignId: params.campaignId,
        leadId: cl.leadId,
        emailMessageId: emailMessage.id,
        metadata: { providerMessageId, toEmail },
      },
    });

    return { ok: true as const, emailMessageId: emailMessage.id, alreadySent: false as const };
  } catch (e: any) {
    await prisma.emailMessage.update({
      where: { id: emailMessage.id },
      data: {
        status: EmailMessageStatus.FAILED,
        error: e?.message ?? "Send failed",
      },
    });
    await prisma.campaignLead.update({
      where: { id: cl.id },
      data: { status: CampaignLeadStatus.FAILED, lastError: e?.message ?? "Send failed" },
    });
    await prisma.activityLog.create({
      data: {
        workspaceId: params.workspaceId,
        actorUserId: params.actorUserId ?? null,
        entityType: "EMAIL_MESSAGE",
        entityId: emailMessage.id,
        action: "email.failed",
        campaignId: params.campaignId,
        leadId: cl.leadId,
        emailMessageId: emailMessage.id,
        metadata: { toEmail },
        message: e?.message ?? "Send failed",
      },
    });
    return { ok: false as const, error: "SEND_FAILED" as const };
  }
}

export async function sendApprovedCampaignEmails(params: {
  workspaceId: string;
  campaignId: string;
  actorUserId?: string | null;
  limit?: number;
}) {
  const campaignLeads = await prisma.campaignLead.findMany({
    where: {
      workspaceId: params.workspaceId,
      campaignId: params.campaignId,
      status: CampaignLeadStatus.READY,
    },
    orderBy: { updatedAt: "asc" },
    take: params.limit ?? 50,
  });

  const results: { campaignLeadId: string; ok: boolean }[] = [];
  for (const cl of campaignLeads) {
    const r = await sendCampaignLeadEmail({
      workspaceId: params.workspaceId,
      campaignId: params.campaignId,
      campaignLeadId: cl.id,
      actorUserId: params.actorUserId ?? null,
    });
    results.push({ campaignLeadId: cl.id, ok: r.ok });
  }
  return results;
}

