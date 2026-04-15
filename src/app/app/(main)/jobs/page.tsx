import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";

export default async function JobsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return null;

  const jobs = await prisma.jobRun.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Jobs</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Recent background-like runs for this workspace.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Attempts</th>
              <th className="px-3 py-2">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {jobs.map((j) => (
              <tr key={j.id} className="align-top">
                <td className="px-3 py-2 whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                  {new Date(j.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{j.type}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center rounded-md border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                    {j.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                  {j.attempts}/{j.maxAttempts}
                </td>
                <td className="px-3 py-2 text-xs text-red-700 dark:text-red-300">{j.error ?? ""}</td>
              </tr>
            ))}
            {jobs.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-sm text-zinc-600 dark:text-zinc-400" colSpan={5}>
                  No jobs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        {jobs.slice(0, 10).map((j) => (
          <details key={j.id} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <summary className="cursor-pointer text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {j.type} — {j.status} — {j.id}
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Payload</div>
                <pre className="mt-1 max-h-64 overflow-auto rounded-md bg-zinc-50 p-2 text-xs text-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
                  {JSON.stringify(j.payload, null, 2)}
                </pre>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Result</div>
                <pre className="mt-1 max-h-64 overflow-auto rounded-md bg-zinc-50 p-2 text-xs text-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
                  {JSON.stringify(j.result, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

