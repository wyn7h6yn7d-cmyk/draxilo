import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { CampaignNewClient } from "@/components/campaigns/campaign-new-client";

export default async function CampaignNewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) redirect("/app");

  const leads = await prisma.lead.findMany({
    where: { workspaceId: workspace.id },
    include: { company: true, contact: true },
    orderBy: { updatedAt: "desc" },
    take: 80,
  });

  const { locale, dict } = await getI18n();

  return (
    <div className="space-y-6">
      <CampaignNewClient locale={locale} dict={dict} leads={leads} />
    </div>
  );
}

