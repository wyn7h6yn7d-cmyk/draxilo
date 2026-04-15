"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Zap, Radar, Sparkles, Send, Shield, Layers } from "lucide-react";

import type { Locale } from "@/lib/i18n/types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { DraxiloMark } from "@/components/brand/draxilo-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";

const ICONS = [Radar, Layers, Sparkles, Zap, Send, Shield] as const;

export function FutureLanding({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useSpring(mouseX, { stiffness: 200, damping: 30, mass: 0.2 });
  const glowY = useSpring(mouseY, { stiffness: 200, damping: 30, mass: 0.2 });
  const glow = useTransform([glowX, glowY], ([x, y]) => `${x}px ${y}px`);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  }

  const s = dict.marketing.sections;

  return (
    <div onMouseMove={onMove} className="relative min-h-[calc(100vh-1px)] overflow-hidden">
      <AnimatedBackground glow={glow} />

      <Navbar locale={locale} dict={dict} />

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-24">
        <Hero dict={dict} />

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(s.features.items).map((f, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            return <FeatureCard key={f.title} title={f.title} text={f.text} Icon={Icon} />;
          })}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2 lg:items-start">
          <HowItWorks dict={dict} />
          <DashboardPreview />
        </section>

        <section className="mt-16 rounded-3xl border border-[var(--border)] bg-[rgba(26,31,43,0.65)] p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{s.multilingual.title}</h2>
              <p className="mt-1 text-sm text-[var(--muted-2)]">{s.multilingual.text}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(11,15,20,0.6)] px-3 py-2 text-xs text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              ET / EN / RU
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-3">
            <Bullet text={s.multilingual.bullets.ui} />
            <Bullet text={s.multilingual.bullets.outreach} />
            <Bullet text={s.multilingual.bullets.defaults} />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-lg font-semibold tracking-tight">{s.faq.title}</h2>
          <div className="mt-4 grid gap-3">
            <Faq q={s.faq.items.dataSources.q} a={s.faq.items.dataSources.a} />
            <Faq q={s.faq.items.deliverability.q} a={s.faq.items.deliverability.a} />
            <Faq q={s.faq.items.languages.q} a={s.faq.items.languages.a} />
            <Faq q={s.faq.items.security.q} a={s.faq.items.security.a} />
            <Faq q={s.faq.items.pricing.q} a={s.faq.items.pricing.a} />
          </div>
        </section>

        <FooterCta dict={dict} />
      </main>
    </div>
  );
}

function Navbar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[rgba(11,15,20,0.6)] px-3 py-3 backdrop-blur-xl">
          <Link href="/" className="group inline-flex items-center gap-3 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
            <DraxiloMark className="h-9 w-9" />
            <span className="text-sm font-semibold tracking-tight text-white">Draxilo</span>
          </Link>

          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} />
            <NavLink href="/login" label={dict.nav.login} />
            <PrimaryCta href="/signup" label={dict.nav.signup} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative hidden rounded-xl px-3 py-2 text-sm text-[var(--muted)] hover:text-white sm:inline-flex"
    >
      <span>{label}</span>
      <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-[var(--primary)] transition-transform duration-200 group-hover:scale-x-100" />
    </Link>
  );
}

function PrimaryCta({ href, label }: { href: string; label: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={[
          "relative inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white",
          "bg-[rgba(91,140,255,0.18)] ring-1 ring-[rgba(91,140,255,0.45)]",
          "transition-[box-shadow,transform] duration-200",
          "hover:shadow-[0_0_0_1px_rgba(91,140,255,0.35),0_12px_30px_rgba(91,140,255,0.20)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
        ].join(" ")}
      >
        <span className="relative z-10">{label}</span>
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(60%_80%_at_50%_0%,rgba(124,247,212,0.22),transparent_55%)]" />
      </Link>
    </motion.div>
  );
}

function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        className="max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(26,31,43,0.55)] px-3 py-2 text-xs text-[var(--muted)] backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          AI lead discovery → enrichment → outreach → campaigns
        </div>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          {dict.marketing.headline}
        </h1>
        <p className="mt-4 text-pretty text-lg leading-7 text-[var(--muted-2)]">
          {dict.marketing.subheadline}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <GlowButton href="/signup" label={dict.nav.signup} />
          <GhostButton href="/login" label={dict.nav.login} />
        </div>
      </motion.div>
    </section>
  );
}

function GlowButton({ href, label }: { href: string; label: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={[
          "group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-2xl px-6 text-sm font-semibold text-white",
          "bg-[rgba(91,140,255,0.16)] ring-1 ring-[rgba(91,140,255,0.55)]",
          "transition-[box-shadow,transform] duration-200",
          "hover:shadow-[0_0_0_1px_rgba(91,140,255,0.35),0_18px_44px_rgba(91,140,255,0.25)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
        ].join(" ")}
      >
        <span className="relative z-10">{label}</span>
        <span className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(80%_60%_at_50%_0%,rgba(124,247,212,0.20),transparent_60%)]" />
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-16 opacity-0 [background:radial-gradient(circle,rgba(124,247,212,0.18),transparent_55%)]"
          animate={{ opacity: [0, 0.55, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </Link>
    </motion.div>
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
}: {
  title: string;
  text: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative rounded-3xl border border-[var(--border)] bg-[rgba(26,31,43,0.55)] p-6 backdrop-blur"
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 [background:radial-gradient(80%_60%_at_20%_0%,rgba(91,140,255,0.18),transparent_55%)]" />
      <div className="relative">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(91,140,255,0.35)] bg-[rgba(91,140,255,0.10)] text-[var(--primary)]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-4 text-sm font-semibold tracking-tight text-white">{title}</div>
        <div className="mt-2 text-sm leading-6 text-[var(--muted-2)]">{text}</div>
      </div>
    </motion.div>
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
      <div className="mt-4 grid gap-3">
        {items.map((x, idx) => (
          <motion.div
            key={x.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
            className="rounded-2xl border border-[var(--border)] bg-[rgba(11,15,20,0.55)] p-4"
          >
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
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[rgba(26,31,43,0.45)] p-6 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(90%_80%_at_80%_0%,rgba(91,140,255,0.14),transparent_55%)]" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Dashboard</div>
          <div className="rounded-full border border-[var(--border)] bg-[rgba(11,15,20,0.55)] px-3 py-1 text-xs text-[var(--muted)]">
            Live
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniKpi label="Leads" value="1,248" />
          <MiniKpi label="Enriched" value="812" />
          <MiniKpi label="Reply rate" value="6.4%" />
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[rgba(11,15,20,0.55)] p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Pipeline</div>
            <div className="text-xs text-[var(--muted-2)]">last 7 days</div>
          </div>
          <div className="mt-3 grid gap-2">
            <ShimmerBar w="72%" />
            <ShimmerBar w="58%" />
            <ShimmerBar w="84%" />
            <ShimmerBar w="46%" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="rounded-2xl border border-[var(--border)] bg-[rgba(11,15,20,0.55)] p-4"
    >
      <div className="text-xs text-[var(--muted-2)]">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight text-white">{value}</div>
    </motion.div>
  );
}

function ShimmerBar({ w }: { w: string }) {
  return (
    <div className="h-3 w-full rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)]">
      <div
        className="h-full rounded-full [background:linear-gradient(90deg,rgba(91,140,255,0.15),rgba(124,247,212,0.18),rgba(91,140,255,0.15))] [background-size:200%_100%] [animation:draxilo-shimmer_2.6s_linear_infinite]"
        style={{ width: w }}
      />
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
        <div className="hidden sm:block">Built for fast outbound teams.</div>
      </div>
    </section>
  );
}

function AnimatedBackground({ glow }: { glow: any }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[#0B0F14]" />

      {/* moving gradient field */}
      <motion.div
        className="absolute -inset-[40%] opacity-60"
        animate={{ rotate: [0, 12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(35% 30% at 50% 35%, rgba(91,140,255,0.20), transparent 60%), radial-gradient(35% 30% at 65% 55%, rgba(124,247,212,0.14), transparent 60%), radial-gradient(35% 30% at 35% 65%, rgba(91,140,255,0.12), transparent 60%)",
        }}
      />

      {/* subtle data lines */}
      <motion.svg
        className="absolute inset-0 opacity-[0.20]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d="M-50 650 C 250 520, 450 720, 760 560 S 1180 540, 1260 420"
          fill="none"
          stroke="rgba(91,140,255,0.55)"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{ pathLength: [0.15, 1, 0.15], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M-60 300 C 220 180, 520 380, 760 240 S 1120 200, 1260 130"
          fill="none"
          stroke="rgba(124,247,212,0.45)"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{ pathLength: [0.1, 1, 0.1], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </motion.svg>

      {/* mouse-follow glow */}
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(260px 260px at var(--g), rgba(91,140,255,0.20), transparent 60%)",
          ["--g" as any]: glow,
        }}
      />

      {/* vignette */}
      <div className="absolute inset-0 [background:radial-gradient(80%_70%_at_50%_20%,transparent_0%,rgba(11,15,20,0.45)_55%,rgba(11,15,20,0.85)_100%)]" />
    </div>
  );
}

