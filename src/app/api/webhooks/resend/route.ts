import { NextResponse } from "next/server";
import { EmailMessageStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

// MVP:
// - Accept Resend webhook payloads and map them back to EmailMessage by providerMessageId.
// - TODO: verify signature (Resend supports signing).
export async function POST(req: Request) {
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const type = payload?.type ?? payload?.event ?? payload?.data?.type;
  const data = payload?.data ?? payload;
  const providerMessageId = data?.email_id ?? data?.id ?? data?.emailId ?? null;

  if (!providerMessageId) {
    return NextResponse.json({ ok: false, error: "missing_message_id" }, { status: 400 });
  }

  const msg = await prisma.emailMessage.findFirst({
    where: { providerMessageId: String(providerMessageId) },
  });
  if (!msg) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const now = new Date();

  const mapStatus = (t: string | null): EmailMessageStatus | null => {
    const s = (t ?? "").toLowerCase();
    if (s.includes("delivered")) return EmailMessageStatus.DELIVERED;
    if (s.includes("opened") || s.includes("open")) return EmailMessageStatus.OPENED;
    if (s.includes("replied") || s.includes("reply")) return EmailMessageStatus.REPLIED;
    if (s.includes("bounced") || s.includes("bounce")) return EmailMessageStatus.BOUNCED;
    if (s.includes("failed")) return EmailMessageStatus.FAILED;
    if (s.includes("sent")) return EmailMessageStatus.SENT;
    return null;
  };

  const nextStatus = mapStatus(type);
  const update: any = {
    raw: payload,
  };

  if (nextStatus) update.status = nextStatus;
  if (nextStatus === EmailMessageStatus.DELIVERED) update.deliveredAt = now;
  if (nextStatus === EmailMessageStatus.OPENED) update.openedAt = now;
  if (nextStatus === EmailMessageStatus.REPLIED) update.repliedAt = now;

  await prisma.emailMessage.update({ where: { id: msg.id }, data: update });

  // Keep CampaignLead status in sync for key states (best-effort).
  if (msg.campaignLeadId) {
    const clUpdate: any = {};
    if (nextStatus === EmailMessageStatus.OPENED) clUpdate.status = "OPENED";
    if (nextStatus === EmailMessageStatus.REPLIED) clUpdate.status = "REPLIED";
    if (nextStatus === EmailMessageStatus.BOUNCED) clUpdate.status = "BOUNCED";
    if (nextStatus === EmailMessageStatus.FAILED) clUpdate.status = "FAILED";
    if (Object.keys(clUpdate).length > 0) {
      await prisma.campaignLead.update({ where: { id: msg.campaignLeadId }, data: clUpdate });
    }
  }

  return NextResponse.json({ ok: true });
}

