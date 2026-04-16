"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
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
  const heroY = useTransform(scrollYProgress, [0, 0.45], [0, -28]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.92]);

  const s = dict.marketing.sections;

  return (
    <MarketingPageAtmosphere>
      <MarketingNavbar locale={locale} dict={dict} current="home" />

      <main className="relative mx-auto w-full max-w-7xl overflow-x-clip px-6 pb-32 pt-24 sm:pt-28 lg:px-8">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          <Hero dict={dict} />
        </motion.div>

        <div className="mt-16 space-y-16">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
            <TrustSection dict={dict} />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
            <SystemMap dict={dict} />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
            <ModuleConsole dict={dict} />
          </motion.div>

          <section className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <motion.div className="min-h-0" variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
              <HowItWorks dict={dict} />
            </motion.div>
            <motion.div className="min-h-0" variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
              <OpsStrip dict={dict} />
            </motion.div>
          </section>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={revealViewport}>
            <DemoTeaser dict={dict} />
          </motion.div>

          <motion.section
            className="rounded-3xl border border-[var(--border)] bg-[rgba(26,31,43,0.65)] p-6 backdrop-blur-xl sm:p-8"
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
            <FinalSceneCta dict={dict} />
          </motion.div>
        </div>
      </main>
    </MarketingPageAtmosphere>
  );
}

function Hero({ dict }: { dict: Dictionary }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-x-clip pb-10 lg:pb-14">
      {/* Signature stage: keep it minimal, product-first */}
      <div className="pointer-events-none absolute inset-x-0 -top-20 h-[680px] [background:radial-gradient(80%_60%_at_50%_0%,rgba(91,140,255,0.28),transparent_62%),radial-gradient(70%_60%_at_70%_10%,rgba(124,247,212,0.16),transparent_62%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-12 h-[520px] opacity-[0.22]"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, rgba(91,140,255,0.10) 24%, rgba(124,247,212,0.10) 48%, transparent 72%)",
          maskImage:
            "radial-gradient(60% 60% at 50% 28%, rgba(0,0,0,1), rgba(0,0,0,0) 70%)",
          WebkitMaskImage:
            "radial-gradient(60% 60% at 50% 28%, rgba(0,0,0,1), rgba(0,0,0,0) 70%)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [0.12, 0.28, 0.14], x: ["-2%", "2%", "-2%"] }
        }
        transition={prefersReducedMotion ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-x-0 -top-28 h-[760px] opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:120px_120px] [mask-image:radial-gradient(70%_55%_at_50%_28%,black,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 [background:linear-gradient(to_bottom,rgba(11,15,20,0.88),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 [background:linear-gradient(to_top,rgba(11,15,20,0.92),transparent)]" />

      <div className="relative grid gap-8 sm:gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-10 min-w-0 lg:col-span-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.55)] px-3 py-2 text-xs font-semibold text-[rgba(255,255,255,0.68)] backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_16px_rgba(124,247,212,0.45)]" />
            {dict.marketing.ui.badge}
          </div>

          <h1 className="mt-7 max-w-[23ch] text-balance text-[2.75rem] font-semibold tracking-tight text-white sm:text-[3.45rem] lg:text-[4.05rem] lg:leading-[1.02]">
            <motion.span
              className="relative block"
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <span className="absolute -inset-x-10 -inset-y-6 -z-10 rounded-[2.75rem] bg-[radial-gradient(65%_70%_at_35%_0%,rgba(91,140,255,0.22),transparent_62%)] blur-2xl" />
              <span className="bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.62))] bg-clip-text text-transparent">
                {dict.marketing.headline}
              </span>
              <span className="pointer-events-none absolute -bottom-3 left-0 h-px w-[72%] bg-[linear-gradient(90deg,rgba(124,247,212,0.0),rgba(124,247,212,0.65),rgba(91,140,255,0.0))] opacity-70" />
            </motion.span>
          </h1>

          <p className="mt-5 max-w-[38rem] text-pretty text-base leading-7 text-[var(--muted-2)] sm:text-lg sm:leading-8">
            {dict.marketing.subheadline}
          </p>

          <div className="mt-7">
            <HeroCtaCluster dict={dict} reduced={Boolean(prefersReducedMotion)} />
          </div>

          <p className="mt-4 max-w-[34rem] text-sm leading-6 text-[rgba(255,255,255,0.46)]">{dict.marketing.ui.heroCtaHint}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mx-auto w-full max-w-[760px] min-w-0 lg:col-span-6 lg:mx-0 lg:max-w-none lg:-ml-6 lg:translate-y-1 xl:-ml-8 xl:translate-y-2"
        >
          <div className="pointer-events-none absolute -inset-14 rounded-[44px] bg-[radial-gradient(55%_55%_at_50%_0%,rgba(91,140,255,0.26),transparent_64%)] blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 hidden h-64 w-64 translate-x-24 rounded-full bg-[rgba(124,247,212,0.10)] blur-3xl lg:block" />
          <FlagshipCommandRoom dict={dict} reduced={Boolean(prefersReducedMotion)} />
        </motion.div>
      </div>
    </section>
  );
}

function HeroCtaCluster({ dict, reduced }: { dict: Dictionary; reduced: boolean }) {
  return (
    <div className="flex w-full max-w-[36rem] flex-col items-start gap-3">
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[auto_auto] sm:items-center">
        <Magnetic strength={18}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.985 }}>
            <Link
              href="/demo"
              className={[
                "group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] px-5 text-sm font-semibold text-white",
                "bg-[linear-gradient(135deg,rgba(124,247,212,0.20),rgba(91,140,255,0.18))]",
                "ring-1 ring-[rgba(124,247,212,0.38)]",
                "shadow-[0_30px_120px_rgba(124,247,212,0.12)]",
                "transition-[box-shadow,transform] duration-200",
                "hover:shadow-[0_0_0_1px_rgba(124,247,212,0.22),0_42px_160px_rgba(124,247,212,0.16)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
              ].join(" ")}
            >
              <span className="relative z-10">{dict.nav.demo}</span>
              <span className="relative z-10 text-[rgba(255,255,255,0.74)]">·</span>
              <span className="relative z-10">{dict.marketing.ui.heroLaunchVerb}</span>
              <span className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(80%_60%_at_50%_0%,rgba(124,247,212,0.22),transparent_60%),radial-gradient(70%_60%_at_30%_120%,rgba(91,140,255,0.20),transparent_62%)]" />
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 [background:linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] [background-size:200%_100%] [animation:draxion-shimmer_1.1s_ease-out_1]" />
            </Link>
          </motion.div>
        </Magnetic>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link
            href="/signup"
            className={[
              "relative inline-flex h-12 w-full items-center justify-center rounded-[18px] px-5 text-sm font-semibold",
              "border border-[rgba(255,255,255,0.14)] bg-[rgba(11,15,20,0.35)] text-[rgba(255,255,255,0.78)]",
              "hover:bg-[rgba(11,15,20,0.50)] hover:text-white",
              "transition-[background,color] duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
            ].join(" ")}
          >
            {dict.marketing.primaryCta}
          </Link>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[rgba(255,255,255,0.46)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-80" />
          {dict.marketing.ui.heroMicrocopy}
        </span>
      </div>
    </div>
  );
}

function PulseRing({ reduced }: { reduced: boolean }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2">
      <motion.div
        className="h-[520px] w-[520px] rounded-full border border-[rgba(255,255,255,0.08)] opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(91,140,255,0.10), transparent 58%), radial-gradient(circle at 50% 50%, rgba(124,247,212,0.06), transparent 62%)",
          maskImage: "radial-gradient(circle at 50% 50%, black 52%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 52%, transparent 72%)",
        }}
        animate={reduced ? undefined : { scale: [0.98, 1.02, 0.98], opacity: [0.55, 0.8, 0.55] }}
        transition={reduced ? undefined : { duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(124,247,212,0.12)] opacity-70"
        animate={reduced ? undefined : { rotate: [0, 10, 0] }}
        transition={reduced ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
function HeroChip({ text, value }: { text: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)] px-3 py-1.5 text-[11px] font-semibold text-[rgba(255,255,255,0.70)] backdrop-blur-xl">
      <span className="h-1.5 w-1.5 rounded-full bg-[rgba(91,140,255,0.95)] shadow-[0_0_10px_rgba(91,140,255,0.35)]" />
      <span className="text-[rgba(255,255,255,0.55)]">{text}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function FlagshipCommandRoom({ dict, reduced }: { dict: Dictionary; reduced: boolean }) {
  // A cinematic, ownable centerpiece: a “brain core” + docked windows + signal routing.
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-70, 70], [7, -7]), { stiffness: 160, damping: 26, mass: 0.45 });
  const ry = useSpring(useTransform(mx, [-70, 70], [-10, 10]), { stiffness: 160, damping: 26, mass: 0.45 });
  const g = useSpring(useTransform(mx, [-70, 70], ["35%", "65%"]) as any, { stiffness: 120, damping: 22, mass: 0.6 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - (r.left + r.width / 2));
    my.set(e.clientY - (r.top + r.height / 2));
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div ref={ref} onMouseMove={reduced ? undefined : onMove} onMouseLeave={reduced ? undefined : onLeave} style={{ perspective: 1100 }}>
      <motion.div
        className="relative overflow-hidden rounded-[34px] border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.40)] shadow-[0_34px_140px_rgba(0,0,0,0.60)] backdrop-blur-xl"
        style={reduced ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(520px 420px at var(--gx) 12%, rgba(91,140,255,0.22), transparent 64%), radial-gradient(420px 340px at 50% 10%, rgba(124,247,212,0.14), transparent 62%)",
            ["--gx" as any]: g,
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent_70%)]" />

        <div className="relative p-4 sm:p-5" style={{ transform: "translateZ(16px)" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.25)] px-3 py-1.5 text-[11px] font-semibold text-[rgba(255,255,255,0.74)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_rgba(124,247,212,0.45)]" />
              {dict.marketing.ui.heroSurfaceTitle}
            </div>
            <div className="text-[10px] font-medium text-[rgba(255,255,255,0.50)]">{dict.marketing.ui.heroSurfaceFlowShort}</div>
          </div>

          <div className="relative mt-4">
            <BrainCoreLayout dict={dict} reduced={reduced} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BrainCoreLayout({ dict, reduced }: { dict: Dictionary; reduced: boolean }) {
  const ui = dict.marketing.ui.productPreview;

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.12)] bg-[rgba(26,31,43,0.34)] p-4 shadow-[0_22px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:90px_90px] [mask-image:radial-gradient(70%_70%_at_50%_35%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(55%_55%_at_50%_20%,rgba(91,140,255,0.12),transparent_62%)]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroCoreTitle}</div>
          <div className="text-[10px] font-medium text-[rgba(255,255,255,0.50)]">{dict.marketing.ui.heroCoreRule}</div>
        </div>

        <div
          className="relative mt-4 overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.46)] p-4 shadow-[0_26px_90px_rgba(0,0,0,0.45)] sm:p-5"
          style={{ perspective: 1000 }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(520px_420px_at_55%_22%,rgba(91,140,255,0.14),transparent_62%)]" />
          <NeuralLattice reduced={reduced} />

          <UnifiedCommandPreview dict={dict} reduced={reduced} />
        </div>
      </div>
    </div>
  );
}

function UnifiedCommandPreview({ dict, reduced }: { dict: Dictionary; reduced: boolean }) {
  const ui = dict.marketing.ui.productPreview;
  const [active, setActive] = React.useState<"signals" | "enrich" | "outreach">("signals");

  const tabs = [
    { id: "signals" as const, label: ui.tabLeads },
    { id: "enrich" as const, label: ui.tabEnrich },
    { id: "outreach" as const, label: ui.tabCompose },
  ];

  return (
    <div className="relative">
      {/* Top row: title + tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.22)] px-3 py-1.5 text-[11px] font-semibold text-[rgba(255,255,255,0.76)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_rgba(124,247,212,0.45)]" />
          {dict.marketing.ui.heroSurfaceTitle}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={[
                  "shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold transition-[background,color,box-shadow] duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                  isActive
                    ? "border-[rgba(124,247,212,0.30)] bg-[rgba(124,247,212,0.10)] text-white shadow-[0_0_24px_rgba(124,247,212,0.10)]"
                    : "border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)] text-[rgba(255,255,255,0.66)] hover:text-white",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main surface */}
      <div className="relative mt-4 overflow-hidden rounded-[26px] border border-[rgba(255,255,255,0.12)] bg-[rgba(26,31,43,0.36)] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(420px_320px_at_50%_18%,rgba(91,140,255,0.16),transparent_62%)]" />

        <div className="relative">
          <AnimatePresence mode="wait">
            {active === "signals" ? (
              <motion.div
                key="signals"
                initial={{ opacity: 0, y: 10, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(7px)" }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroSignalsTitle}</div>
                <div className="mt-3">
                  <HeroProductPreview dict={dict} />
                </div>
              </motion.div>
            ) : active === "enrich" ? (
              <motion.div
                key="enrich"
                initial={{ opacity: 0, y: 10, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(7px)" }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroEnrichmentTitle}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <MiniStat k={ui.enrichLabelIndustry} v={ui.enrichValueIndustry} />
                  <MiniStat k={ui.enrichLabelIcp} v={ui.enrichValueIcp} />
                  <MiniStat k={ui.enrichLabelAngle} v={ui.enrichValueAngle} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="outreach"
                initial={{ opacity: 0, y: 10, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(7px)" }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroOutreachTitle}</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[0.95fr_1.05fr] sm:items-start">
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.48)] p-3">
                    <div className="text-[10px] font-medium text-[rgba(255,255,255,0.46)]">{dict.marketing.ui.heroSubjectLabel}</div>
                    <div className="mt-1 text-[11px] font-semibold text-white">{ui.subjectLine}</div>
                    <div className="mt-2 text-[10px] font-medium text-[rgba(255,255,255,0.46)]">{dict.marketing.ui.heroCtaLabel}</div>
                    <div className="mt-1 text-[11px] font-semibold text-white">{dict.marketing.ui.heroCtaValue}</div>
                  </div>
                  <div className="text-[11px] leading-relaxed text-[rgba(255,255,255,0.62)] line-clamp-6">
                    {ui.bodySample}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MobileBrainHero({ dict, reduced }: { dict: Dictionary; reduced: boolean }) {
  const ui = dict.marketing.ui.productPreview;
  const [active, setActive] = React.useState<"signals" | "enrich" | "outreach">("signals");

  const tabs = [
    { id: "signals" as const, label: ui.tabLeads },
    { id: "enrich" as const, label: ui.tabEnrich },
    { id: "outreach" as const, label: ui.tabCompose },
  ];

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[26px] border border-[rgba(255,255,255,0.12)] bg-[rgba(26,31,43,0.44)] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(420px_320px_at_50%_18%,rgba(91,140,255,0.18),transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:86px_86px] [mask-image:radial-gradient(70%_70%_at_50%_35%,black,transparent_72%)]" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroCoreTitle}</div>
            <div className="text-[10px] font-medium text-[rgba(255,255,255,0.50)]">{dict.marketing.ui.heroSurfaceFlowShort}</div>
          </div>

          <div className="relative mt-3 flex items-center justify-center">
            <div className="relative h-[220px] w-full overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.52)]">
              <NeuralLattice reduced={reduced} />
              <div className="absolute inset-0 flex items-center justify-center">
                <CoreNucleus reduced={reduced} />
              </div>
              <svg viewBox="0 0 520 220" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.32]">
                <defs>
                  <linearGradient id="draxionMobileConnect" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(91,140,255,0.65)" />
                    <stop offset="55%" stopColor="rgba(124,247,212,0.55)" />
                    <stop offset="100%" stopColor="rgba(168,120,255,0.45)" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M40 150 C 140 70, 220 170, 260 110 S 380 40, 480 92"
                  fill="none"
                  stroke="url(#draxionMobileConnect)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  animate={reduced ? { opacity: 0.55 } : { pathLength: [0.2, 1, 0.2], opacity: [0.16, 0.6, 0.16] }}
                  transition={reduced ? undefined : { duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
            </div>
          </div>

          {/* Dock strip */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={[
                    "shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold transition-[background,color,box-shadow] duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                    isActive
                      ? "border-[rgba(124,247,212,0.30)] bg-[rgba(124,247,212,0.10)] text-white shadow-[0_0_24px_rgba(124,247,212,0.10)]"
                      : "border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)] text-[rgba(255,255,255,0.66)]",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Reveal panel */}
          <div className="mt-3 rounded-[24px] border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.50)] p-3">
            <AnimatePresence mode="wait">
              {active === "signals" ? (
                <motion.div
                  key="signals"
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroSignalsTitle}</div>
                  <div className="mt-2">
                    <HeroProductPreview dict={dict} />
                  </div>
                </motion.div>
              ) : active === "enrich" ? (
                <motion.div
                  key="enrich"
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroEnrichmentTitle}</div>
                  <div className="mt-3 grid gap-2">
                    <MiniStat k={ui.enrichLabelIndustry} v={ui.enrichValueIndustry} />
                    <MiniStat k={ui.enrichLabelIcp} v={ui.enrichValueIcp} />
                    <MiniStat k={ui.enrichLabelAngle} v={ui.enrichValueAngle} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="outreach"
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroOutreachTitle}</div>
                  <div className="mt-2 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.38)] p-3">
                    <div className="text-[10px] font-medium text-[rgba(255,255,255,0.46)]">{dict.marketing.ui.heroSubjectLabel}</div>
                    <div className="mt-1 text-[11px] font-semibold text-white">{ui.subjectLine}</div>
                    <div className="mt-2 text-[11px] leading-relaxed text-[rgba(255,255,255,0.60)] line-clamp-6">
                      {ui.bodySample}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoreLegend({ dict, reduced }: { dict: Dictionary; reduced: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[68%] w-[240px] -translate-x-1/2 rounded-[18px] border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.46)] p-3 text-[10px] text-[rgba(255,255,255,0.60)] backdrop-blur-xl"
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset" }}
      animate={reduced ? undefined : { y: [0, -4, 0], opacity: [0.75, 1, 0.75] }}
      transition={reduced ? undefined : { duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-white">{dict.marketing.ui.heroCoreTitle.toUpperCase()}</span>
        <span className="text-[rgba(255,255,255,0.46)]">{dict.marketing.ui.heroCoreLegendMeta}</span>
      </div>
      <div className="mt-1">{dict.marketing.ui.heroCoreLegendHint}</div>
    </motion.div>
  );
}

function ConnectorsOverlay({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 980 520" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.28]">
      <defs>
        <linearGradient id="draxionStory" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(91,140,255,0.65)" />
          <stop offset="55%" stopColor="rgba(124,247,212,0.50)" />
          <stop offset="100%" stopColor="rgba(168,120,255,0.45)" />
        </linearGradient>
        <filter id="draxionStoryGlow">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M240 170 C 420 120, 470 170, 520 250"
        fill="none"
        stroke="url(#draxionStory)"
        strokeWidth="2.2"
        strokeLinecap="round"
        filter="url(#draxionStoryGlow)"
        animate={reduced ? { opacity: 0.55 } : { pathLength: [0.25, 1, 0.25], opacity: [0.12, 0.6, 0.12] }}
        transition={reduced ? undefined : { duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M740 180 C 620 150, 560 190, 520 250"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.6"
        strokeLinecap="round"
        animate={reduced ? { opacity: 0.5 } : { opacity: [0.10, 0.35, 0.10] }}
        transition={reduced ? undefined : { duration: 7.0, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M560 360 C 560 310, 540 280, 520 250"
        fill="none"
        stroke="url(#draxionStory)"
        strokeWidth="2.2"
        strokeLinecap="round"
        filter="url(#draxionStoryGlow)"
        animate={reduced ? { opacity: 0.55 } : { pathLength: [0.25, 1, 0.25], opacity: [0.12, 0.6, 0.12] }}
        transition={reduced ? undefined : { duration: 6.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
    </svg>
  );
}

function NeuralLattice({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 520 360" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.22]">
      <defs>
        <linearGradient id="draxionLattice" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(91,140,255,0.55)" />
          <stop offset="55%" stopColor="rgba(124,247,212,0.45)" />
          <stop offset="100%" stopColor="rgba(168,120,255,0.35)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M20 250 C 120 110, 200 310, 280 190 S 420 90, 500 140"
        fill="none"
        stroke="url(#draxionLattice)"
        strokeWidth="1.6"
        strokeLinecap="round"
        animate={reduced ? { opacity: 0.55 } : { pathLength: [0.12, 1, 0.12], opacity: [0.18, 0.55, 0.18] }}
        transition={reduced ? undefined : { duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M30 70 C 150 40, 210 140, 310 92 S 430 40, 500 90"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.2"
        strokeLinecap="round"
        animate={reduced ? { opacity: 0.5 } : { opacity: [0.10, 0.28, 0.10] }}
        transition={reduced ? undefined : { duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {[
        { x: 78, y: 250 },
        { x: 210, y: 140 },
        { x: 280, y: 190 },
        { x: 430, y: 90 },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={10} fill="rgba(255,255,255,0.05)" />
          <circle cx={n.x} cy={n.y} r={5.8} fill="rgba(124,247,212,0.90)" />
        </g>
      ))}
    </svg>
  );
}

function CoreNucleus({ reduced }: { reduced: boolean }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
      <motion.div
        className="relative h-[180px] w-[180px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.10), transparent 44%), radial-gradient(circle at 50% 52%, rgba(124,247,212,0.14), transparent 62%), radial-gradient(circle at 50% 58%, rgba(91,140,255,0.18), transparent 66%)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.10) inset, 0 28px 110px rgba(0,0,0,0.55)",
        }}
        animate={reduced ? undefined : { scale: [0.98, 1.02, 0.98] }}
        transition={reduced ? undefined : { duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, rgba(91,140,255,0.00), rgba(91,140,255,0.28), rgba(124,247,212,0.22), rgba(168,120,255,0.16), rgba(91,140,255,0.00))",
            maskImage: "radial-gradient(circle, transparent 46%, black 66%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 46%, black 66%, transparent 78%)",
            opacity: 0.8,
          }}
          animate={reduced ? undefined : { rotate: [0, 14, 0] }}
          transition={reduced ? undefined : { duration: 10.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.55)] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]" />
      </motion.div>
    </div>
  );
}

function HeroHudOverlay({ dict, reduced }: { dict: Dictionary; reduced: boolean }) {
  return (
    <div className="pointer-events-none absolute -inset-4 hidden lg:block">
      <motion.div
        className="absolute left-2 top-6 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.55)] px-3 py-1.5 text-[10px] font-semibold text-[rgba(255,255,255,0.70)] backdrop-blur-xl"
        animate={reduced ? undefined : { y: [0, -4, 0], opacity: [0.75, 1, 0.75] }}
        transition={reduced ? undefined : { duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {dict.marketing.ui.heroConfidenceGate}
      </motion.div>
      <motion.div
        className="absolute right-0 top-2 rounded-full border border-[rgba(124,247,212,0.22)] bg-[rgba(124,247,212,0.06)] px-3 py-1.5 text-[10px] font-semibold text-[rgba(255,255,255,0.70)] backdrop-blur-xl"
        animate={reduced ? undefined : { y: [0, 3, 0], opacity: [0.7, 1, 0.7] }}
        transition={reduced ? undefined : { duration: 6.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {dict.marketing.ui.heroSignalProvenance}
      </motion.div>
      <svg viewBox="0 0 520 220" className="absolute inset-0 h-full w-full opacity-[0.22]">
        <defs>
          <linearGradient id="draxionHud" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(91,140,255,0.55)" />
            <stop offset="55%" stopColor="rgba(124,247,212,0.45)" />
            <stop offset="100%" stopColor="rgba(168,120,255,0.40)" />
          </linearGradient>
        </defs>
        <path
          d="M70 56 C 170 10, 240 40, 310 62 S 420 98, 470 70"
          fill="none"
          stroke="url(#draxionHud)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M50 168 C 160 120, 240 170, 310 142 S 420 122, 486 150"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function FloatingShards({ reduced }: { reduced: boolean }) {
  const shards = [
    { x: "6%", y: "14%", w: 110, h: 44, t: 5.6 },
    { x: "84%", y: "10%", w: 140, h: 54, t: 6.4 },
    { x: "78%", y: "82%", w: 120, h: 46, t: 7.2 },
  ] as const;

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {shards.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-[18px] border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.26)] backdrop-blur-xl"
          style={{ left: s.x, top: s.y, width: s.w, height: s.h }}
          animate={
            reduced
              ? undefined
              : { y: [0, -6 - i * 1.5, 0], rotate: [0, i % 2 === 0 ? 1.2 : -1.2, 0], opacity: [0.55, 0.85, 0.55] }
          }
          transition={reduced ? undefined : { duration: s.t, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-[18px] opacity-60 [background:radial-gradient(80%_70%_at_20%_0%,rgba(91,140,255,0.22),transparent_55%)]" />
          <div className="absolute inset-0 rounded-[18px] opacity-50 [background:radial-gradient(70%_60%_at_80%_120%,rgba(124,247,212,0.16),transparent_55%)]" />
        </motion.div>
      ))}
    </div>
  );
}

function LayerWindow({
  title,
  subtitle,
  tone,
  reduced,
  z,
  compact,
  liveLabel,
  children,
}: {
  title: string;
  subtitle: string;
  tone: "blue" | "teal" | "violet";
  reduced: boolean;
  z: string;
  compact?: boolean;
  liveLabel?: string;
  children: React.ReactNode;
}) {
  const glow =
    tone === "teal"
      ? "rgba(124,247,212,0.18)"
      : tone === "violet"
        ? "rgba(168,120,255,0.16)"
        : "rgba(91,140,255,0.20)";

  return (
    <motion.div
      className={[
        "relative overflow-hidden rounded-[26px] border border-[rgba(255,255,255,0.12)] bg-[rgba(26,31,43,0.55)] shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        compact ? "p-4" : "p-4 sm:p-5",
        z,
      ].join(" ")}
      animate={reduced ? undefined : { y: [0, -3, 0] }}
      transition={reduced ? undefined : { duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="pointer-events-none absolute -inset-16 opacity-70" style={{ background: `radial-gradient(circle,${glow},transparent 60%)` }} />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.07),transparent_65%)] [background-size:220%_100%]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white">{title}</div>
            <div className="mt-0.5 text-[10px] font-medium text-[rgba(255,255,255,0.48)]">{subtitle}</div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)] px-2.5 py-1 text-[10px] font-semibold text-[rgba(255,255,255,0.70)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            {liveLabel ?? "Live"}
          </div>
        </div>
        <div className={compact ? "mt-3" : "mt-4"}>{children}</div>
      </div>
    </motion.div>
  );
}

function MiniStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.50)] px-3 py-2 text-[11px]">
      <span className="text-[rgba(255,255,255,0.48)]">{k}</span>
      <span className="text-right font-semibold text-white">{v}</span>
    </div>
  );
}

function SignalRouting({ dict, reduced }: { dict: Dictionary; reduced: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.50)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroSignalRouting}</div>
        <div className="text-[10px] font-medium text-[rgba(255,255,255,0.45)]">{dict.marketing.ui.heroVerifiedLabel}</div>
      </div>
      <div className="mt-3">
        <svg viewBox="0 0 420 140" className="w-full">
          <defs>
            <linearGradient id="draxionHeroFlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(91,140,255,0.75)" />
              <stop offset="55%" stopColor="rgba(124,247,212,0.60)" />
              <stop offset="100%" stopColor="rgba(168,120,255,0.55)" />
            </linearGradient>
            <filter id="draxionHeroGlow">
              <feGaussianBlur stdDeviation="2.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M30 100 C 95 18, 160 120, 220 62 S 320 18, 390 68"
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.path
            d="M30 100 C 95 18, 160 120, 220 62 S 320 18, 390 68"
            fill="none"
            stroke="url(#draxionHeroFlow)"
            strokeWidth="2.4"
            strokeLinecap="round"
            filter="url(#draxionHeroGlow)"
            animate={reduced ? { opacity: 0.55 } : { pathLength: [0.15, 1, 0.15], opacity: [0.25, 0.65, 0.25] }}
            transition={reduced ? undefined : { duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          />
          {[
            { x: 30, y: 100, label: dict.marketing.ui.heroSignalsTitle },
            { x: 220, y: 62, label: dict.marketing.ui.heroContextLabel },
            { x: 390, y: 68, label: dict.marketing.ui.heroMessageLabel },
          ].map((n) => (
            <g key={n.label}>
              <circle cx={n.x} cy={n.y} r={12} fill="rgba(255,255,255,0.06)" />
              <circle cx={n.x} cy={n.y} r={6.5} fill="rgba(124,247,212,0.92)" />
              <text x={n.x} y={n.y + 30} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.60)" fontWeight="600">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function ModuleConsole({ dict }: { dict: Dictionary }) {
  const s = dict.marketing.sections;
  const [active, setActive] = React.useState<(typeof FEATURE_KEYS)[number]>("enrichment");

  const modules = FEATURE_KEYS.map((k, idx) => {
    const f = s.features.items[k];
    const Icon = ICONS[idx % ICONS.length];
    return { key: k, title: f.title, text: f.text, Icon };
  });
  const current = modules.find((m) => m.key === active) ?? modules[0];

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(65%_70%_at_50%_0%,rgba(91,140,255,0.28),transparent_62%),radial-gradient(55%_60%_at_70%_90%,rgba(124,247,212,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:92px_92px] [mask-image:radial-gradient(70%_70%_at_50%_40%,black,transparent_68%)]" />

      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-[rgba(255,255,255,0.55)]">{dict.marketing.ui.modulesKicker}</div>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {s.features.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-2)]">{dict.marketing.ui.featuresSubtitle}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-[11px] font-semibold text-[rgba(255,255,255,0.68)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_rgba(124,247,212,0.45)]" />
            {dict.marketing.ui.modulesBadge}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="rounded-[26px] border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.55)] p-4 sm:p-5">
            <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.modulesSelectTitle}</div>
            <div className="mt-3 grid gap-2">
              {modules.map((m) => {
                const isActive = m.key === active;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setActive(m.key)}
                    className={[
                      "group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-[background,border-color,box-shadow] duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      isActive
                        ? "border-[rgba(124,247,212,0.28)] bg-[rgba(124,247,212,0.08)] shadow-[0_0_30px_rgba(124,247,212,0.08)]"
                        : "border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.30)] hover:bg-[rgba(26,31,43,0.45)]",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
                        isActive
                          ? "border-[rgba(124,247,212,0.30)] bg-[rgba(124,247,212,0.10)] text-[var(--accent)]"
                          : "border-[rgba(91,140,255,0.22)] bg-[rgba(91,140,255,0.08)] text-[var(--primary)]",
                      ].join(" ")}
                    >
                      <m.Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold tracking-tight text-white">{m.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-[rgba(255,255,255,0.55)]">{m.text}</div>
                    </div>
                    <div className="ml-auto mt-1 hidden text-[10px] font-semibold text-[rgba(255,255,255,0.45)] sm:block">
                      {isActive ? dict.marketing.ui.modulesActiveLabel : " "}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[26px] border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.55)] p-4 shadow-[0_18px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.07),transparent_65%)] [background-size:220%_100%]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.modulesOutputTitle}</div>
                <div className="text-[10px] font-medium text-[rgba(255,255,255,0.45)]">{dict.marketing.ui.modulesVerifiedPath}</div>
              </div>
              <div className="mt-3 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.55)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white">{current.title}</div>
                    <div className="mt-1 text-sm leading-6 text-[rgba(255,255,255,0.62)]">{current.text}</div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(91,140,255,0.22)] bg-[rgba(91,140,255,0.10)] px-2.5 py-1 text-[10px] font-semibold text-[rgba(255,255,255,0.75)]">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {dict.marketing.ui.modulesLiveLabel}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ConsoleStat label={dict.marketing.ui.modulesConfidence} value="0.82" />
                  <ConsoleStat label={dict.marketing.ui.modulesPersonalizationDepth} value={dict.marketing.ui.modulesHigh} />
                  <ConsoleStat label={dict.marketing.ui.modulesRisk} value={dict.marketing.ui.modulesLow} />
                  <ConsoleStat label={dict.marketing.ui.modulesTimeToDraft} value="~20s" />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-[rgba(255,255,255,0.44)]">
                  No noise. No chaos. Just signal → context → message.
                </div>
                <Link
                  href="/demo"
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-[rgba(124,247,212,0.30)] bg-[rgba(124,247,212,0.08)] px-4 text-sm font-semibold text-white hover:bg-[rgba(124,247,212,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  {dict.nav.demo}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConsoleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.40)] px-3 py-2">
      <div className="text-[10px] font-medium text-[rgba(255,255,255,0.45)]">{label}</div>
      <div className="mt-1 text-xs font-semibold text-white">{value}</div>
    </div>
  );
}

function DemoTeaser({ dict }: { dict: Dictionary }) {
  const d = dict.demo;
  const steps = [d.processing.step1, d.processing.step2, d.processing.step3, d.processing.step4, d.processing.step5, d.processing.step6];
  const [idx, setIdx] = React.useState(0);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % steps.length), 1700);
    return () => window.clearInterval(t);
  }, [prefersReducedMotion, steps.length]);

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.40)] p-6 shadow-[0_34px_160px_rgba(0,0,0,0.60)] backdrop-blur-xl sm:p-10">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(65%_60%_at_50%_0%,rgba(124,247,212,0.16),transparent_64%),radial-gradient(55%_60%_at_70%_90%,rgba(91,140,255,0.20),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background:radial-gradient(50%_50%_at_50%_40%,rgba(255,255,255,0.08),transparent_66%)]" />
      <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="text-xs font-semibold tracking-wide text-[rgba(255,255,255,0.55)]">Public demo</div>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {d.headline}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted-2)]">{d.subheadline}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[rgba(91,140,255,0.18)] px-6 text-sm font-semibold text-white ring-1 ring-[rgba(91,140,255,0.55)] hover:shadow-[0_0_0_1px_rgba(91,140,255,0.35),0_22px_60px_rgba(91,140,255,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {dict.nav.demo}
            </Link>
            <div className="text-xs text-[rgba(255,255,255,0.44)]">{d.disclaimer}</div>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-10 rounded-[40px] bg-[radial-gradient(55%_55%_at_50%_0%,rgba(91,140,255,0.18),transparent_64%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.60)] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold text-white">Run</div>
              <div className="text-[10px] font-medium text-[rgba(255,255,255,0.45)]">~ 25–45s</div>
            </div>
            <div className="mt-4 grid gap-2">
              {steps.map((s, i) => {
                const active = i === idx;
                const done = i < idx;
                return (
                  <div
                    key={s}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-3 py-2.5",
                      active
                        ? "border-[rgba(124,247,212,0.30)] bg-[rgba(124,247,212,0.08)]"
                        : "border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex h-7 w-7 items-center justify-center rounded-xl border text-[11px] font-semibold",
                        done
                          ? "border-[rgba(124,247,212,0.30)] bg-[rgba(124,247,212,0.10)] text-white"
                          : active
                            ? "border-[rgba(91,140,255,0.32)] bg-[rgba(91,140,255,0.12)] text-white"
                            : "border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.35)] text-[rgba(255,255,255,0.55)]",
                      ].join(" ")}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={active ? "text-sm font-semibold text-white" : "text-sm text-[rgba(255,255,255,0.68)]"}>
                      {s}
                    </span>
                    {active && !prefersReducedMotion ? (
                      <motion.span
                        className="ml-auto h-2 w-2 rounded-full bg-[var(--accent)]"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.05, 0.9] }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalSceneCta({ dict }: { dict: Dictionary }) {
  const c = dict.demo.cta;
  return (
    <section className="relative overflow-hidden rounded-[44px] border border-[rgba(255,255,255,0.12)] bg-[rgba(11,15,20,0.38)] p-8 shadow-[0_50px_220px_rgba(0,0,0,0.70)] backdrop-blur-xl sm:p-12">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_35%_0%,rgba(91,140,255,0.28),transparent_62%),radial-gradient(60%_60%_at_70%_100%,rgba(124,247,212,0.18),transparent_60%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[40%] opacity-25 [background:conic-gradient(from_140deg,rgba(91,140,255,0.22),rgba(124,247,212,0.14),rgba(91,140,255,0.18))]"
        animate={{ rotate: [0, 12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:110px_110px] [mask-image:radial-gradient(65%_65%_at_50%_45%,black,transparent_68%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="text-xs font-semibold tracking-wide text-[rgba(255,255,255,0.55)]">
            {dict.marketing.ui.heroFlagshipAccess}
          </div>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {c.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted-2)]">{c.text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Link
            href="/demo"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-[rgba(124,247,212,0.30)] bg-[rgba(124,247,212,0.08)] px-6 text-sm font-semibold text-white hover:bg-[rgba(124,247,212,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {dict.nav.demo}
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[rgba(91,140,255,0.18)] px-6 text-sm font-semibold text-white ring-1 ring-[rgba(91,140,255,0.55)] hover:shadow-[0_0_0_1px_rgba(91,140,255,0.35),0_22px_60px_rgba(91,140,255,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {c.primary}
          </Link>
        </div>
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
    <section className="relative overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.40)] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.50)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_70%_at_30%_0%,rgba(91,140,255,0.22),transparent_62%),radial-gradient(60%_70%_at_70%_100%,rgba(124,247,212,0.14),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:84px_84px] [mask-image:radial-gradient(60%_70%_at_50%_40%,black,transparent_70%)]" />

      <div className="relative grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(0,0,0,0.25)] px-3 py-1.5 text-[11px] font-semibold text-[rgba(255,255,255,0.68)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_14px_rgba(91,140,255,0.45)]" />
            {dict.marketing.ui.heroSignalBackedOutput}
          </div>
          <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {t.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-2)]">{t.subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[t.badge1, t.badge2, t.badge3].map((b) => (
              <span
                key={b}
                className="rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.55)] px-3 py-1.5 text-[11px] font-medium text-[rgba(255,255,255,0.60)]"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <TrustChip label={t.stat1Label} value={t.stat1Value} tint="blue" verifiedLabel={dict.marketing.ui.modulesVerifiedPath} />
          <TrustChip label={t.stat2Label} value={t.stat2Value} tint="teal" verifiedLabel={dict.marketing.ui.modulesVerifiedPath} />
          <TrustChip label={t.stat3Label} value={t.stat3Value} tint="violet" verifiedLabel={dict.marketing.ui.modulesVerifiedPath} />
        </div>
      </div>
    </section>
  );
}

function TrustChip({
  label,
  value,
  tint,
  verifiedLabel,
}: {
  label: string;
  value: string;
  tint: "blue" | "teal" | "violet";
  verifiedLabel: string;
}) {
  const glow =
    tint === "teal"
      ? "rgba(124,247,212,0.24)"
      : tint === "violet"
        ? "rgba(168,120,255,0.20)"
        : "rgba(91,140,255,0.26)";
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.62)] p-4"
    >
      <div className="pointer-events-none absolute -inset-12 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: `radial-gradient(circle,${glow},transparent 60%)` }} />
      <div className="relative">
        <div className="text-[11px] font-medium text-[rgba(255,255,255,0.46)]">{label}</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</div>
        <div className="mt-2 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)]" />
        <div className="mt-2 text-[10px] font-medium text-[rgba(255,255,255,0.44)]">
          {verifiedLabel}
        </div>
      </div>
    </motion.div>
  );
}

function SystemMap({ dict }: { dict: Dictionary }) {
  const s = dict.marketing.sections;
  const [active, setActive] = React.useState<"source" | "enrich" | "compose" | "send">("source");

  const steps = [
    { id: "source" as const, title: s.howItWorks.steps.find.title, hint: s.howItWorks.steps.find.text },
    { id: "enrich" as const, title: s.howItWorks.steps.enrich.title, hint: s.howItWorks.steps.enrich.text },
    { id: "compose" as const, title: s.howItWorks.steps.write.title, hint: s.howItWorks.steps.write.text },
    { id: "send" as const, title: s.howItWorks.steps.send.title, hint: s.howItWorks.steps.send.text },
  ];

  const activeStep = steps.find((x) => x.id === active) ?? steps[0];

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[rgba(255,255,255,0.10)] bg-[rgba(26,31,43,0.38)] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_60%_at_50%_0%,rgba(91,140,255,0.22),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(124,247,212,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(91,140,255,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent_70%)]" />

      <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wide text-[rgba(255,255,255,0.55)]">Draxion System Map</div>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {s.howItWorks.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted-2)]">
            {steps.map((x) => x.title).join(" → ")}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {steps.map((st) => {
              const isActive = st.id === active;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActive(st.id)}
                  className={[
                    "rounded-full px-3 py-1.5 text-[11px] font-semibold transition-[background,color,box-shadow] duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                    isActive
                      ? "border border-[rgba(124,247,212,0.35)] bg-[rgba(124,247,212,0.10)] text-white shadow-[0_0_28px_rgba(124,247,212,0.10)]"
                      : "border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.45)] text-[rgba(255,255,255,0.62)] hover:bg-[rgba(11,15,20,0.60)] hover:text-white",
                  ].join(" ")}
                >
                  {st.title}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.50)] p-4">
            <div className="text-xs font-semibold text-white">{activeStep.title}</div>
            <p className="mt-1 text-sm leading-6 text-[rgba(255,255,255,0.62)]">{activeStep.hint}</p>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-8 rounded-[34px] bg-[radial-gradient(55%_55%_at_50%_0%,rgba(91,140,255,0.18),transparent_64%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[26px] border border-[rgba(255,255,255,0.10)] bg-[rgba(11,15,20,0.55)] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold text-white">{dict.marketing.ui.heroWorkflowLabel}</div>
              <div className="text-[10px] font-medium text-[rgba(255,255,255,0.45)]">{dict.marketing.ui.heroWorkflowChain}</div>
            </div>

            <div className="mt-4">
              <WorkflowGraphic dict={dict} active={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowGraphic({ dict, active }: { dict: Dictionary; active: "source" | "enrich" | "compose" | "send" }) {
  const nodes = [
    { id: "source", x: 78, y: 60, label: dict.marketing.ui.heroSignalsTitle },
    { id: "enrich", x: 190, y: 48, label: dict.marketing.ui.heroEnrichmentTitle },
    { id: "compose", x: 290, y: 86, label: dict.marketing.ui.heroOutreachTitle },
    { id: "send", x: 370, y: 54, label: dict.marketing.ui.productPreview.tabCampaign },
  ] as const;

  const activeIdx = nodes.findIndex((n) => n.id === active);

  return (
    <svg viewBox="0 0 430 120" className="w-full">
      <defs>
        <linearGradient id="draxionFlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(91,140,255,0.65)" />
          <stop offset="55%" stopColor="rgba(124,247,212,0.55)" />
          <stop offset="100%" stopColor="rgba(91,140,255,0.45)" />
        </linearGradient>
        <filter id="draxionGlow">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 14 -7"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M78 60 C 120 18, 168 18, 190 48 S 260 124, 290 86 S 345 18, 370 54"
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <motion.path
        d="M78 60 C 120 18, 168 18, 190 48 S 260 124, 290 86 S 345 18, 370 54"
        fill="none"
        stroke="url(#draxionFlow)"
        strokeWidth="2.2"
        strokeLinecap="round"
        filter="url(#draxionGlow)"
        initial={{ pathLength: 0.18, opacity: 0.25 }}
        animate={{ pathLength: [(activeIdx + 1) / 4, Math.min(1, (activeIdx + 1) / 4 + 0.12)], opacity: [0.25, 0.65, 0.35] }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {nodes.map((n, idx) => {
        const isActive = idx <= activeIdx;
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={12} fill={isActive ? "rgba(124,247,212,0.16)" : "rgba(255,255,255,0.06)"} />
            <circle cx={n.x} cy={n.y} r={6.2} fill={isActive ? "rgba(124,247,212,0.90)" : "rgba(255,255,255,0.18)"} />
            <text x={n.x} y={n.y + 28} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.62)" fontWeight="600">
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
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

// Removed FooterCta + LogoMarquee (template-like SaaS sections).

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

