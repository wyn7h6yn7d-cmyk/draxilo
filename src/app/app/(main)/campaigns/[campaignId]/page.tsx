import { redirect, notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { getI18n } from "@/lib/i18n/server";
import { CampaignDetailsClient } from "@/components/campaigns/campaign-details-client";

export default async function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) notFound();

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, workspaceId: workspace.id },
  });
  if (!campaign) notFound();

  const leads = await prisma.campaignLead.findMany({
    where: { campaignId: campaign.id, workspaceId: workspace.id },
    include: {
      lead: { include: { company: true, contact: true } },
      selectedVariant: true,
      emailMessages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 300,
  });

  const { locale, dict } = await getI18n();

  return (
    <div className="space-y-6">
      <CampaignDetailsClient locale={locale} dict={dict} campaign={campaign} rows={leads} />
    </div>
  );
}

