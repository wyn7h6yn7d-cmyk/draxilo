"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast/toast-provider";
import {
  approveCampaignLeadsAction,
  generateMessagesForCampaignLeadsAction,
  sendCampaignNowAction,
  sendCampaignLeadNowAction,
  updateCampaignLeadMessageAction,
} from "@/app/actions/campaigns";

type Row = {
  id: string;
  status: string;
  language: string;
  updatedAt: Date;
  lastError: string | null;
  lead: {
    id: string;
    company: { name: string | null; domain: string | null } | null;
    contact: { email: string | null } | null;
  };
  selectedVariant: { id: string; subject: string | null; bodyText: string } | null;
  emailMessages?: { id: string; status: string; providerMessageId: string | null }[];
};

export function CampaignDetailsClient({
  locale,
  dict,
  campaign,
  rows,
}: {
  locale: Locale;
  dict: Dictionary;
  campaign: any;
  rows: Row[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = React.useTransition();

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string>("ALL");
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const selectedIds = React.useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "ALL" && r.status !== status) return false;
      if (!qq) return true;
      const company = r.lead.company?.name?.toLowerCase() ?? "";
      const email = r.lead.contact?.email?.toLowerCase() ?? "";
      const subject = r.selectedVariant?.subject?.toLowerCase() ?? "";
      return company.includes(qq) || email.includes(qq) || subject.includes(qq);
    });
  }, [rows, q, status]);

  const stats = React.useMemo(() => {
    const by: Record<string, number> = {};
    rows.forEach((r) => {
      by[r.status] = (by[r.status] ?? 0) + 1;
    });
    return by;
  }, [rows]);

  function bulkGenerate() {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const res = await generateMessagesForCampaignLeadsAction({
        campaignId: campaign.id,
        leadIds: selectedIds.map((id) => rows.find((r) => r.id === id)!.lead.id),
        style: "COLD_INTRO",
        tone: "DIRECT",
        length: "SHORT",
      });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.updated });
      router.refresh();
    });
  }

  function bulkApprove() {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const res = await approveCampaignLeadsAction({ campaignLeadIds: selectedIds });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.updated });
      router.refresh();
    });
  }

  function sendNow() {
    startTransition(async () => {
      const res = await sendCampaignNowAction({ campaignId: campaign.id });
      if (!res.ok) {
        const msg =
          res.error === "SENDING_NOT_CONFIGURED"
            ? "Email sending is not configured (RESEND_API_KEY missing)."
              : dict.errors.generic;
        toast.push({ title: dict.toasts.error, description: msg, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.updated });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{campaign.name}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {campaign.objective ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/campaigns/new">
            <Button variant="secondary">New</Button>
          </Link>
          <Button onClick={sendNow} disabled={pending}>
            Send now
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {Object.entries(stats).map(([k, v]) => (
          <Card key={k}>
            <CardHeader>
              <CardTitle className="text-sm">{k}</CardTitle>
              <CardDescription>{v}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>Review, edit, approve, then send.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="ALL">All</option>
                <option value="DRAFT">DRAFT</option>
                <option value="READY">READY</option>
                <option value="SENT">SENT</option>
                <option value="OPENED">OPENED</option>
                <option value="REPLIED">REPLIED</option>
                <option value="BOUNCED">BOUNCED</option>
                <option value="FAILED">FAILED</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={bulkGenerate} disabled={pending || selectedIds.length === 0}>
                Generate
              </Button>
              <Button onClick={bulkApprove} disabled={pending || selectedIds.length === 0}>
                Approve
              </Button>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Selected: {selectedIds.length}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="w-10 py-2" />
                  <th className="py-2">Company</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Lang</th>
                  <th className="py-2">Subject</th>
                  <th className="py-2">Preview</th>
                  <th className="py-2">Delivery</th>
                  <th className="py-2">Last</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.map((r) => (
                  <CampaignLeadRow
                    key={r.id}
                    row={r}
                    selected={!!selected[r.id]}
                    onSelect={(v) => setSelected({ ...selected, [r.id]: v })}
                    pending={pending}
                    onSaved={() => {
                      toast.push({ title: dict.toasts.saved });
                      router.refresh();
                    }}
                    onError={() =>
                      toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" })
                    }
                    onSend={() => {
                      startTransition(async () => {
                        const res = await sendCampaignLeadNowAction({
                          campaignId: campaign.id,
                          campaignLeadId: r.id,
                        });
                        if (!res.ok) {
                          const msg =
                            res.error === "SENDING_NOT_CONFIGURED"
                              ? "Email sending is not configured (RESEND_API_KEY missing)."
                              : dict.errors.generic;
                          toast.push({ title: dict.toasts.error, description: msg, variant: "error" });
                          return;
                        }
                        toast.push({ title: dict.toasts.updated });
                        router.refresh();
                      });
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignLeadRow({
  row,
  selected,
  onSelect,
  pending,
  onSaved,
  onError,
  onSend,
}: {
  row: Row;
  selected: boolean;
  onSelect: (v: boolean) => void;
  pending: boolean;
  onSaved: () => void;
  onError: () => void;
  onSend: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [subject, setSubject] = React.useState(row.selectedVariant?.subject ?? "");
  const [body, setBody] = React.useState(row.selectedVariant?.bodyText ?? "");
  const [saving, startTransition] = React.useTransition();

  function save() {
    if (!row.selectedVariant) return;
    startTransition(async () => {
      const res = await updateCampaignLeadMessageAction({
        campaignLeadId: row.id,
        subject,
        bodyText: body,
      });
      if (!res.ok) {
        onError();
        return;
      }
      setEditing(false);
      onSaved();
    });
  }

  const preview = (row.selectedVariant?.bodyText ?? "").replace(/\s+/g, " ").slice(0, 80);
  const delivery = row.emailMessages?.[0]?.status ?? "—";

  return (
    <tr className="align-top">
      <td className="py-3">
        <input type="checkbox" checked={selected} onChange={(e) => onSelect(e.target.checked)} />
      </td>
      <td className="py-3 font-medium">
        {row.lead.company?.name ?? "—"}
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          {row.lead.company?.domain ?? ""}
        </div>
      </td>
      <td className="py-3">{row.lead.contact?.email ?? "—"}</td>
      <td className="py-3">{row.status}</td>
      <td className="py-3">{row.language}</td>
      <td className="py-3">
        {editing ? (
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        ) : (
          row.selectedVariant?.subject ?? "—"
        )}
        {row.lastError ? (
          <div className="mt-1 text-xs text-red-700 dark:text-red-300">{row.lastError}</div>
        ) : null}
      </td>
      <td className="py-3">
        {editing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-24 w-[420px] max-w-[60vw] rounded-md border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          />
        ) : (
          <span className="text-zinc-700 dark:text-zinc-300">{preview || "—"}</span>
        )}
      </td>
      <td className="py-3">{delivery}</td>
      <td className="py-3 text-xs text-zinc-500 dark:text-zinc-400">
        {new Date(row.updatedAt).toLocaleString()}
        <div className="mt-2 flex gap-2">
          {!editing ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={pending}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button type="button" size="sm" onClick={save} disabled={saving}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setSubject(row.selectedVariant?.subject ?? "");
                  setBody(row.selectedVariant?.bodyText ?? "");
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onSend} disabled={pending}>
            Send
          </Button>
        </div>
      </td>
    </tr>
  );
}

