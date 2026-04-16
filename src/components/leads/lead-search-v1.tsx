"use client";

import * as React from "react";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { leadSearchSchema, type LeadSearchInput } from "@/lib/validation/lead-search";
import { saveLeadsFromSearchAction, searchLeadsAction } from "@/app/actions/lead-search";
import type { SearchCompanyResult } from "@/lib/leads/providers/types";

type Tab = "public_web" | "csv";

function formatLocation(r: SearchCompanyResult) {
  const parts = [r.city, r.country].filter(Boolean);
  return parts.join(", ");
}

export function LeadSearchV1({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [tab, setTab] = React.useState<Tab>("public_web");

  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [leadSourceId, setLeadSourceId] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<SearchCompanyResult[]>([]);
  const [totalEstimate, setTotalEstimate] = React.useState<number | null>(null);
  const [selected, setSelected] = React.useState<Record<number, boolean>>({});

  const [form, setForm] = React.useState<Omit<LeadSearchInput, "page" | "pageSize">>({
    keyword: "",
    industry: "",
    country: "",
    cityOrRegion: "",
    companySize: "",
    language: "",
    mustHaveWords: "",
    excludeWords: "",
  });

  function toggleAll(on: boolean) {
    const next: Record<number, boolean> = {};
    if (on) results.forEach((_, idx) => (next[idx] = true));
    setSelected(next);
  }

  const selectedItems = React.useMemo(
    () => results.filter((_, idx) => selected[idx]),
    [results, selected],
  );

  function runSearch(nextPage: number) {
    setError(null);
    setSelected({});

    const input = { ...form, page: nextPage, pageSize };
    const parsed = leadSearchSchema.safeParse(input);
    if (!parsed.success) {
      setError(dict.errors.generic);
      return;
    }

    startTransition(async () => {
      const res = await searchLeadsAction({ providerKey: "PUBLIC_WEB_PROVIDER", query: parsed.data });
      if (!res.ok) {
        setError(res.error === "PROVIDER_NOT_CONFIGURED" ? (res.message ?? dict.leads.search.providerNotConfigured) : dict.errors.generic);
        setResults([]);
        setLeadSourceId(null);
        setTotalEstimate(null);
        return;
      }

      setLeadSourceId(res.leadSourceId);
      setResults(res.results);
      setTotalEstimate(res.totalEstimate ?? null);
      setPage(res.page);
    });
  }

  function saveSelected() {
    if (!leadSourceId || selectedItems.length === 0) return;
    setError(null);
    startTransition(async () => {
      const res = await saveLeadsFromSearchAction({ leadSourceId, selected: selectedItems });
      if (!res.ok) {
        setError(dict.errors.generic);
        return;
      }
      // Minimal UX: clear selection after save.
      setSelected({});
    });
  }

  async function onCsvFile(file: File) {
    setError(null);
    setLeadSourceId(null);
    setTotalEstimate(null);
    setSelected({});
    const text = await file.text();
    startTransition(async () => {
      const res = await searchLeadsAction({ providerKey: "CSV_PROVIDER", csvText: text });
      if (!res.ok) {
        setError(res.message ?? dict.errors.generic);
        setResults([]);
        return;
      }
      setResults(res.results);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{dict.leads.search.title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.leads.search.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={[
            "h-9 rounded-md border px-3 text-sm",
            tab === "public_web"
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
              : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
          ].join(" ")}
          onClick={() => setTab("public_web")}
        >
          {dict.leads.search.tabs.publicWeb}
        </button>
        <button
          type="button"
          className={[
            "h-9 rounded-md border px-3 text-sm",
            tab === "csv"
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
              : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
          ].join(" ")}
          onClick={() => setTab("csv")}
        >
          {dict.leads.search.tabs.csv}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {tab === "public_web" ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.leads.search.tabs.publicWeb}</CardTitle>
            <CardDescription>{dict.leads.search.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{dict.leads.search.form.keyword}</Label>
                <Input
                  value={form.keyword}
                  onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                  placeholder={dict.leads.search.placeholders.keyword}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.leads.search.form.industry}</Label>
                <Input
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder={dict.leads.search.placeholders.industry}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.leads.search.form.country}</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder={dict.leads.search.placeholders.country}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.leads.search.form.cityOrRegion}</Label>
                <Input
                  value={form.cityOrRegion}
                  onChange={(e) => setForm({ ...form, cityOrRegion: e.target.value })}
                  placeholder={dict.leads.search.placeholders.cityOrRegion}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.leads.search.form.companySize}</Label>
                <Input
                  value={form.companySize}
                  onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                  placeholder={dict.leads.search.placeholders.companySize}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.leads.search.form.language}</Label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value as any })}
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="">{dict.leads.search.form.language}</option>
                  <option value="et">ET</option>
                  <option value="en">EN</option>
                  <option value="ru">RU</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{dict.leads.search.form.mustHaveWords}</Label>
                <Input
                  value={form.mustHaveWords}
                  onChange={(e) => setForm({ ...form, mustHaveWords: e.target.value })}
                  placeholder={dict.leads.search.placeholders.mustHaveWords}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.leads.search.form.excludeWords}</Label>
                <Input
                  value={form.excludeWords}
                  onChange={(e) => setForm({ ...form, excludeWords: e.target.value })}
                  placeholder={dict.leads.search.placeholders.excludeWords}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button type="button" onClick={() => runSearch(1)} disabled={pending}>
                {dict.leads.search.actions.search}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => runSearch(Math.max(1, page - 1))}
                  disabled={pending || page <= 1}
                >
                  {dict.leads.search.actions.prev}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => runSearch(page + 1)}
                  disabled={pending || (totalEstimate !== null && page * pageSize >= totalEstimate)}
                >
                  {dict.leads.search.actions.next}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{dict.leads.search.csv.title}</CardTitle>
            <CardDescription>{dict.leads.search.csv.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>{dict.leads.search.csv.upload}</Label>
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onCsvFile(f);
              }}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{dict.leads.search.csv.hint}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{dict.leads.search.results.title}</CardTitle>
              <CardDescription>
                {dict.leads.search.results.selectedCount}: {selectedItems.length}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => toggleAll(true)} disabled={results.length === 0}>
                {dict.leads.search.actions.selectAll}
              </Button>
              <Button type="button" variant="secondary" onClick={() => toggleAll(false)} disabled={results.length === 0}>
                {dict.leads.search.actions.selectNone}
              </Button>
              <Button type="button" onClick={saveSelected} disabled={pending || !leadSourceId || selectedItems.length === 0}>
                {dict.leads.search.actions.saveSelected}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{dict.leads.search.results.empty}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="w-10 py-2" />
                    <th className="py-2">{dict.leads.search.results.columns.company}</th>
                    <th className="py-2">{dict.leads.search.results.columns.domain}</th>
                    <th className="py-2">{dict.leads.search.results.columns.location}</th>
                    <th className="py-2">{dict.leads.search.results.columns.snippet}</th>
                    <th className="py-2">{dict.leads.search.results.columns.confidence}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {results.map((r, idx) => (
                    <tr key={`${r.domain ?? r.sourceUrl ?? "row"}-${idx}`} className="align-top">
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[idx]}
                          onChange={(e) => setSelected({ ...selected, [idx]: e.target.checked })}
                        />
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{r.companyName ?? "—"}</div>
                        {r.sourceUrl ? (
                          <a
                            href={r.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-zinc-600 hover:underline dark:text-zinc-400"
                          >
                            {r.sourceUrl}
                          </a>
                        ) : null}
                      </td>
                      <td className="py-3">{r.domain ?? "—"}</td>
                      <td className="py-3">{formatLocation(r) || "—"}</td>
                      <td className="py-3">
                        <div className="text-zinc-700 dark:text-zinc-300">{r.title ?? "—"}</div>
                        {r.snippet ? (
                          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{r.snippet}</div>
                        ) : null}
                      </td>
                      <td className="py-3">
                        {typeof r.confidenceScore === "number"
                          ? `${Math.round(r.confidenceScore * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

