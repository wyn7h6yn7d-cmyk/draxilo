"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

export function MarketingPageAtmosphere({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useSpring(mouseX, { stiffness: 200, damping: 30, mass: 0.2 });
  const glowY = useSpring(mouseY, { stiffness: 200, damping: 30, mass: 0.2 });
  const glow = useTransform([glowX, glowY], ([x, y]) => `${x}px ${y}px`);
  const softGlowX = useSpring(mouseX, { stiffness: 120, damping: 26, mass: 0.35 });
  const softGlowY = useSpring(mouseY, { stiffness: 120, damping: 26, mass: 0.35 });
  const softGlow = useTransform([softGlowX, softGlowY], ([x, y]) => `${x}px ${y}px`);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  }

  return (
    <div onMouseMove={onMove} className="relative min-h-[calc(100vh-1px)] overflow-hidden">
      <AnimatedBackground glow={glow} />
      <SpotlightReveal glow={glow} />
      <MouseGlow glow={softGlow} />
      {children}
    </div>
  );
}

function AnimatedBackground({ glow }: { glow: MotionValue<string> }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[#0B0F14]" />
      <motion.div
        className="absolute -inset-[40%] opacity-60"
        animate={{ rotate: [0, 12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(35% 30% at 50% 35%, rgba(91,140,255,0.20), transparent 60%), radial-gradient(35% 30% at 65% 55%, rgba(124,247,212,0.14), transparent 60%), radial-gradient(35% 30% at 35% 65%, rgba(91,140,255,0.12), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 opacity-[0.26] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px] [animation:draxion-grid-drift_26s_linear_infinite]" />
      <svg className="absolute inset-0 opacity-[0.05] mix-blend-overlay" aria-hidden="true">
        <filter id="draxionNoiseMarketing">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#draxionNoiseMarketing)" />
      </svg>
      <div className="absolute left-[12%] top-[18%] h-1.5 w-1.5 rounded-full bg-[rgba(124,247,212,0.9)] blur-[0.5px] [animation:draxion-twinkle_2.8s_ease-in-out_infinite]" />
      <div className="absolute left-[62%] top-[22%] h-1 w-1 rounded-full bg-[rgba(91,140,255,0.9)] blur-[0.5px] [animation:draxion-twinkle_3.4s_ease-in-out_infinite]" />
      <div className="absolute left-[78%] top-[64%] h-1.5 w-1.5 rounded-full bg-[rgba(124,247,212,0.85)] blur-[0.5px] [animation:draxion-twinkle_3.1s_ease-in-out_infinite]" />
      <div className="absolute left-[34%] top-[70%] h-1 w-1 rounded-full bg-[rgba(91,140,255,0.85)] blur-[0.5px] [animation:draxion-twinkle_3.8s_ease-in-out_infinite]" />
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
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(260px 260px at var(--g), rgba(91,140,255,0.20), transparent 60%)",
          ["--g" as any]: glow,
        }}
      />
      <div className="absolute inset-0 [background:radial-gradient(80%_70%_at_50%_20%,transparent_0%,rgba(11,15,20,0.45)_55%,rgba(11,15,20,0.85)_100%)]" />
    </div>
  );
}

function SpotlightReveal({ glow }: { glow: MotionValue<string> }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{
        WebkitMaskImage: "radial-gradient(340px 340px at var(--g), rgba(0,0,0,1), rgba(0,0,0,0) 68%)",
        maskImage: "radial-gradient(340px 340px at var(--g), rgba(0,0,0,1), rgba(0,0,0,0) 68%)",
        ["--g" as any]: glow,
      }}
    >
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(124,247,212,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(91,140,255,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="absolute inset-0 opacity-[0.22] [background:radial-gradient(60%_50%_at_50%_40%,rgba(91,140,255,0.22),transparent_60%)]" />
    </motion.div>
  );
}

function MouseGlow({ glow }: { glow: MotionValue<string> }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 opacity-80 mix-blend-screen"
      style={{
        background:
          "radial-gradient(420px 320px at var(--g), rgba(91,140,255,0.20), transparent 62%), radial-gradient(320px 260px at var(--g), rgba(124,247,212,0.10), transparent 60%)",
        ["--g" as any]: glow,
      }}
    />
  );
}
