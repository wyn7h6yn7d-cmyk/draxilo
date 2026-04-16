import * as React from "react";

export function AiLoadingState(props: { label?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
      <div className="flex items-center gap-3">
        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300/80" />
        <div className="font-medium text-white/80">{props.label ?? "Thinking…"}</div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-4/6 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-3/6 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

