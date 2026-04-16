"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring } from "framer-motion";

import type { Locale } from "@/lib/i18n/types";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { DraxionMark } from "@/components/brand/draxion-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function MarketingNavbar({
  locale,
  dict,
  current = "home",
}: {
  locale: Locale;
  dict: Dictionary;
  current?: "home" | "demo";
}) {
  const { scrollY } = useScroll();
  const [elevated, setElevated] = React.useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setElevated(y > 16));

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div
          className={[
            "relative mt-4 flex flex-wrap items-center justify-between gap-2 rounded-3xl border px-4 py-3 backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,background-color,border-color] duration-300 sm:flex-nowrap sm:gap-3",
            elevated
              ? "border-[rgba(255,255,255,0.11)] bg-[rgba(11,15,20,0.82)] shadow-[0_12px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(91,140,255,0.06)_inset]"
              : "border-[var(--border)] bg-[rgba(26,31,43,0.44)] shadow-none",
          ].join(" ")}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-55 [background:radial-gradient(80%_120%_at_50%_0%,rgba(91,140,255,0.14),transparent_62%),radial-gradient(60%_90%_at_15%_120%,rgba(124,247,212,0.09),transparent_58%)] [mask-image:radial-gradient(85%_120%_at_50%_30%,rgba(0,0,0,1),rgba(0,0,0,0)_78%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 -bottom-px h-px opacity-55 [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] blur-[0.3px]"
          />
          <Link
            href="/"
            className="group relative z-10 inline-flex items-center gap-3 rounded-2xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <DraxionMark className="h-9 w-9 transition-transform duration-300 group-hover:scale-[1.03]" />
            <span className="text-sm font-semibold tracking-tight text-white transition-colors group-hover:text-[rgba(255,255,255,0.92)]">
              Draxion
            </span>
            <span className="pointer-events-none hidden h-px w-0 bg-[linear-gradient(90deg,transparent,rgba(91,140,255,0.7),transparent)] transition-all duration-300 group-hover:w-8 sm:block" />
          </Link>

          <div className="relative z-10 flex flex-1 flex-wrap items-center justify-end gap-1.5 sm:flex-nowrap sm:gap-2">
            <DemoNavLink href="/demo" label={dict.nav.demo} active={current === "demo"} />
            <LocaleSwitcher locale={locale} surface="glass" />
            <NavLink href="/login" label={dict.nav.login} />
            <PrimaryCta href="/signup" label={dict.nav.signup} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoNavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={[
        "relative inline-flex h-10 shrink-0 items-center justify-center rounded-xl px-3.5 text-sm font-semibold transition-[box-shadow,background,color] duration-200",
        active
          ? "bg-[rgba(124,247,212,0.14)] text-white ring-1 ring-[rgba(124,247,212,0.45)] shadow-[0_0_24px_rgba(124,247,212,0.12)]"
          : "bg-[rgba(124,247,212,0.08)] text-[rgba(255,255,255,0.88)] ring-1 ring-[rgba(124,247,212,0.28)] hover:bg-[rgba(124,247,212,0.14)] hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
      ].join(" ")}
    >
      <span className="relative z-10">{label}</span>
      {!active ? (
        <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 hover:opacity-100 [background:radial-gradient(80%_120%_at_50%_0%,rgba(124,247,212,0.12),transparent_60%)]" />
      ) : null}
    </Link>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative hidden rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-white sm:inline-flex"
    >
      <span className="relative z-10">{label}</span>
      <span className="absolute inset-x-2 -bottom-px h-px origin-left scale-x-0 bg-[linear-gradient(90deg,rgba(91,140,255,0.2),rgba(124,247,212,0.85),rgba(91,140,255,0.2))] transition-transform duration-300 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(80%_120%_at_50%_120%,rgba(91,140,255,0.12),transparent_55%)]" />
    </Link>
  );
}

function PrimaryCta({ href, label }: { href: string; label: string }) {
  return (
    <Magnetic strength={10}>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={href}
          className={[
            "relative inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white",
            "bg-[rgba(91,140,255,0.18)] ring-1 ring-[rgba(91,140,255,0.45)]",
            "transition-[box-shadow,transform] duration-200",
            "hover:shadow-[0_0_0_1px_rgba(91,140,255,0.35),0_12px_30px_rgba(91,140,255,0.22)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          ].join(" ")}
        >
          <span className="relative z-10">{label}</span>
          <span className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(60%_80%_at_50%_0%,rgba(124,247,212,0.22),transparent_55%)]" />
        </Link>
      </motion.div>
    </Magnetic>
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
