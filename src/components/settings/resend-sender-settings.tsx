"use client";

import * as React from "react";

import type { Dictionary } from "@/lib/i18n/dictionary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/toast-provider";
import { upsertResendConnectionAction } from "@/app/actions/email-connection";

export function ResendSenderSettings({
  dict,
  initial,
  resendConfigured,
}: {
  dict: Dictionary;
  initial: { name: string; fromEmail: string; fromName: string };
  resendConfigured: boolean;
}) {
  const toast = useToast();
  const [pending, startTransition] = React.useTransition();

  const [name, setName] = React.useState(initial.name);
  const [fromEmail, setFromEmail] = React.useState(initial.fromEmail);
  const [fromName, setFromName] = React.useState(initial.fromName);

  function save() {
    startTransition(async () => {
      const res = await upsertResendConnectionAction({
        name,
        fromEmail,
        fromName,
        makeDefault: true,
      });
      if (!res.ok) {
        const msg =
          res.error === "RESEND_NOT_CONFIGURED"
            ? "RESEND_API_KEY missing. Add it to server env."
            : dict.errors.generic;
        toast.push({ title: dict.toasts.error, description: msg, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.saved });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resend sender</CardTitle>
        <CardDescription>
          Workspace-level sender identity. Domain setup happens in Resend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!resendConfigured ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            Resend is not configured. Add <code>RESEND_API_KEY</code> to server env.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Draxion Sender" />
          </div>
          <div className="space-y-2">
            <Label>From email</Label>
            <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="you@yourdomain.com" />
          </div>
          <div className="space-y-2">
            <Label>From name</Label>
            <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="e.g. Anna from Draxion" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Domain verification and DKIM/SPF are managed in Resend. This UI is a placeholder for now.
          </div>
          <Button type="button" onClick={save} disabled={pending}>
            {dict.common.save}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

