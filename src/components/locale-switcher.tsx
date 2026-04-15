"use client";

import * as React from "react";

import { setLocaleAction } from "@/app/actions/locale";
import { LOCALES, type Locale } from "@/lib/i18n/types";

export function LocaleSwitcher({
  locale,
}: {
  locale: Locale;
}) {
  const [pending, startTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function pick(next: Locale) {
    const fd = new FormData();
    fd.set("locale", next);
    startTransition(async () => {
      await setLocaleAction(fd);
      setOpen(false);
    });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className={[
          "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium",
          "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
          "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600",
          "disabled:opacity-60",
        ].join(" ")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Language"
      >
        <span className="text-xs font-semibold tracking-wide">{locale.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Language menu"
          className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          {LOCALES.map((l) => {
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                role="menuitem"
                onClick={() => pick(l)}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm",
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
                ].join(" ")}
              >
                <span className="font-medium">{l.toUpperCase()}</span>
                {active ? (
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M16 6l-7.5 8L4 9.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="h-3.5 w-3.5" />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

