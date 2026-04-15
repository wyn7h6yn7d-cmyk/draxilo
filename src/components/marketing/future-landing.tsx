"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { Zap, Radar, Sparkles, Send, Shield, Layers } from "lucide-react";

import type { Locale } from "@/lib/i18n/types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingPageAtmosphere } from "@/components/marketing/marketing-page-atmosphere";

const ICONS = [Radar, Layers, Sparkles, Zap, Send, Shield] as const;

const FEATURE_KEYS = ["sources", "dedupe", "enrichment", "messages", "campaigns", "tracking"] as const;

type FeatureCardVariant = "default" | "highlight" | "iconMotion" | "gradient";

const revealViewport = { once: true, amount: 0.22, margin: "0px 0px -80px 0px" } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
  },
};

export function FutureLanding({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, -18]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.92]);

  const s = dict.marketing.sections;

  return (
    <MarketingPageAtmosphere>
      <MarketingNavbar locale={locale} dict={dict} current="home" />

      <main className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-24">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          <Hero dict={dict} />
        </motion.div>

        <motion.div
          className="mt-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          <LogoMarquee />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
          <TrustSection dict={dict} />
        </motion.div>

        <motion.section
          className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          <motion.div className="max-w-2xl sm:col-span-2 lg:col-span-12" variants={staggerItem}>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{s.features.title}</h2>
            <p className="mt-3 text-pretty text-base leading-7 text-[var(--muted-2)]">{dict.marketing.ui.featuresSubtitle}</p>
          </motion.div>

          {FEATURE_KEYS.map((key, idx) => {
            const f = s.features.items[key];
            const Icon = ICONS[idx % ICONS.length];
            const variant: FeatureCardVariant =
              idx === 0 ? "highlight" : idx === 1 ? "gradient" : idx === 2 ? "iconMotion" : "default";
            const span =
              idx === 0
                ? "lg:col-span-8"
                : idx === 1
                  ? "lg:col-span-4"
                  : idx === 5
                    ? "sm:col-span-2 lg:col-span-12"
                    : "lg:col-span-4";
            const wide = idx === 5;

            return (
              <motion.div key={key} className={["min-h-0", span].filter(Boolean).join(" ")} variants={staggerItem}>
                <FeatureCard
                  variant={variant}
                  title={f.title}
                  text={f.text}
                  Icon={Icon}
                  wide={wide}
                  kicker={
                    variant === "highlight" || variant === "gradient" ? dict.marketing.ui.featureCardKicker : undefined
                  }
                />
              </motion.div>
            );
          })}
        </motion.section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <motion.div className="min-h-0" variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
            <HowItWorks dict={dict} />
          </motion.div>
          <motion.div className="min-h-0" variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
            <OpsStrip dict={dict} />
          </motion.div>
        </section>

        <motion.section
          className="mt-16 rounded-3xl border border-[var(--border)] bg-[rgba(26,31,43,0.65)] p-6 backdrop-blur-xl"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          <motion.div
            className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
            variants={staggerItem}
          >
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{s.multilingual.title}</h2>
              <p className="mt-1 text-sm text-[var(--muted-2)]">{s.multilingual.text}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(11,15,20,0.6)] px-3 py-2 text-xs text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              ET / EN / RU
            </div>
          </motion.div>
          <motion.div className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-3">
            <motion.div variants={staggerItem}>
              <Bullet text={s.multilingual.bullets.ui} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <Bullet text={s.multilingual.bullets.outreach} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <Bullet text={s.multilingual.bullets.defaults} />
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          className="mt-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          <motion.h2 className="text-lg font-semibold tracking-tight" variants={staggerItem}>
            {s.faq.title}
          </motion.h2>
          <div className="mt-4 grid gap-3">
            <motion.div variants={staggerItem}>
              <Faq q={s.faq.items.dataSources.q} a={s.faq.items.dataSources.a} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <Faq q={s.faq.items.deliverability.q} a={s.faq.items.deliverability.a} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <Faq q={s.faq.items.languages.q} a={s.faq.items.languages.a} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <Faq q={s.faq.items.security.q} a={s.faq.items.security.a} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <Faq q={s.faq.items.pricing.q} a={s.faq.items.pricing.a} />
            </motion.div>
          </div>
        </motion.section>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
          <FooterCta dict={dict} />
        </motion.div>
      </main>
    </MarketingPageAtmosphere>
  );
}

function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[rgba(91,140,255,0.10)] blur-2xl [animation:draxilo-drift_10s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute left-44 top-10 h-28 w-28 rounded-full bg-[rgba(124,247,212,0.08)] blur-2xl [animation:draxilo-drift_12s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute right-8 top-6 hidden h-32 w-32 rounded-full bg-[rgba(91,140,255,0.08)] blur-2xl [animation:draxilo-float_6.5s_ease-in-out_infinite] sm:block" />

      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          className="min-w-0"
        >
          <div className="relative inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(26,31,43,0.55)] px-3 py-2 text-xs text-[var(--muted)] backdrop-blur">
            <span className="pointer-events-none absolute inset-0 rounded-full [background:radial-gradient(60%_120%_at_30%_0%,rgba(91,140,255,0.20),transparent_60%)] opacity-70 [animation:draxilo-breathe_4.2s_ease-in-out_infinite]" />
            <span className="relative h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(124,247,212,0.55)]" />
            {dict.marketing.ui.badge}
          </div>

          <h1 className="mt-7 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.15rem] lg:leading-[1.08]">
            <span className="relative inline-block">
              <span className="absolute -inset-x-3 -inset-y-2 -z-10 rounded-3xl bg-[rgba(91,140,255,0.08)] blur-xl" />
              {dict.marketing.headline}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-[var(--muted-2)] sm:text-lg sm:leading-8">
            {dict.marketing.subheadline}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <GlowButton href="/signup" label={dict.marketing.primaryCta} />
            <GhostButton href="/login" label={dict.marketing.secondaryCta} />
          </div>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[rgba(255,255,255,0.48)]">{dict.marketing.ui.heroCtaHint}</p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <SignalPill label={dict.marketing.ui.signals.leadVelocity} value="+18%" />
            <SignalPill label={dict.marketing.ui.signals.enrichmentMatch} value="0.86" />
            <SignalPill label={dict.marketing.ui.signals.replyLift} value="+2.1x" />
          </div>
        </motion.div>

        <motion.div
          className="relative min-w-0 lg:justify-self-end"
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(55%_55%_at_50%_0%,rgba(91,140,255,0.14),transparent_65%)] blur-xl" />
          <HeroProductPreview dict={dict} />
        </motion.div>
      </div>
    </section>
  );
}

function SignalPill({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.35)] px-4 py-3 backdrop-blur"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 [background:radial-gradient(80%_70%_at_20%_0%,rgba(91,140,255,0.18),transparent_55%)] transition-opacity duration-200 group-hover:opacity-100" />
      <div className="relative flex items-center justify-between">
        <div className="text-xs text-[rgba(255,255,255,0.55)]">{label}</div>
        <div className="text-xs font-semibold text-white">{value}</div>
      </div>
    </motion.div>
  );
}

function GlowButton({ href, label }: { href: string; label: string }) {
  return (
    <Magnetic strength={14}>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={href}
          className={[
            "group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-2xl px-6 text-sm font-semibold text-white",
            "bg-[rgba(91,140,255,0.16)] ring-1 ring-[rgba(91,140,255,0.55)]",
            "transition-[box-shadow,transform] duration-200",
            "hover:shadow-[0_0_0_1px_rgba(91,140,255,0.35),0_22px_60px_rgba(91,140,255,0.26)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          ].join(" ")}
        >
          <span className="relative z-10">{label}</span>
          <span className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(80%_60%_at_50%_0%,rgba(124,247,212,0.22),transparent_60%)]" />
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-16 opacity-0 [background:radial-gradient(circle,rgba(124,247,212,0.18),transparent_55%)]"
            animate={{ opacity: [0, 0.55, 0], rotate: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 [background:linear-gradient(110deg,transparent,rgba(255,255,255,0.16),transparent)] [background-size:200%_100%]"
            whileHover={{ opacity: 1, backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </Link>
      </motion.div>
    </Magnetic>
  );
}

function GhostButton({ href, label }: { href: string; label: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={[
          "inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold",
          "border border-[var(--border)] bg-[rgba(26,31,43,0.35)] text-[var(--muted)]",
          "hover:bg-[rgba(26,31,43,0.55)] hover:text-white",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
        ].join(" ")}
      >
        {label}
      </Link>
    </motion.div>
  );
}

function FeatureCard({
  title,
  text,
  Icon,
  kicker,
  variant = "default",
  wide = false,
}: {
  title: string;
  text: string;
  Icon: React.ComponentType<{ className?: string }>;
  kicker?: string;
  variant?: FeatureCardVariant;
  wide?: boolean;
}) {
  const iconWrapClass =
    variant === "highlight"
      ? wide
        ? "inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[rgba(91,140,255,0.55)] bg-[rgba(91,140,255,0.14)] text-[var(--primary)] shadow-[0_0_0_1px_rgba(91,140,255,0.18),0_18px_60px_rgba(91,140,255,0.18)]"
        : "inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(91,140,255,0.55)] bg-[rgba(91,140,255,0.14)] text-[var(--primary)] shadow-[0_0_0_1px_rgba(91,140,255,0.18),0_18px_60px_rgba(91,140,255,0.18)]"
      : wide
        ? "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(91,140,255,0.35)] bg-[rgba(91,140,255,0.10)] text-[var(--primary)]"
        : "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(91,140,255,0.35)] bg-[rgba(91,140,255,0.10)] text-[var(--primary)]";

  const titleClass =
    variant === "highlight"
      ? wide
        ? "mt-0 text-lg font-semibold tracking-tight text-white sm:text-xl"
        : "mt-4 text-base font-semibold tracking-tight text-white sm:text-lg"
      : wide
        ? "mt-0 text-base font-semibold tracking-tight text-white"
        : "mt-4 text-sm font-semibold tracking-tight text-white";

  const tiltClass = [
    "group relative h-full rounded-[22px] backdrop-blur",
    variant === "highlight"
      ? wide
        ? "border border-[rgba(91,140,255,0.45)] bg-[rgba(26,31,43,0.62)] p-7 shadow-[0_0_0_1px_rgba(124,247,212,0.10),0_26px_90px_rgba(0,0,0,0.55)] sm:p-8"
        : "border border-[rgba(91,140,255,0.45)] bg-[rgba(26,31,43,0.62)] p-7 shadow-[0_0_0_1px_rgba(124,247,212,0.10),0_26px_90px_rgba(0,0,0,0.55)]"
      : variant === "gradient"
        ? "border-0 bg-[rgba(26,31,43,0.62)] p-6"
        : wide
          ? "border border-[var(--border)] bg-[rgba(26,31,43,0.55)] p-6 sm:p-8"
          : "border border-[var(--border)] bg-[rgba(26,31,43,0.55)] p-6",
  ].join(" ");

  const body = (
    <>
      {variant === "iconMotion" ? (
        <motion.div
          className={iconWrapClass}
          animate={{ rotate: [0, 7, -7, 0], y: [0, -1, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className={wide ? "h-6 w-6" : "h-5 w-5"} />
        </motion.div>
      ) : (
        <div className={iconWrapClass}>
          <Icon className={variant === "highlight" || wide ? "h-6 w-6" : "h-5 w-5"} />
        </div>
      )}

      <div className={wide ? "min-w-0 flex-1" : ""}>
        <div className={titleClass}>{title}</div>
        <div className={wide ? "mt-3 text-sm leading-6 text-[var(--muted-2)] sm:max-w-3xl" : "mt-2 flex-1 text-sm leading-6 text-[var(--muted-2)]"}>
          {text}
        </div>
        {kicker ? (
          <div
            className={[
              "flex items-center gap-2 text-xs text-[rgba(255,255,255,0.44)]",
              wide ? "mt-5" : "mt-5 lg:mt-auto",
            ].join(" ")}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[rgba(124,247,212,0.85)] shadow-[0_0_10px_rgba(124,247,212,0.35)]" />
            {kicker}
          </div>
        ) : null}
      </div>
    </>
  );

  const card = (
    <TiltCard className={tiltClass}>
      <div className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 ring-1 ring-transparent transition-all duration-300 group-hover:opacity-100 group-hover:ring-[rgba(91,140,255,0.22)] [background:radial-gradient(90%_70%_at_20%_0%,rgba(91,140,255,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(70%_60%_at_80%_100%,rgba(124,247,212,0.12),transparent_55%)]" />

      <div
        className={[
          "relative flex h-full min-h-0",
          wide ? "flex-col gap-6 sm:flex-row sm:items-start sm:gap-8" : "flex-col",
        ].join(" ")}
      >
        {body}
      </div>
    </TiltCard>
  );

  if (variant === "gradient") {
    return (
      <div className="h-full rounded-3xl p-px">
        <div className="h-full rounded-3xl [background:linear-gradient(135deg,rgba(91,140,255,0.85),rgba(124,247,212,0.55),rgba(91,140,255,0.35))] p-px">
          <div className="h-full rounded-[calc(1.5rem-1px)]">{card}</div>
        </div>
      </div>
    );
  }

  return card;
}

function HeroProductPreview({ dict }: { dict: Dictionary }) {
  const ui = dict.marketing.ui.productPreview;
  const fullBody = ui.bodySample;
  const [typed, setTyped] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    const timeouts: number[] = [];

    function sleep(ms: number) {
      return new Promise<void>((resolve) => {
        timeouts.push(window.setTimeout(resolve, ms));
      });
    }

    async function run() {
      while (!cancelled) {
        for (let i = 0; i <= fullBody.length; i++) {
          if (cancelled) return;
          setTyped(fullBody.slice(0, i));
          await sleep(19);
        }
        await sleep(1600);
      }
    }

    run();
    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [fullBody]);

  const tabs = [
    { id: "leads" as const, label: ui.tabLeads },
    { id: "enrich" as const, label: ui.tabEnrich },
    { id: "compose" as const, label: ui.tabCompose },
    { id: "campaign" as const, label: ui.tabCampaign },
  ];

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.72)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.07),transparent_65%)] [background-size:220%_100%]"
        animate={{ backgroundPosition: ["0% 0", "200% 0"] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />

      <div className="relative border-b border-[rgba(255,255,255,0.08)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,90,90,0.85)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,200,80,0.85)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(80,220,120,0.85)]" />
          </div>
          <div className="truncate text-center text-[11px] font-medium text-[rgba(255,255,255,0.45)]">{ui.windowTitle}</div>
          <div className="w-14" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tabs.map((t, idx) => (
            <span
              key={t.id}
              className={[
                "inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
                idx === 0
                  ? "bg-[rgba(91,140,255,0.16)] text-white ring-1 ring-[rgba(91,140,255,0.35)] shadow-[0_0_20px_rgba(91,140,255,0.12)]"
                  : "text-[rgba(255,255,255,0.42)]",
              ].join(" ")}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative grid gap-3 p-4 lg:grid-cols-5 lg:gap-4 lg:p-5">
        <div className="space-y-2 lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,20,0.55)]">
            <div className="grid grid-cols-[1.2fr_1fr_0.5fr_0.75fr] gap-2 border-b border-[rgba(255,255,255,0.06)] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[rgba(255,255,255,0.38)]">
              <span className="truncate">{ui.tableCompany}</span>
              <span className="truncate">{ui.tableDomain}</span>
              <span>{ui.tableMatch}</span>
              <span className="truncate">{ui.tableStatus}</span>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.05)] text-[11px]">
              <div className="grid grid-cols-[1.2fr_1fr_0.5fr_0.75fr] items-center gap-2 px-3 py-2.5 text-[rgba(255,255,255,0.88)]">
                <span className="truncate font-medium">{ui.row1Name}</span>
                <span className="truncate text-[rgba(255,255,255,0.55)]">{ui.row1Domain}</span>
                <span className="font-semibold text-[var(--accent)]">{ui.row1Score}</span>
                <span className="flex items-center gap-1.5 truncate text-[rgba(255,255,255,0.55)]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(124,247,212,0.9)] shadow-[0_0_8px_rgba(124,247,212,0.5)]" />
                  {ui.row1Status}
                </span>
              </div>
              <div className="grid grid-cols-[1.2fr_1fr_0.5fr_0.75fr] items-center gap-2 px-3 py-2.5 text-[rgba(255,255,255,0.88)]">
                <span className="truncate font-medium">{ui.row2Name}</span>
                <span className="truncate text-[rgba(255,255,255,0.55)]">{ui.row2Domain}</span>
                <span className="font-semibold text-[var(--primary)]">{ui.row2Score}</span>
                <span className="flex items-center gap-1.5 truncate text-[rgba(255,255,255,0.55)]">
                  <motion.span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(91,140,255,0.95)]"
                    animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.05, 0.9] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {ui.row2Status}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,20,0.45)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold text-white">{ui.campaignPanelTitle}</div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(91,140,255,0.25)] bg-[rgba(91,140,255,0.10)] px-2 py-0.5 text-[10px] font-medium text-[rgba(255,255,255,0.75)]">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                />
                {ui.campaignState}
              </div>
            </div>
            <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.45)]">{ui.campaignName}</div>
            <div className="mt-2 text-[10px] text-[rgba(255,255,255,0.38)]">{ui.campaignProgress}</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)]">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(91,140,255,0.55),rgba(124,247,212,0.55))]"
                initial={{ width: "38%" }}
                animate={{ width: ["38%", "72%", "55%", "82%"] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,20,0.50)] p-3">
            <div className="text-[11px] font-semibold text-white">{ui.enrichPanelTitle}</div>
            <dl className="mt-2 space-y-2 text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-[rgba(255,255,255,0.40)]">{ui.enrichLabelIndustry}</dt>
                <dd className="text-right font-medium text-[rgba(255,255,255,0.82)]">{ui.enrichValueIndustry}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[rgba(255,255,255,0.40)]">{ui.enrichLabelIcp}</dt>
                <dd className="text-right font-medium text-[rgba(255,255,255,0.82)]">{ui.enrichValueIcp}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[rgba(255,255,255,0.40)]">{ui.enrichLabelAngle}</dt>
                <dd className="text-right font-medium text-[rgba(255,255,255,0.82)]">{ui.enrichValueAngle}</dd>
              </div>
            </dl>
            <div className="mt-2 inline-flex rounded-md border border-[rgba(124,247,212,0.22)] bg-[rgba(124,247,212,0.06)] px-2 py-0.5 text-[10px] font-medium text-[rgba(124,247,212,0.92)]">
              {ui.enrichConfidence}
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,20,0.50)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold text-white">{ui.composePanelTitle}</div>
              <motion.div
                className="text-[10px] font-medium text-[rgba(91,140,255,0.95)]"
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                {ui.generating}
              </motion.div>
            </div>
            <div className="mt-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.25)] px-2.5 py-2 text-[11px] font-medium text-[rgba(255,255,255,0.78)]">
              {ui.subjectLine}
            </div>
            <p className="mt-2 h-[3.5rem] overflow-hidden text-[11px] leading-relaxed text-[rgba(255,255,255,0.55)] line-clamp-3">
              {typed}
              <motion.span
                className="inline-block h-3 w-px translate-y-0.5 bg-[var(--primary)] align-middle"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustSection({ dict }: { dict: Dictionary }) {
  const t = dict.marketing.ui.trust;
  return (
    <section className="relative mt-16 overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(26,31,43,0.42)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(91,140,255,0.12)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[rgba(124,247,212,0.08)] blur-3xl" />
      <div className="relative">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{t.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-2)]">{t.subtitle}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <TrustStat label={t.stat1Label} value={t.stat1Value} delay={0} />
          <TrustStat label={t.stat2Label} value={t.stat2Value} delay={0.06} />
          <TrustStat label={t.stat3Label} value={t.stat3Value} delay={0.12} />
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {[t.badge1, t.badge2, t.badge3].map((b) => (
            <span
              key={b}
              className="rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)] px-3 py-1.5 text-[11px] font-medium text-[rgba(255,255,255,0.55)]"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustStat({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(11,15,20,0.50)] p-4"
    >
      <div className="text-[11px] font-medium text-[rgba(255,255,255,0.45)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</div>
    </motion.div>
  );
}

function OpsStrip({ dict }: { dict: Dictionary }) {
  const o = dict.marketing.ui.opsStrip;
  const lines = [o.activity1, o.activity2, o.activity3];
  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[rgba(26,31,43,0.40)] p-6 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(90%_70%_at_90%_0%,rgba(124,247,212,0.10),transparent_55%)]" />
      <div className="relative flex h-full flex-col">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{o.title}</div>
          <p className="mt-2 text-sm text-[var(--muted-2)]">{o.subtitle}</p>
        </div>
        <motion.ul className="mt-6 flex flex-1 flex-col gap-3" variants={staggerContainer} initial="hidden" whileInView="show" viewport={revealViewport}>
          {lines.map((line) => (
            <motion.li
              key={line}
              variants={staggerItem}
              className="flex items-start gap-3 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(11,15,20,0.55)] px-4 py-3"
            >
              <motion.span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-sm text-[rgba(255,255,255,0.78)]">{line}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

function HowItWorks({ dict }: { dict: Dictionary }) {
  const s = dict.marketing.sections.howItWorks.steps;
  const items = [s.find, s.enrich, s.write, s.send];
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[rgba(26,31,43,0.40)] p-6 backdrop-blur-xl">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {dict.marketing.sections.howItWorks.title}
      </div>
      <motion.div className="mt-4 grid gap-3" variants={staggerContainer} initial="hidden" whileInView="show" viewport={revealViewport}>
        {items.map((x, idx) => (
          <motion.div key={x.title} variants={staggerItem} className="rounded-2xl border border-[var(--border)] bg-[rgba(11,15,20,0.55)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{x.title}</div>
                <div className="mt-1 text-sm text-[var(--muted-2)]">{x.text}</div>
              </div>
              <div className="mt-0.5 text-xs font-semibold text-[rgba(124,247,212,0.9)]">
                0{idx + 1}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      <span className="leading-6">{text}</span>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <motion.details
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group rounded-2xl border border-[var(--border)] bg-[rgba(26,31,43,0.35)] px-5 py-4 backdrop-blur"
    >
      <summary className="cursor-pointer list-none text-sm font-semibold text-white">
        {q}
      </summary>
      <div className="mt-2 text-sm text-[var(--muted-2)]">{a}</div>
    </motion.details>
  );
}

function FooterCta({ dict }: { dict: Dictionary }) {
  const s = dict.marketing.sections.footerCta;
  return (
    <section className="mt-16 rounded-[28px] border border-[rgba(91,140,255,0.22)] bg-[rgba(91,140,255,0.10)] p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight text-white">{s.title}</div>
          <div className="mt-1 text-sm text-[var(--muted-2)]">{s.text}</div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <GlowButton href="/signup" label={s.primary} />
          <GhostButton href="/login" label={s.secondary} />
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between text-xs text-[rgba(255,255,255,0.44)]">
        <div>© {new Date().getFullYear()} Draxilo</div>
        <div className="hidden sm:block">{dict.marketing.ui.footerTagline}</div>
      </div>
    </section>
  );
}

function LogoMarquee() {
  const items = ["Kvalifits", "Energiakalkulaator", "Baltic Ops", "Nordic Scale"];
  const long = Array.from({ length: 10 }, (_, i) => items[i % items.length]);
  return (
    <div className="mt-6 overflow-hidden">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 [background:linear-gradient(to_right,rgba(11,15,20,1),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 [background:linear-gradient(to_left,rgba(11,15,20,1),transparent)]" />
        <motion.div
          className="flex w-max gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {[...long, ...long].map((x, idx) => (
            <div
              key={`${x}-${idx}`}
              className="rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.35)] px-4 py-2 text-xs font-semibold tracking-wide text-[rgba(255,255,255,0.55)]"
            >
              {x}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function TiltCard({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 220, damping: 22, mass: 0.3 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 220, damping: 22, mass: 0.3 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    x.set(px);
    y.set(py);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{ transformStyle: "preserve-3d", rotateX: rx, rotateY: ry }}
      className={className}
    >
      <div style={{ transform: "translateZ(0px)" }}>{children}</div>
    </motion.div>
  );
}

function Magnetic({ children, strength = 10 }: { children: React.ReactNode; strength?: number }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 260, damping: 18, mass: 0.25 });
  const sy = useSpring(my, { stiffness: 260, damping: 18, mass: 0.25 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    mx.set((dx / r.width) * strength);
    my.set((dy / r.height) * strength);
  }

  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy }}>
      {children}
    </motion.div>
  );
}

