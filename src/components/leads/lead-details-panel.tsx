"use client";

import * as React from "react";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { enrichLeadAction } from "@/app/actions/enrichment";
import { useToast } from "@/components/toast/toast-provider";
import { bulkScoreLeadsAction } from "@/app/actions/leads";

export function LeadDetailsPanel({
  dict,
  lead,
}: {
  locale: Locale;
  dict: Dictionary;
  lead: any;
}) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const toast = useToast();

  const enrichment = lead.enrichments?.[0] ?? null;

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await enrichLeadAction({ leadId: lead.id });
      if (!res.ok) setError(dict.errors.generic);
      // Let user refresh manually for now.
    });
  }

  function score() {
    startTransition(async () => {
      const res = await bulkScoreLeadsAction({ leadIds: [lead.id] });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.updated });
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{lead.displayName ?? lead.company?.name ?? "—"}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {lead.company?.websiteUrl ?? lead.company?.domain ?? "—"}
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{dict.leads.details.enrichmentTitle}</CardTitle>
              <CardDescription>
                {dict.leads.details.statusLabel}: {enrichment?.status ?? "—"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={score} disabled={pending}>
                {dict.leads.details.scoreAction}
              </Button>
              <Button type="button" onClick={run} disabled={pending}>
                {dict.leads.details.enrichAction}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{dict.leads.details.leadScoreTitle}</div>
              <div className="text-sm">{lead.score ?? "—"}/100</div>
            </div>
            {lead.scoreDetails?.factors ? (
              <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-700 dark:text-zinc-200">
                {JSON.stringify(lead.scoreDetails, null, 2)}
              </pre>
            ) : (
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {dict.leads.details.noScoreYet}
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{dict.leads.details.companyProfileTitle}</CardTitle>
              <CardDescription>
                {lead.company?.country ?? "—"} • {lead.company?.city ?? "—"} •{" "}
                {lead.contact?.email ?? lead.email ?? "—"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-semibold">{dict.leads.details.sourceLabel}:</span>{" "}
                {lead.source?.type ?? "—"}
              </div>
              {lead.source?.input?.sourceUrl ? (
                <a
                  href={lead.source.input.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-zinc-700 hover:underline dark:text-zinc-300"
                >
                  {lead.source.input.sourceUrl}
                </a>
              ) : null}
              {lead.notes ? (
                <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                  {lead.notes}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {enrichment?.output ? (
            <pre className="whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-xs text-zinc-900 dark:bg-zinc-900/30 dark:text-zinc-100">
              {JSON.stringify(enrichment.output, null, 2)}
            </pre>
          ) : (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {dict.leads.details.noEnrichmentYet}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{dict.leads.details.relatedCampaignsTitle}</CardTitle>
              <CardDescription>{dict.leads.details.relatedCampaignsSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(lead.campaignLeads ?? []).length === 0 ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{dict.leads.details.none}</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {lead.campaignLeads.map((cl: any) => (
                    <li key={cl.id} className="flex items-center justify-between">
                      <a className="font-medium hover:underline" href={`/app/campaigns/${cl.campaignId}`}>
                        {cl.campaign?.name ?? cl.campaignId}
                      </a>
                      <span className="text-zinc-600 dark:text-zinc-400">{cl.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Latest events.</CardDescription>
            </CardHeader>
            <CardContent>
              {(lead.activities ?? []).length === 0 ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">No activity yet.</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {lead.activities.map((a: any) => (
                    <li key={a.id} className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{a.action}</div>
                        {a.message ? (
                          <div className="text-zinc-600 dark:text-zinc-400">{a.message}</div>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(a.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

