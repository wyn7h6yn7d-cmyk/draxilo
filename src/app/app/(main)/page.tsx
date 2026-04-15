import { getI18n } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AppHome() {
  const { dict } = await getI18n();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return null;
  }

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return null;

  const onboardingComplete = !!workspace.settings?.onboardingCompletedAt;

  const [
    totalLeads,
    enrichedLeads,
    activeCampaigns,
    sentEmails,
    replies,
    topIndustries,
    topCountries,
    recentLeads,
    recentCampaigns,
    recentActivity,
  ] = await Promise.all([
    prisma.lead.count({ where: { workspaceId: workspace.id, archivedAt: null } }),
    prisma.leadEnrichment.count({ where: { workspaceId: workspace.id, status: "COMPLETE" } }),
    prisma.campaign.count({
      where: { workspaceId: workspace.id, status: { in: ["RUNNING", "PAUSED", "DRAFT"] } },
    }),
    prisma.emailMessage.count({
      where: { workspaceId: workspace.id, direction: "OUTBOUND", status: { in: ["SENT", "DELIVERED", "OPENED", "REPLIED"] } },
    }),
    prisma.emailMessage.count({
      where: { workspaceId: workspace.id, direction: "OUTBOUND", status: "REPLIED" },
    }),
    prisma.leadCompany
      .groupBy({
        by: ["industry"],
        where: { workspaceId: workspace.id, industry: { not: null } },
        _count: { industry: true },
        orderBy: { _count: { industry: "desc" } },
        take: 5,
      })
      .then((rows) => rows.map((r) => ({ label: r.industry as string, count: r._count.industry }))),
    prisma.leadCompany
      .groupBy({
        by: ["country"],
        where: { workspaceId: workspace.id, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 5,
      })
      .then((rows) => rows.map((r) => ({ label: r.country as string, count: r._count.country }))),
    prisma.lead.findMany({
      where: { workspaceId: workspace.id, archivedAt: null },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { company: true, contact: true, enrichments: { take: 1, orderBy: { createdAt: "desc" } } },
    }),
    prisma.campaign.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { leads: true } } },
    }),
    prisma.activityLog.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const replyRate = sentEmails > 0 ? Math.round((replies / sentEmails) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{dict.dashboard.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{dict.dashboard.subtitle}</p>
        </div>
      </div>

      {!onboardingComplete ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.dashboard.onboarding.title}</CardTitle>
            <CardDescription>{dict.dashboard.onboarding.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/app/onboarding"
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {dict.dashboard.onboarding.cta}
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi title={dict.dashboard.kpis.totalLeads} value={totalLeads} />
        <Kpi title={dict.dashboard.kpis.enrichedLeads} value={enrichedLeads} />
        <Kpi title={dict.dashboard.kpis.activeCampaigns} value={activeCampaigns} />
        <Kpi title={dict.dashboard.kpis.sentEmails} value={sentEmails} />
        <Kpi title={dict.dashboard.kpis.replies} value={replies} />
        <Kpi title={dict.dashboard.kpis.replyRate} value={`${replyRate}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{dict.dashboard.ctas.title}</CardTitle>
            <CardDescription>{dict.dashboard.ctas.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <CtaCard
              title={dict.dashboard.ctas.leadSearch.title}
              description={dict.dashboard.ctas.leadSearch.subtitle}
              href="/app/leads/search"
              action={dict.dashboard.ctas.leadSearch.action}
            />
            <CtaCard
              title={dict.dashboard.ctas.csvImport.title}
              description={dict.dashboard.ctas.csvImport.subtitle}
              href="/app/leads/import"
              action={dict.dashboard.ctas.csvImport.action}
            />
            <CtaCard
              title={dict.dashboard.ctas.createCampaign.title}
              description={dict.dashboard.ctas.createCampaign.subtitle}
              href="/app/campaigns/new"
              action={dict.dashboard.ctas.createCampaign.action}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dict.dashboard.topCountries.title}</CardTitle>
            <CardDescription>{dict.dashboard.topCountries.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topCountries.length ? (
              topCountries.map((x) => (
                <div key={x.label} className="flex items-center justify-between text-sm">
                  <div className="text-zinc-700 dark:text-zinc-300">{x.label}</div>
                  <div className="text-zinc-500 dark:text-zinc-400">{x.count}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{dict.dashboard.topCountries.empty}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{dict.dashboard.topIndustries.title}</CardTitle>
            <CardDescription>{dict.dashboard.topIndustries.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topIndustries.length ? (
              topIndustries.map((x) => (
                <div key={x.label} className="flex items-center justify-between text-sm">
                  <div className="text-zinc-700 dark:text-zinc-300">{x.label}</div>
                  <div className="text-zinc-500 dark:text-zinc-400">{x.count}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{dict.dashboard.topIndustries.empty}</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{dict.dashboard.recentLeads.title}</CardTitle>
            <CardDescription>{dict.dashboard.recentLeads.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="py-2 pr-4">{dict.dashboard.recentLeads.columns.company}</th>
                  <th className="py-2 pr-4">{dict.dashboard.recentLeads.columns.email}</th>
                  <th className="py-2 pr-4">{dict.dashboard.recentLeads.columns.enrichment}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentLeads.map((l) => {
                  const company = l.company?.name ?? l.displayName ?? "—";
                  const email = l.contact?.email ?? l.email ?? "—";
                  const enrichment = l.enrichments?.[0]?.status ?? "—";
                  return (
                    <tr key={l.id}>
                      <td className="py-2 pr-4">
                        <Link href={`/app/leads/${l.id}`} className="text-zinc-900 hover:underline dark:text-zinc-100">
                          {company}
                        </Link>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{l.company?.domain ?? l.domain ?? ""}</div>
                      </td>
                      <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{email}</td>
                      <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">{enrichment}</td>
                    </tr>
                  );
                })}
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-sm text-zinc-600 dark:text-zinc-400">
                      {dict.dashboard.recentLeads.empty}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{dict.dashboard.recentCampaigns.title}</CardTitle>
            <CardDescription>{dict.dashboard.recentCampaigns.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCampaigns.length ? (
              recentCampaigns.map((c) => (
                <Link
                  key={c.id}
                  href={`/app/campaigns/${c.id}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{c.status}</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {dict.dashboard.recentCampaigns.leadsCount.replace("{n}", String(c._count.leads))}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{dict.dashboard.recentCampaigns.empty}</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{dict.dashboard.recentActivity.title}</CardTitle>
            <CardDescription>{dict.dashboard.recentActivity.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.length ? (
              recentActivity.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate text-zinc-900 dark:text-zinc-100">
                      {a.message ?? a.action}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{a.action}</div>
                  </div>
                  <div className="whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{dict.dashboard.recentActivity.empty}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function CtaCard({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
    >
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</div>
      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</div>
      <div className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 underline-offset-4 hover:underline">
        {action}
      </div>
    </Link>
  );
}

