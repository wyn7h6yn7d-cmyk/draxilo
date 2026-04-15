import { getI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CampaignsPage() {
  const { dict } = await getI18n();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) redirect("/app");

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{dict.campaigns.title}</h1>
        <Link
          href="/app/campaigns/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {dict.campaigns.empty.primaryCta}
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-base font-semibold">{dict.campaigns.empty.title}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {dict.campaigns.empty.description}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">{dict.campaigns.table.name}</th>
                <th className="px-4 py-3">{dict.campaigns.table.status}</th>
                <th className="px-4 py-3">{dict.campaigns.table.updated}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/app/campaigns/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                    {c.objective ? (
                      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {c.objective}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {new Date(c.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

