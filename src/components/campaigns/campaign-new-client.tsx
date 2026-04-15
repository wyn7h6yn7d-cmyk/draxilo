"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast/toast-provider";
import {
  addLeadsToCampaignAction,
  createCampaignAction,
  generateMessagesForCampaignLeadsAction,
} from "@/app/actions/campaigns";

type LeadRow = {
  id: string;
  displayName: string | null;
  domain: string | null;
  company: { name: string | null; domain: string | null } | null;
  contact: { email: string | null } | null;
};

export function CampaignNewClient({
  locale,
  dict,
  leads,
}: {
  locale: Locale;
  dict: Dictionary;
  leads: LeadRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = React.useTransition();

  const [name, setName] = React.useState("");
  const [objective, setObjective] = React.useState("");
  const [campaignLocale, setCampaignLocale] = React.useState<Locale>(locale);

  const [style, setStyle] = React.useState<"COLD_INTRO" | "QUICK_AUDIT" | "FOLLOW_UP">(
    "COLD_INTRO",
  );
  const [tone, setTone] = React.useState<"FRIENDLY" | "DIRECT" | "SHARP">("DIRECT");
  const [length, setLength] = React.useState<"SHORT" | "MEDIUM">("SHORT");

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const selectedIds = React.useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );

  function create() {
    if (!name.trim()) {
      toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
      return;
    }

    startTransition(async () => {
      const created = await createCampaignAction({
        name,
        objective,
        localeDefault: campaignLocale,
      });
      if (!created.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }

      if (selectedIds.length > 0) {
        await addLeadsToCampaignAction({
          campaignId: created.campaignId,
          leadIds: selectedIds,
          language: campaignLocale,
        });
      }

      if (selectedIds.length > 0) {
        await generateMessagesForCampaignLeadsAction({
          campaignId: created.campaignId,
          leadIds: selectedIds,
          style,
          tone,
          length,
        });
      }

      toast.push({ title: dict.toasts.saved });
      router.push(`/app/campaigns/${created.campaignId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{dict.campaigns.empty.primaryCta}</h1>
        <Button onClick={create} disabled={pending}>
          {dict.common.save}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.campaigns.title}</CardTitle>
          <CardDescription>Basics</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. April outbound" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Objective</Label>
            <Input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="e.g. book 5 calls" />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <select
              value={campaignLocale}
              onChange={(e) => setCampaignLocale(e.target.value as Locale)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="et">ET</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message defaults</CardTitle>
          <CardDescription>Used for bulk generation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Style</Label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="COLD_INTRO">Cold intro</option>
              <option value="QUICK_AUDIT">Quick audit</option>
              <option value="FOLLOW_UP">Follow-up</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="FRIENDLY">Friendly</option>
              <option value="DIRECT">Direct</option>
              <option value="SHARP">Sharp</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Length</Label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as any)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="SHORT">Short</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select leads</CardTitle>
          <CardDescription>Pick leads to add and generate messages for.</CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{dict.leads.empty.title}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="w-10 py-2" />
                    <th className="py-2">{dict.leads.table.company}</th>
                    <th className="py-2">{dict.leads.table.domain}</th>
                    <th className="py-2">{dict.leads.table.email}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[l.id]}
                          onChange={(e) => setSelected({ ...selected, [l.id]: e.target.checked })}
                        />
                      </td>
                      <td className="py-3 font-medium">{l.company?.name ?? l.displayName ?? "—"}</td>
                      <td className="py-3">{l.company?.domain ?? l.domain ?? "—"}</td>
                      <td className="py-3">{l.contact?.email ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Selected: {selectedIds.length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

