"use client";

import * as React from "react";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast/toast-provider";
import { updateAiSettingsAction, updateLocalizationAction, updateProfileAction, updateWorkspaceAction } from "@/app/actions/settings";
import { setLocaleAction } from "@/app/actions/locale";
import { ResendSenderSettings } from "@/components/settings/resend-sender-settings";

type TabKey = "profile" | "workspace" | "localization" | "email" | "ai" | "privacy";

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function SettingsClient({
  dict,
  locale,
  initial,
}: {
  dict: Dictionary;
  locale: Locale;
  initial: {
    profile: { fullName: string; timezone: string; locale: Locale };
    workspace: { name: string };
    workspaceSettings: {
      websiteUrl: string;
      whatYouSell: string;
      callToAction: string;
      targetCustomerDescription: string;
      languagesToUse: Locale[];
      preferredOutreachLanguage: Locale;
      tonePreference: string;
      defaultMessageLength: "SHORT" | "MEDIUM" | "";
      extraAiInstruction: string;
    };
    email: { connection: { name: string; fromEmail: string; fromName: string } | null; resendConfigured: boolean };
  };
}) {
  const toast = useToast();
  const [tab, setTab] = React.useState<TabKey>("profile");
  const [pending, startTransition] = React.useTransition();

  const [fullName, setFullName] = React.useState(initial.profile.fullName);
  const [timezone, setTimezone] = React.useState(initial.profile.timezone);
  const [workspaceName, setWorkspaceName] = React.useState(initial.workspace.name);
  const [websiteUrl, setWebsiteUrl] = React.useState(initial.workspaceSettings.websiteUrl);
  const [whatYouSell, setWhatYouSell] = React.useState(initial.workspaceSettings.whatYouSell);
  const [callToAction, setCallToAction] = React.useState(initial.workspaceSettings.callToAction);
  const [targetCustomerDescription, setTargetCustomerDescription] = React.useState(
    initial.workspaceSettings.targetCustomerDescription,
  );
  const [languagesToUse, setLanguagesToUse] = React.useState<Locale[]>(initial.workspaceSettings.languagesToUse);
  const [preferredOutreachLanguage, setPreferredOutreachLanguage] = React.useState<Locale>(
    initial.workspaceSettings.preferredOutreachLanguage,
  );
  const [tonePreference, setTonePreference] = React.useState(initial.workspaceSettings.tonePreference);
  const [defaultMessageLength, setDefaultMessageLength] = React.useState<"SHORT" | "MEDIUM" | "">(
    initial.workspaceSettings.defaultMessageLength,
  );
  const [extraAiInstruction, setExtraAiInstruction] = React.useState(initial.workspaceSettings.extraAiInstruction);

  function toggleLanguage(l: Locale) {
    setLanguagesToUse((prev) => {
      const has = prev.includes(l);
      const next = has ? prev.filter((x) => x !== l) : [...prev, l];
      if (next.length === 0) return prev;
      return next;
    });
  }

  function saveProfile() {
    startTransition(async () => {
      const res = await updateProfileAction({ fullName, timezone });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.saved });
    });
  }

  function saveWorkspace() {
    startTransition(async () => {
      const res = await updateWorkspaceAction({
        workspaceName,
        websiteUrl,
        whatYouSell,
        callToAction,
        targetCustomerDescription,
        languagesToUse,
      });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.saved });
    });
  }

  function saveLocalization() {
    startTransition(async () => {
      const res = await updateLocalizationAction({ preferredOutreachLanguage });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.saved });
    });
  }

  function saveAi() {
    startTransition(async () => {
      const res = await updateAiSettingsAction({
        tonePreference,
        defaultMessageLength: defaultMessageLength || undefined,
        extraAiInstruction,
      });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({ title: dict.toasts.saved });
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{dict.settings.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{dict.settings.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
        <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
          {dict.settings.tabs.profile}
        </TabButton>
        <TabButton active={tab === "workspace"} onClick={() => setTab("workspace")}>
          {dict.settings.tabs.workspace}
        </TabButton>
        <TabButton active={tab === "localization"} onClick={() => setTab("localization")}>
          {dict.settings.tabs.localization}
        </TabButton>
        <TabButton active={tab === "email"} onClick={() => setTab("email")}>
          {dict.settings.tabs.emailSending}
        </TabButton>
        <TabButton active={tab === "ai"} onClick={() => setTab("ai")}>
          {dict.settings.tabs.ai}
        </TabButton>
        <TabButton active={tab === "privacy"} onClick={() => setTab("privacy")}>
          {dict.settings.tabs.dataPrivacy}
        </TabButton>
      </div>

      {tab === "profile" ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.settings.profile.title}</CardTitle>
            <CardDescription>{dict.settings.profile.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{dict.settings.profile.name}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Anna Kask" />
              </div>
              <div className="space-y-2">
                <Label>{dict.settings.profile.locale}</Label>
                <form
                  action={async (fd) => {
                    await setLocaleAction(fd);
                    toast.push({ title: dict.toasts.saved });
                  }}
                >
                  <select
                    name="locale"
                    defaultValue={locale}
                    className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    <option value="et">ET</option>
                    <option value="en">EN</option>
                    <option value="ru">RU</option>
                  </select>
                  <div className="mt-2">
                    <Button type="submit" variant="secondary" size="sm">
                      {dict.common.save}
                    </Button>
                  </div>
                </form>
              </div>
              <div className="space-y-2">
                <Label>{dict.settings.profile.timezone}</Label>
                <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. Europe/Tallinn" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={saveProfile} disabled={pending}>
                {dict.common.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "workspace" ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.settings.workspace.title}</CardTitle>
            <CardDescription>{dict.settings.workspace.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{dict.settings.workspace.workspaceName}</Label>
                <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{dict.settings.workspace.website}</Label>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{dict.settings.workspace.offerSummary}</Label>
                <Input
                  value={whatYouSell}
                  onChange={(e) => setWhatYouSell(e.target.value)}
                  placeholder={dict.onboarding.placeholders.whatYouSell}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{dict.settings.workspace.callToAction}</Label>
                <Input
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder={dict.onboarding.placeholders.callToAction}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{dict.settings.workspace.targetCustomerProfile}</Label>
                <Input
                  value={targetCustomerDescription}
                  onChange={(e) => setTargetCustomerDescription(e.target.value)}
                  placeholder={dict.onboarding.placeholders.targetCustomerDescription}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>{dict.settings.workspace.allowedOutreachLanguages}</Label>
                <div className="flex flex-wrap gap-2">
                  {(["et", "en", "ru"] as Locale[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLanguage(l)}
                      className={[
                        "rounded-md border px-3 py-2 text-sm",
                        languagesToUse.includes(l)
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900",
                      ].join(" ")}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{dict.settings.workspace.allowedOutreachHint}</div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={saveWorkspace} disabled={pending}>
                {dict.common.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "localization" ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.settings.localization.title}</CardTitle>
            <CardDescription>{dict.settings.localization.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{dict.settings.localization.uiLanguage}</Label>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{dict.settings.localization.uiLanguageHint}</div>
              </div>
              <div className="space-y-2">
                <Label>{dict.settings.localization.defaultOutreachLanguage}</Label>
                <select
                  value={preferredOutreachLanguage}
                  onChange={(e) => setPreferredOutreachLanguage(e.target.value as Locale)}
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {languagesToUse.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={saveLocalization} disabled={pending}>
                {dict.common.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "email" ? (
        <div className="space-y-4">
          <ResendSenderSettings
            dict={dict}
            initial={
              initial.email.connection ?? { name: "Resend Sender", fromEmail: "", fromName: "" }
            }
            resendConfigured={initial.email.resendConfigured}
          />
          <Card>
            <CardHeader>
              <CardTitle>{dict.settings.email.domainStatusTitle}</CardTitle>
              <CardDescription>{dict.settings.email.domainStatusSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
              {dict.settings.email.domainStatusPlaceholder}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{dict.settings.email.providerStatusTitle}</CardTitle>
              <CardDescription>{dict.settings.email.providerStatusSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
              {initial.email.resendConfigured ? dict.settings.email.providerConfigured : dict.settings.email.providerMissing}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "ai" ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.settings.ai.title}</CardTitle>
            <CardDescription>{dict.settings.ai.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{dict.settings.ai.defaultTone}</Label>
                <Input value={tonePreference} onChange={(e) => setTonePreference(e.target.value)} placeholder="e.g. friendly, direct" />
              </div>
              <div className="space-y-2">
                <Label>{dict.settings.ai.defaultLength}</Label>
                <select
                  value={defaultMessageLength}
                  onChange={(e) => setDefaultMessageLength(e.target.value as any)}
                  className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="">{dict.settings.ai.lengthUnset}</option>
                  <option value="SHORT">{dict.settings.ai.lengthShort}</option>
                  <option value="MEDIUM">{dict.settings.ai.lengthMedium}</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{dict.settings.ai.extraInstruction}</Label>
                <Input
                  value={extraAiInstruction}
                  onChange={(e) => setExtraAiInstruction(e.target.value)}
                  placeholder={dict.settings.ai.extraInstructionPlaceholder}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={saveAi} disabled={pending}>
                {dict.common.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "privacy" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{dict.settings.privacy.exportTitle}</CardTitle>
              <CardDescription>{dict.settings.privacy.exportSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
              {dict.settings.privacy.exportPlaceholder}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{dict.settings.privacy.deleteTitle}</CardTitle>
              <CardDescription>{dict.settings.privacy.deleteSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
              {dict.settings.privacy.deletePlaceholder}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

