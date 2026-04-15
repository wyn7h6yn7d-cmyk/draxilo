import * as React from "react";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  title?: string;
};

export function DraxiloMark({ className, title = "Draxilo" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("h-9 w-9", className)}
    >
      <rect width="56" height="56" rx="14" fill="#0B0F14" />
      <g transform="translate(4 4)">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#0B0F14" />
        <path
          d="M18 14V34H26.5C32.3 34 36 29.9 36 24C36 18.1 32.3 14 26.5 14H18Z"
          fill="none"
          stroke="#5B8CFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 18H26.1C29.4 18 31.6 20.3 31.6 24C31.6 27.7 29.4 30 26.1 30H23"
          fill="none"
          stroke="#5B8CFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function DraxiloLogo({ className, title = "Draxilo" }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)} aria-label={title}>
      <DraxiloMark className="h-9 w-9" />
      <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Draxilo
      </span>
    </div>
  );
}

