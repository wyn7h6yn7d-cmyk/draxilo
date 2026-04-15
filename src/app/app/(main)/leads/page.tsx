import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { getI18n } from "@/lib/i18n/server";
import { LeadsTable } from "@/components/leads/leads-table";

function asString(v: string | string[] | undefined) {
  return typeof v === "string" ? v : "";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = asString(sp.q).trim();
  const country = asString(sp.country).trim();
  const city = asString(sp.city).trim();
  const source = asString(sp.source).trim();
  const enrichment = asString(sp.enrichment).trim(); // COMPLETE|RUNNING|FAILED|PENDING|NONE
  const archived = asString(sp.archived).trim() === "1";
  const sort = asString(sp.sort).trim() || "updated_desc";
  const page = Math.max(1, Number(asString(sp.page) || "1") || 1);
  const pageSize = clamp(Math.max(10, Number(asString(sp.pageSize) || "20") || 20), 10, 50);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) redirect("/app");

  const where: any = {
    workspaceId: workspace.id,
    archivedAt: archived ? { not: null } : null,
  };

  if (q) {
    where.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { domain: { contains: q, mode: "insensitive" } },
      { company: { is: { name: { contains: q, mode: "insensitive" } } } },
      { contact: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }
  if (country) where.company = { ...(where.company?.is ?? {}), is: { ...(where.company?.is ?? {}), country: { contains: country, mode: "insensitive" } } };
  if (city) where.company = { ...(where.company?.is ?? {}), is: { ...(where.company?.is ?? {}), city: { contains: city, mode: "insensitive" } } };
  if (source) where.source = { is: { type: source as any } };

  // Enrichment filter will be applied after fetch (latest enrichment per lead).

  const orderBy =
    sort === "score_desc"
      ? [{ score: "desc" as const }, { updatedAt: "desc" as const }]
      : [{ updatedAt: sort === "updated_asc" ? ("asc" as const) : ("desc" as const) }];

  const [total, leads, campaigns] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: {
        company: true,
        contact: true,
        source: true,
        enrichments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.campaign.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  const rows = leads
    .map((l) => ({
      id: l.id,
      companyName: l.company?.name ?? l.displayName ?? null,
      domain: l.company?.domain ?? l.domain ?? null,
      country: l.company?.country ?? null,
      city: l.company?.city ?? null,
      sourceType: l.source?.type ?? null,
      enrichmentStatus: l.enrichments?.[0]?.status ?? "NONE",
      score: l.score ?? null,
      contactEmail: l.contact?.email ?? l.email ?? null,
      updatedAt: l.updatedAt,
    }))
    .filter((r) => (enrichment ? r.enrichmentStatus === enrichment : true));

  const { locale, dict } = await getI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{dict.leads.title}</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/app/leads/search"
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {dict.leads.search.title}
          </Link>
          <Link
            href="/app/leads/import"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            {dict.leads.csvImport.title}
          </Link>
        </div>
      </div>

      <LeadsTable
        locale={locale}
        dict={dict}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
