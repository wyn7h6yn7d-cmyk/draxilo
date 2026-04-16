"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import type {
  DemoAnalysisResponse,
  DemoCampaignStageKey,
  DemoContinuation,
  DemoLanguage,
  DemoTone,
} from "@/lib/demo/types";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingPageAtmosphere } from "@/components/marketing/marketing-page-atmosphere";
import { DEMO_PRESETS } from "@/lib/demo/sim/presets";
import { DEMO_SCENARIOS } from "@/lib/demo/sim/scenarios";
import type { DemoScenarioId } from "@/lib/demo/sim/types";

function presetLabel(dict: Dictionary, id: string): string {
  const p = dict.demo.form;
  switch (id) {
    case "energy":
      return p.presetEnergy;
    case "agency":
      return p.presetAgency;
    case "saas":
      return p.presetSaas;
    case "local":
      return p.presetLocal;
    case "industrial":
      return p.presetIndustrial;
    case "supplier":
      return p.presetSupplier;
    default:
      return id;
  }
}

type Phase = "idle" | "processing" | "results" | "error";

function stageLabel(dict: Dictionary, key: DemoCampaignStageKey): string {
  switch (key) {
    case "analyze":
      return dict.demo.results.stageAnalyze;
    case "enrich":
      return dict.demo.results.stageEnrich;
    case "compose":
      return dict.demo.results.stageCompose;
    case "approve":
      return dict.demo.results.stageApprove;
    case "send":
      return dict.demo.results.stageSend;
    default:
      return key;
  }
}

export function DemoPageClient({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const d = dict.demo;
  const [companyName, setCompanyName] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [whatYouSell, setWhatYouSell] = React.useState("");
  const [scenarioHint, setScenarioHint] = React.useState<DemoScenarioId | null>(null);
  const [language, setLanguage] = React.useState<DemoLanguage>(
    locale === "en" ? "en" : locale === "ru" ? "ru" : "et",
  );
  const [tone, setTone] = React.useState<DemoTone>("direct");
  const [variantSalt, setVariantSalt] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [processingStep, setProcessingStep] = React.useState(0);
  const [result, setResult] = React.useState<DemoAnalysisResponse | null>(null);
  const [continuation, setContinuation] = React.useState<DemoContinuation | null>(null);
  const [errorDetail, setErrorDetail] = React.useState<"generic" | "ai_unavailable" | "ai_failed" | null>(null);
  const [errorRequestId, setErrorRequestId] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  const steps = React.useMemo(
    () => [
      d.processing.step1,
      d.processing.step2,
      d.processing.step3,
      d.processing.step4,
      d.processing.step5,
      d.processing.step6,
    ],
    [d.processing],
  );

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const execute = React.useCallback(
    async (
      intent: "full" | "regenerate_email",
      overrides?: { salt?: number; tone?: DemoTone },
      opts?: { skipContinuation?: boolean },
    ) => {
      const salt = overrides?.salt ?? variantSalt;
      const toneVal = overrides?.tone ?? tone;
      const useContinuation = opts?.skipContinuation ? undefined : continuation ?? undefined;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setIsRunning(true);
      setErrorDetail(null);
      setErrorRequestId(null);
      setPhase("processing");
      setProcessingStep(0);

      const minDelay = new Promise<void>((r) => setTimeout(r, 3600));
      intervalRef.current = setInterval(() => {
        setProcessingStep((s) => Math.min(5, s + 1));
      }, 520);

      try {
        const res = await fetch("/api/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName,
            websiteUrl,
            whatYouSell,
            language,
            tone: toneVal,
            scenarioHint,
            variantSalt: salt,
            intent,
            continuation: useContinuation,
          }),
        });
        if (!res.ok) {
          const errJson = (await res.json().catch(() => ({}))) as { error?: string; requestId?: string };
          const reqId =
            errJson.requestId ||
            res.headers.get("x-request-id") ||
            res.headers.get("x-vercel-id") ||
            null;
          if (reqId) setErrorRequestId(reqId);
          if (errJson.error === "ai_unavailable") setErrorDetail("ai_unavailable");
          else if (errJson.error === "ai_failed") setErrorDetail("ai_failed");
          else setErrorDetail("generic");
          throw new Error("demo_failed");
        }
        const data = (await res.json()) as DemoAnalysisResponse;
        await minDelay;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setProcessingStep(5);
        setResult(data);
        setContinuation(data.continuation);
        setPhase("results");
        if (intent === "regenerate_email") setVariantSalt(salt);
      } catch {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setPhase("error");
      } finally {
        setIsRunning(false);
      }
    },
    [companyName, websiteUrl, whatYouSell, language, tone, variantSalt, continuation, scenarioHint],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContinuation(null);
    void execute("full", undefined, { skipContinuation: true });
  }

  function applyPreset(p: (typeof DEMO_PRESETS)[number]) {
    setCompanyName(p.companyName);
    setWebsiteUrl(p.websiteUrl);
    setWhatYouSell(p.whatYouSell);
    setScenarioHint(p.scenarioHint ?? null);
    setContinuation(null);
    setPhase("idle");
    setResult(null);
  }

  function tryDifferentTone() {
    const next: DemoTone = tone === "friendly" ? "direct" : tone === "direct" ? "sharp" : "friendly";
    setTone(next);
    void execute("full", { tone: next });
  }

  function regenerateEmail() {
    void execute("regenerate_email", { salt: variantSalt + 1 });
  }

  return (
    <MarketingPageAtmosphere>
      <MarketingNavbar locale={locale} dict={dict} current="demo" />

      <main className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-28 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(26,31,43,0.55)] px-3 py-2 text-xs text-[var(--muted)] backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(124,247,212,0.5)]" />
            {d.badge}
          </div>
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {d.headline}
          </h1>
          <p className="mt-4 text-pretty text-base leading-7 text-[var(--muted-2)] sm:text-lg">{d.subheadline}</p>
          <p className="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.42)]">{d.disclaimer}</p>
        </motion.header>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-5"
          >
            <div className="rounded-[22px] border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.55)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{d.form.presetsTitle}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEMO_PRESETS.map((p) => (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => applyPreset(p)}
                    className="rounded-xl border border-[rgba(91,140,255,0.28)] bg-[rgba(91,140,255,0.08)] px-3 py-2 text-left text-xs font-medium text-[rgba(255,255,255,0.82)] transition-colors hover:bg-[rgba(91,140,255,0.14)]"
                  >
                    {presetLabel(dict, p.id)}
                  </motion.button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[rgba(255,255,255,0.55)]">{d.form.companyName}</label>
                  <input
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setContinuation(null);
                    }}
                    placeholder={d.form.companyPlaceholder}
                    required
                    minLength={2}
                    className="mt-1.5 w-full rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.55)] px-3 py-2.5 text-sm text-white placeholder:text-[rgba(255,255,255,0.28)] focus:border-[rgba(91,140,255,0.45)] focus:outline-none focus:ring-1 focus:ring-[rgba(91,140,255,0.35)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[rgba(255,255,255,0.55)]">{d.form.website}</label>
                  <input
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      setContinuation(null);
                    }}
                    placeholder={d.form.websitePlaceholder}
                    className="mt-1.5 w-full rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.55)] px-3 py-2.5 text-sm text-white placeholder:text-[rgba(255,255,255,0.28)] focus:border-[rgba(91,140,255,0.45)] focus:outline-none focus:ring-1 focus:ring-[rgba(91,140,255,0.35)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[rgba(255,255,255,0.55)]">{d.form.sell}</label>
                  <textarea
                    value={whatYouSell}
                    onChange={(e) => {
                      setWhatYouSell(e.target.value);
                      setContinuation(null);
                    }}
                    placeholder={d.form.sellPlaceholder}
                    required
                    minLength={2}
                    rows={3}
                    className="mt-1.5 w-full resize-y rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.55)] px-3 py-2.5 text-sm text-white placeholder:text-[rgba(255,255,255,0.28)] focus:border-[rgba(91,140,255,0.45)] focus:outline-none focus:ring-1 focus:ring-[rgba(91,140,255,0.35)]"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-[rgba(255,255,255,0.55)]">{d.form.language}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          ["et", d.form.langEt],
                          ["en", d.form.langEn],
                          ["ru", d.form.langRu],
                        ] as const
                      ).map(([code, label]) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setLanguage(code);
                            setContinuation(null);
                          }}
                          className={[
                            "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                            language === code
                              ? "bg-[rgba(91,140,255,0.22)] text-white ring-1 ring-[rgba(91,140,255,0.45)]"
                              : "bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:text-white",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[rgba(255,255,255,0.55)]">{d.form.tone}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          ["friendly", d.form.toneFriendly],
                          ["direct", d.form.toneDirect],
                          ["sharp", d.form.toneSharp],
                        ] as const
                      ).map(([code, label]) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setTone(code);
                            setContinuation(null);
                          }}
                          className={[
                            "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                            tone === code
                              ? "bg-[rgba(124,247,212,0.12)] text-white ring-1 ring-[rgba(124,247,212,0.35)]"
                              : "bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:text-white",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-end justify-between gap-3">
                    <div className="text-xs font-medium text-[rgba(255,255,255,0.55)]">{d.form.scenario}</div>
                    {scenarioHint ? (
                      <button
                        type="button"
                        onClick={() => setScenarioHint(null)}
                        className="text-[11px] font-semibold text-[rgba(255,255,255,0.50)] hover:text-white"
                      >
                        {d.form.scenarioClear}
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DEMO_SCENARIOS.map((s) => {
                      const active = s.id === scenarioHint;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setScenarioHint(s.id);
                            setContinuation(null);
                          }}
                          className={[
                            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                            active
                              ? "border-[rgba(124,247,212,0.30)] bg-[rgba(124,247,212,0.10)] text-white shadow-[0_0_24px_rgba(124,247,212,0.10)]"
                              : "border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)] text-[rgba(255,255,255,0.66)] hover:bg-[rgba(11,15,20,0.62)] hover:text-white",
                          ].join(" ")}
                        >
                          {locale === "en" ? s.label.en : locale === "ru" ? s.label.ru : s.label.et}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[rgba(255,255,255,0.44)]">{d.form.scenarioHint}</p>
                </div>

                <motion.button
                  type="submit"
                  disabled={isRunning}
                  whileHover={{ scale: isRunning ? 1 : 1.02 }}
                  whileTap={{ scale: isRunning ? 1 : 0.98 }}
                  className={[
                    "relative mt-2 w-full overflow-hidden rounded-2xl py-3.5 text-sm font-semibold text-white",
                    "bg-[rgba(91,140,255,0.16)] ring-1 ring-[rgba(91,140,255,0.55)]",
                    "hover:shadow-[0_0_0_1px_rgba(91,140,255,0.35),0_22px_50px_rgba(91,140,255,0.22)]",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  ].join(" ")}
                >
                  <span className="relative z-10">{isRunning ? d.form.running : d.form.run}</span>
                  <span className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(70%_60%_at_50%_0%,rgba(124,247,212,0.18),transparent_60%)]" />
                  {isRunning ? (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(110deg,transparent,rgba(255,255,255,0.12),transparent)] [background-size:200%_100%]"
                      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                  ) : null}
                </motion.button>
              </form>
            </div>
          </motion.section>

          <div className="min-h-[320px] lg:col-span-7">
            <AnimatePresence mode="wait">
              {phase === "idle" ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(26,31,43,0.25)] p-8 text-center backdrop-blur"
                >
                  <div className="text-sm font-semibold text-white">{d.empty.title}</div>
                  <p className="mt-2 max-w-sm text-sm text-[var(--muted-2)]">{d.empty.text}</p>
                </motion.div>
              ) : null}

              {phase === "processing" ? (
                <motion.div
                  key="proc"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-[22px] border border-[rgba(91,140,255,0.22)] bg-[rgba(26,31,43,0.6)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{d.processing.title}</div>
                    <motion.div
                      className="flex items-center gap-2 rounded-full border border-[rgba(124,247,212,0.25)] bg-[rgba(124,247,212,0.08)] px-3 py-1 text-[11px] font-medium text-[rgba(124,247,212,0.95)]"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(124,247,212,0.5)]" />
                      {d.processing.badge}
                    </motion.div>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <motion.div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(91,140,255,0.7),rgba(124,247,212,0.65))]"
                      initial={{ width: "4%" }}
                      animate={{ width: `${8 + (processingStep + 1) * 15}%` }}
                      transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    />
                  </div>
                  <ul className="mt-6 space-y-3">
                    {steps.map((label, idx) => {
                      const active = idx === processingStep;
                      const done = idx < processingStep;
                      return (
                        <motion.li
                          key={label}
                          className={[
                            "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                            done
                              ? "border-[rgba(124,247,212,0.22)] bg-[rgba(124,247,212,0.06)] text-[rgba(255,255,255,0.78)]"
                              : active
                                ? "border-[rgba(91,140,255,0.35)] bg-[rgba(91,140,255,0.08)] text-white"
                                : "border-[rgba(255,255,255,0.06)] bg-[rgba(11,15,20,0.35)] text-[rgba(255,255,255,0.35)]",
                          ].join(" ")}
                          layout
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold">
                            {done ? (
                              <Check className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={2.5} aria-hidden />
                            ) : active ? (
                              <motion.span
                                className="h-2 w-2 rounded-full bg-[var(--primary)]"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                              />
                            ) : (
                              <span className="text-[rgba(255,255,255,0.2)]">{idx + 1}</span>
                            )}
                          </span>
                          <span>{label}</span>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              ) : null}

              {phase === "error" ? (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[22px] border border-[rgba(255,80,80,0.25)] bg-[rgba(40,20,20,0.35)] p-6 backdrop-blur-xl"
                >
                  <div className="text-sm font-semibold text-white">{d.error.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
                    {errorDetail === "ai_unavailable"
                      ? d.error.aiUnavailable
                      : errorDetail === "ai_failed"
                        ? d.error.aiFailed
                        : d.error.text}
                  </p>
                  {errorRequestId ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[rgba(255,255,255,0.66)]">
                      <span className="text-[rgba(255,255,255,0.46)]">{dict.common.requestId}</span>
                      <code className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.45)] px-2 py-1 font-mono text-[11px] text-white">
                        {errorRequestId}
                      </code>
                      <button
                        type="button"
                        className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.45)] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[rgba(11,15,20,0.65)]"
                        onClick={() => {
                          void navigator.clipboard?.writeText(errorRequestId);
                        }}
                      >
                        {dict.common.copy}
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorDetail(null);
                      setErrorRequestId(null);
                      setPhase("idle");
                    }}
                    className="mt-4 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.5)] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgba(11,15,20,0.7)]"
                  >
                    {d.error.retry}
                  </button>
                </motion.div>
              ) : null}

              {phase === "results" && result ? (
                <motion.div
                  key="res"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <ResultCard title={d.results.snapshot} glow="blue">
                      <dl className="space-y-2 text-sm">
                        <Row label={d.form.companyName} value={result.company.name} strong />
                        <Row label={d.results.industry} value={result.company.likelyIndustry} />
                        <Row label={d.results.summary} value={result.company.summary} />
                        <Row label={d.results.detectedLang} value={result.company.detectedLanguage} />
                        <Row label={d.results.region} value={result.company.region} />
                        <Row
                          label={d.results.confidence}
                          value={`${Math.round(result.company.confidence * 100)}%`}
                        />
                      </dl>
                    </ResultCard>
                    <ResultCard title={d.results.score} glow="teal">
                      <div className="text-4xl font-semibold tracking-tight text-white">{result.leadScore}</div>
                      <p className="mt-3 text-sm leading-6 text-[var(--muted-2)]">{result.leadScoreWhy}</p>
                    </ResultCard>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ResultCard title={d.results.pain}>
                      <ul className="list-inside list-disc space-y-2 text-sm text-[var(--muted-2)]">
                        {result.painPoints.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </ResultCard>
                    <ResultCard title={d.results.web}>
                      <ul className="list-inside list-disc space-y-2 text-sm text-[var(--muted-2)]">
                        {result.websiteFindings.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </ResultCard>
                  </div>

                  <ResultCard title={d.results.opportunities}>
                    <ul className="list-inside list-disc space-y-2 text-sm text-[var(--muted-2)]">
                      {result.outreachOpportunities.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </ResultCard>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ResultCard title={d.results.whyFit}>
                      <p className="text-sm leading-6 text-[var(--muted-2)]">{result.whyFit}</p>
                    </ResultCard>
                    <ResultCard title={d.results.angle}>
                      <p className="text-sm leading-6 text-[var(--muted-2)]">{result.messageAngle}</p>
                    </ResultCard>
                  </div>

                  <ResultCard title={d.results.email} glow="blue">
                    <div className="space-y-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.38)]">
                          {d.results.subject}
                        </div>
                        <div className="mt-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,20,0.55)] px-3 py-2 text-sm font-medium text-white">
                          {result.generatedEmail.subject}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.38)]">
                          {d.results.body}
                        </div>
                        <div className="mt-1 min-h-[8rem] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,20,0.55)] px-3 py-2 text-sm leading-relaxed text-[rgba(255,255,255,0.72)]">
                          {result.generatedEmail.body}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={regenerateEmail}
                          disabled={isRunning}
                          className="rounded-xl border border-[rgba(91,140,255,0.35)] bg-[rgba(91,140,255,0.12)] px-4 py-2 text-xs font-semibold text-white hover:bg-[rgba(91,140,255,0.18)] disabled:opacity-50"
                        >
                          {d.results.regenerate}
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={tryDifferentTone}
                          disabled={isRunning}
                          className="rounded-xl border border-[rgba(124,247,212,0.28)] bg-[rgba(124,247,212,0.08)] px-4 py-2 text-xs font-semibold text-white hover:bg-[rgba(124,247,212,0.14)] disabled:opacity-50"
                        >
                          {d.results.tryTone}
                        </motion.button>
                      </div>
                    </div>
                  </ResultCard>

                  <ResultCard title={d.results.campaign}>
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <span className="text-[var(--muted)]">{d.results.campStatus}</span>
                        <div className="font-medium text-white">{result.campaignPreview.statusLabel}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">{d.results.campLang}</span>
                        <div className="font-medium text-white">{result.campaignPreview.language}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">{d.results.campType}</span>
                        <div className="font-medium text-white">{result.campaignPreview.messageType}</div>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">{d.results.campReady}</span>
                        <div className="font-medium text-white">{result.campaignPreview.sendReadiness}</div>
                      </div>
                    </div>
                    <div className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.38)]">
                      {d.results.workflow}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.campaignPreview.stages.map((s) => (
                        <span
                          key={s.key}
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                            s.done
                              ? "border-[rgba(124,247,212,0.28)] bg-[rgba(124,247,212,0.08)] text-[rgba(255,255,255,0.88)]"
                              : "border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,20,0.45)] text-[rgba(255,255,255,0.45)]",
                          ].join(" ")}
                        >
                          {s.done ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                          ) : (
                            <motion.span
                              className="h-1.5 w-1.5 rounded-full bg-[rgba(255,255,255,0.25)]"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          {stageLabel(dict, s.key)}
                        </span>
                      ))}
                    </div>
                  </ResultCard>

                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                    className="rounded-[28px] border border-[rgba(91,140,255,0.22)] bg-[rgba(91,140,255,0.10)] p-6 backdrop-blur-xl"
                  >
                    <div className="text-lg font-semibold tracking-tight text-white">{d.cta.title}</div>
                    <p className="mt-2 text-sm text-[var(--muted-2)]">{d.cta.text}</p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/signup"
                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-[rgba(91,140,255,0.2)] px-6 text-sm font-semibold text-white ring-1 ring-[rgba(91,140,255,0.5)] transition-shadow hover:shadow-[0_20px_50px_rgba(91,140,255,0.25)]"
                      >
                        {d.cta.primary}
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[rgba(26,31,43,0.4)] px-6 text-sm font-semibold text-[var(--muted)] hover:bg-[rgba(26,31,43,0.6)] hover:text-white"
                      >
                        {d.cta.secondary}
                      </Link>
                    </div>
                  </motion.section>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

          {/* Offline public demo: no live AI chat calls. */}
      </main>
    </MarketingPageAtmosphere>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-[rgba(255,255,255,0.42)]">{label}</div>
      <div className={strong ? "mt-0.5 font-semibold text-white" : "mt-0.5 text-[var(--muted-2)]"}>{value}</div>
    </div>
  );
}

function ResultCard({
  title,
  children,
  glow,
}: {
  title: string;
  children: React.ReactNode;
  glow?: "blue" | "teal";
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={[
        "group relative overflow-hidden rounded-[22px] border p-5 backdrop-blur-xl",
        glow === "blue"
          ? "border-[rgba(91,140,255,0.28)] bg-[rgba(26,31,43,0.58)] shadow-[0_0_0_1px_rgba(91,140,255,0.06)_inset]"
          : glow === "teal"
            ? "border-[rgba(124,247,212,0.22)] bg-[rgba(26,31,43,0.58)] shadow-[0_0_0_1px_rgba(124,247,212,0.06)_inset]"
            : "border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.52)]",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          glow === "teal"
            ? "[background:radial-gradient(80%_70%_at_20%_0%,rgba(124,247,212,0.12),transparent_55%)]"
            : "[background:radial-gradient(80%_70%_at_20%_0%,rgba(91,140,255,0.14),transparent_55%)]",
        ].join(" ")}
      />
      <h3 className="relative text-sm font-semibold tracking-tight text-white">{title}</h3>
      <div className="relative mt-4">{children}</div>
    </motion.div>
  );
}
