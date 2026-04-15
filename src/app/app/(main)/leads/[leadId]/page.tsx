import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { LeadDetailsPanel } from "@/components/leads/lead-details-panel";

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) notFound();

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId: workspace.id },
    include: {
      company: true,
      contact: true,
      source: true,
      enrichments: { orderBy: { createdAt: "desc" }, take: 3 },
      campaignLeads: {
        include: { campaign: true, selectedVariant: true, emailMessages: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
      activities: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
  if (!lead) notFound();

  const { locale, dict } = await getI18n();

  return (
    <div className="space-y-6">
      <LeadDetailsPanel locale={locale} dict={dict} lead={lead} />
    </div>
  );
}

