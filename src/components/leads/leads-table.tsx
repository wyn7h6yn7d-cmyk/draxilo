"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast/toast-provider";
import { bulkArchiveLeadsAction, bulkEnrichLeadsAction, bulkScoreLeadsAction } from "@/app/actions/leads";
import { addLeadsToCampaignAction } from "@/app/actions/campaigns";

type LeadRow = {
  id: string;
  companyName: string | null;
  domain: string | null;
  country: string | null;
  city: string | null;
  sourceType: string | null;
  enrichmentStatus: string;
  score: number | null;
  contactEmail: string | null;
  updatedAt: Date;
};

export function LeadsTable({
  locale,
  dict,
  rows,
  total,
  page,
  pageSize,
  campaigns,
}: {
  locale: Locale;
  dict: Dictionary;
  rows: LeadRow[];
  total: number;
  page: number;
  pageSize: number;
  campaigns: { id: string; name: string }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();
  const [pending, startTransition] = React.useTransition();

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const selectedIds = React.useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );

  const [campaignId, setCampaignId] = React.useState<string>(campaigns[0]?.id ?? "");
  const [campaignLang, setCampaignLang] = React.useState<Locale>(locale);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.replace(`/app/leads?${next.toString()}`);
  }

  function goPage(p: number) {
    const next = new URLSearchParams(sp.toString());
    next.set("page", String(p));
    router.replace(`/app/leads?${next.toString()}`);
  }

  function toggleAll(on: boolean) {
    const next: Record<string, boolean> = {};
    if (on) rows.forEach((r) => (next[r.id] = true));
    setSelected(next);
  }

  function bulkEnrich() {
    startTransition(async () => {
      const res = await bulkEnrichLeadsAction({ leadIds: selectedIds });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.updated });
      router.refresh();
    });
  }

  function bulkScore() {
    startTransition(async () => {
      const res = await bulkScoreLeadsAction({ leadIds: selectedIds });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.updated });
      router.refresh();
    });
  }

  function bulkArchive() {
    startTransition(async () => {
      const res = await bulkArchiveLeadsAction({ leadIds: selectedIds });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.updated });
      router.refresh();
    });
  }

  function bulkAddToCampaign() {
    if (!campaignId) {
      toast.push({ title: dict.toasts.error, description: "No campaign selected", variant: "error" });
      return;
    }
    startTransition(async () => {
      const res = await addLeadsToCampaignAction({
        campaignId,
        leadIds: selectedIds,
        language: campaignLang,
      });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.updated });
      router.refresh();
    });
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{dict.leads.title}</span>
          <div className="text-sm font-normal text-zinc-600 dark:text-zinc-400">
            {total} total
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder={`${dict.common.search}…`}
              defaultValue={sp.get("q") ?? ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
              }}
            />
            <Input
              placeholder={dict.leads.search.form.country}
              defaultValue={sp.get("country") ?? ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") setParam("country", (e.target as HTMLInputElement).value);
              }}
              className="w-28"
            />
            <Input
              placeholder={dict.leads.search.form.cityOrRegion}
              defaultValue={sp.get("city") ?? ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") setParam("city", (e.target as HTMLInputElement).value);
              }}
              className="w-32"
            />
            <select
              defaultValue={sp.get("enrichment") ?? ""}
              onChange={(e) => setParam("enrichment", e.target.value)}
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">{dict.dashboard.recentLeads.columns.enrichment}</option>
              <option value="NONE">{dict.common.none}</option>
              <option value="PENDING">{locale === "et" ? "Ootel" : locale === "ru" ? "Ожидание" : "Pending"}</option>
              <option value="RUNNING">{locale === "et" ? "Töös" : locale === "ru" ? "В работе" : "Running"}</option>
              <option value="COMPLETE">{locale === "et" ? "Valmis" : locale === "ru" ? "Готово" : "Complete"}</option>
              <option value="FAILED">{locale === "et" ? "Ebaõnnestus" : locale === "ru" ? "Ошибка" : "Failed"}</option>
            </select>
            <select
              defaultValue={sp.get("sort") ?? "updated_desc"}
              onChange={(e) => setParam("sort", e.target.value)}
              className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="updated_desc">Updated ↓</option>
              <option value="updated_asc">Updated ↑</option>
              <option value="score_desc">Score ↓</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => toggleAll(true)} disabled={rows.length === 0}>
              {dict.common.selectAll}
            </Button>
            <Button variant="secondary" onClick={() => toggleAll(false)} disabled={rows.length === 0}>
              {dict.common.selectNone}
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              {dict.leads.search.results.selectedCount}: <span className="font-semibold">{selectedIds.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={bulkEnrich} disabled={pending}>
                {dict.leads.details.enrichAction}
              </Button>
              <Button variant="secondary" onClick={bulkScore} disabled={pending}>
                {dict.leads.details.scoreAction}
              </Button>
              <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950">
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="h-9 bg-transparent text-sm"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={campaignLang}
                  onChange={(e) => setCampaignLang(e.target.value as Locale)}
                  className="h-9 bg-transparent text-sm"
                >
                  <option value="et">ET</option>
                  <option value="en">EN</option>
                  <option value="ru">RU</option>
                </select>
                <Button variant="ghost" size="sm" onClick={bulkAddToCampaign} disabled={pending}>
                  {locale === "et" ? "Lisa kampaaniasse" : locale === "ru" ? "Добавить в кампанию" : "Add to campaign"}
                </Button>
              </div>
              <Button variant="secondary" onClick={bulkArchive} disabled={pending}>
                {locale === "et" ? "Arhiveeri" : locale === "ru" ? "Архивировать" : "Archive"}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3">{dict.leads.search.results.columns.company}</th>
                <th className="px-4 py-3">{dict.leads.table.domain}</th>
                <th className="px-4 py-3">{dict.leads.csvImport.fields.country}</th>
                <th className="px-4 py-3">{dict.leads.csvImport.fields.city}</th>
                <th className="px-4 py-3">{dict.leads.table.source}</th>
                <th className="px-4 py-3">{dict.dashboard.recentLeads.columns.enrichment}</th>
                <th className="px-4 py-3">{dict.demo.results.score}</th>
                <th className="px-4 py-3">{dict.auth.fields.email}</th>
                <th className="px-4 py-3">{dict.leads.table.updated}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onChange={(e) => setSelected({ ...selected, [r.id]: e.target.checked })}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/app/leads/${r.id}`} className="hover:underline">
                      {r.companyName ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.domain ?? "—"}</td>
                  <td className="px-4 py-3">{r.country ?? "—"}</td>
                  <td className="px-4 py-3">{r.city ?? "—"}</td>
                  <td className="px-4 py-3">{r.sourceType ?? "—"}</td>
                  <td className="px-4 py-3">{r.enrichmentStatus}</td>
                  <td className="px-4 py-3">{r.score ?? "—"}</td>
                  <td className="px-4 py-3">{r.contactEmail ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {r.updatedAt.toLocaleString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400" colSpan={10}>
                    {dict.leads.empty.title}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} / {pages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => goPage(Math.max(1, page - 1))} disabled={page <= 1}>
              Prev
            </Button>
            <Button
              variant="secondary"
              onClick={() => goPage(Math.min(pages, page + 1))}
              disabled={page >= pages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

