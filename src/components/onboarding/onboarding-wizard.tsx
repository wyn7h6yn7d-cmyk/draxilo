"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveOnboardingAction, skipOnboardingAction } from "@/app/actions/workspace-settings";
import { onboardingFullSchema, type OnboardingFull } from "@/lib/validation/onboarding";

function joinList(values: string[]) {
  return values.join(", ");
}
function splitList(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const TOTAL_STEPS = 3;

export function OnboardingWizard({
  locale,
  dict,
  initial,
}: {
  locale: Locale;
  dict: Dictionary;
  initial: Partial<OnboardingFull> | null;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<OnboardingFull>(() => {
    const defaults: OnboardingFull = {
      businessName: "",
      websiteUrl: "",
      whatYouSell: "",
      targetCustomerDescription: "",
      industries: [],
      countries: [],
      languagesToUse: [locale],
      preferredOutreachLanguage: locale,
      offerType: "",
      callToAction: "",
      tonePreference: "",
      targetCompanySize: "",
      targetRoles: [],
      avoidIndustries: [],
      idealCustomerExamples: "",
    };
    return { ...defaults, ...(initial ?? {}) };
  });

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  function validateCurrentStep() {
    setError(null);
    if (step === 1) {
      const base = onboardingFullSchema.pick({
        businessName: true,
        websiteUrl: true,
        whatYouSell: true,
        targetCustomerDescription: true,
      });
      const res = base.safeParse(form);
      if (!res.success) {
        setError(dict.errors.generic);
        return false;
      }
    }
    if (step === 2) {
      const targeting = onboardingFullSchema.pick({
        industries: true,
        countries: true,
        languagesToUse: true,
        preferredOutreachLanguage: true,
      });
      const res = targeting.safeParse(form);
      if (!res.success) {
        setError(dict.errors.generic);
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function toggleLanguage(l: Locale) {
    setForm((prev) => {
      const set = new Set(prev.languagesToUse);
      if (set.has(l)) set.delete(l);
      else set.add(l);
      const next = Array.from(set);
      // Must keep at least one.
      if (next.length === 0) return prev;
      const preferred = next.includes(prev.preferredOutreachLanguage)
        ? prev.preferredOutreachLanguage
        : next[0]!;
      return { ...prev, languagesToUse: next, preferredOutreachLanguage: preferred };
    });
  }

  function submit() {
    setError(null);
    const res = onboardingFullSchema.safeParse(form);
    if (!res.success) {
      setError(dict.errors.generic);
      return;
    }

    startTransition(async () => {
      const result = await saveOnboardingAction(res.data);
      if (!result.ok) {
        setError(dict.errors.generic);
        return;
      }
      router.push("/app/leads");
      router.refresh();
    });
  }

  function skipAdvanced() {
    startTransition(async () => {
      const result = await skipOnboardingAction();
      if (!result.ok) {
        setError(dict.errors.generic);
        return;
      }
      router.push("/app/leads");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.onboarding.title}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{dict.onboarding.subtitle}</p>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {dict.common.loading.replace("…", "")} {step}/{TOTAL_STEPS}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
            <div
              className="h-2 bg-zinc-900 dark:bg-zinc-50"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.onboarding.steps.basics.title}</CardTitle>
            <CardDescription>{dict.onboarding.steps.basics.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{dict.onboarding.fields.businessName}</Label>
              <Input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder={dict.onboarding.placeholders.businessName}
              />
            </div>
            <div className="space-y-2">
              <Label>{dict.onboarding.fields.websiteUrl}</Label>
              <Input
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder={dict.onboarding.placeholders.websiteUrl}
              />
            </div>
            <div className="space-y-2">
              <Label>{dict.onboarding.fields.whatYouSell}</Label>
              <Input
                value={form.whatYouSell}
                onChange={(e) => setForm({ ...form, whatYouSell: e.target.value })}
                placeholder={dict.onboarding.placeholders.whatYouSell}
              />
            </div>
            <div className="space-y-2">
              <Label>{dict.onboarding.fields.targetCustomerDescription}</Label>
              <Input
                value={form.targetCustomerDescription}
                onChange={(e) =>
                  setForm({ ...form, targetCustomerDescription: e.target.value })
                }
                placeholder={dict.onboarding.placeholders.targetCustomerDescription}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.onboarding.steps.targeting.title}</CardTitle>
            <CardDescription>{dict.onboarding.steps.targeting.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{dict.onboarding.fields.industries}</Label>
              <Input
                value={joinList(form.industries)}
                onChange={(e) => setForm({ ...form, industries: splitList(e.target.value) })}
                placeholder={dict.onboarding.placeholders.industries}
              />
            </div>
            <div className="space-y-2">
              <Label>{dict.onboarding.fields.countries}</Label>
              <Input
                value={joinList(form.countries)}
                onChange={(e) => setForm({ ...form, countries: splitList(e.target.value) })}
                placeholder={dict.onboarding.placeholders.countries}
              />
            </div>

            <div className="space-y-2">
              <Label>{dict.onboarding.fields.languagesToUse}</Label>
              <div className="flex flex-wrap gap-2">
                {(["et", "en", "ru"] as const).map((l) => {
                  const active = form.languagesToUse.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLanguage(l)}
                      className={[
                        "h-9 rounded-md border px-3 text-sm",
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                          : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
                      ].join(" ")}
                      aria-pressed={active}
                    >
                      {l.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{dict.onboarding.fields.preferredOutreachLanguage}</Label>
              <select
                value={form.preferredOutreachLanguage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    preferredOutreachLanguage: e.target.value as Locale,
                  })
                }
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                {form.languagesToUse.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.onboarding.steps.advanced.title}</CardTitle>
            <CardDescription>{dict.onboarding.steps.advanced.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{dict.onboarding.fields.offerType}</Label>
                <Input
                  value={form.offerType}
                  onChange={(e) => setForm({ ...form, offerType: e.target.value })}
                  placeholder={dict.onboarding.placeholders.offerType}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.onboarding.fields.callToAction}</Label>
                <Input
                  value={form.callToAction}
                  onChange={(e) => setForm({ ...form, callToAction: e.target.value })}
                  placeholder={dict.onboarding.placeholders.callToAction}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.onboarding.fields.tonePreference}</Label>
                <Input
                  value={form.tonePreference}
                  onChange={(e) => setForm({ ...form, tonePreference: e.target.value })}
                  placeholder={dict.onboarding.placeholders.tonePreference}
                />
              </div>
              <div className="space-y-2">
                <Label>{dict.onboarding.fields.targetCompanySize}</Label>
                <Input
                  value={form.targetCompanySize}
                  onChange={(e) => setForm({ ...form, targetCompanySize: e.target.value })}
                  placeholder={dict.onboarding.placeholders.targetCompanySize}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{dict.onboarding.fields.targetRoles}</Label>
              <Input
                value={joinList(form.targetRoles)}
                onChange={(e) => setForm({ ...form, targetRoles: splitList(e.target.value) })}
                placeholder={dict.onboarding.placeholders.targetRoles}
              />
            </div>
            <div className="space-y-2">
              <Label>{dict.onboarding.fields.avoidIndustries}</Label>
              <Input
                value={joinList(form.avoidIndustries)}
                onChange={(e) =>
                  setForm({ ...form, avoidIndustries: splitList(e.target.value) })
                }
                placeholder={dict.onboarding.placeholders.avoidIndustries}
              />
            </div>
            <div className="space-y-2">
              <Label>{dict.onboarding.fields.idealCustomerExamples}</Label>
              <Input
                value={form.idealCustomerExamples}
                onChange={(e) => setForm({ ...form, idealCustomerExamples: e.target.value })}
                placeholder={dict.onboarding.placeholders.idealCustomerExamples}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={back} disabled={pending || step === 1}>
          {dict.onboarding.actions.back}
        </Button>

        <div className="flex items-center gap-2">
          {step === 3 ? (
            <Button type="button" variant="secondary" onClick={skipAdvanced} disabled={pending}>
              {dict.onboarding.actions.skip}
            </Button>
          ) : null}

          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={next} disabled={pending}>
              {dict.onboarding.actions.next}
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={pending}>
              {dict.onboarding.actions.finish}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

