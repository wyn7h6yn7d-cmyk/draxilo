import * as React from "react";

export function AiErrorState(props: { code?: "ai_unavailable" | "ai_failed" | "validation"; onRetry?: () => void }) {
  const title =
    props.code === "ai_unavailable"
      ? "Draxion AI is unavailable"
      : props.code === "validation"
        ? "Check your input"
        : "Draxion AI request failed";
  const body =
    props.code === "ai_unavailable"
      ? "Draxion AI is not configured on the server yet."
      : props.code === "validation"
        ? "Please adjust the input and try again."
        : "Please try again in a moment.";

  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm">
      <div className="font-semibold text-rose-100">{title}</div>
      <div className="mt-1 text-rose-100/80">{body}</div>
      {props.onRetry ? (
        <button
          type="button"
          onClick={props.onRetry}
          className="mt-3 inline-flex items-center justify-center rounded-xl border border-rose-300/20 bg-rose-200/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-200/15"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

