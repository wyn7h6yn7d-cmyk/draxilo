/* eslint-disable @next/next/no-img-element */
import * as React from "react";

import { AiErrorState } from "@/components/ai/error-state";
import { AiLoadingState } from "@/components/ai/loading-state";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AiChatPanel(props: { initialMessages?: ChatMessage[]; language?: "et" | "en" | "ru" }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(props.initialMessages ?? []);
  const [draft, setDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<"ai_unavailable" | "ai_failed" | "validation" | null>(null);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setErr(null);
    setBusy(true);
    const next = [...messages, { role: "user", content: text } as const];
    setMessages(next);
    setDraft("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, language: props.language ?? "en" }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json?.ok) {
        setErr(json?.error ?? "ai_failed");
        return;
      }
      setMessages([...next, { role: "assistant", content: json.data.reply }]);
    } catch {
      setErr("ai_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white/90">Draxion AI</div>
          <div className="text-xs text-white/60">Provider-neutral assistant panel</div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
            Ask anything about lead outreach, messaging, or enrichment.
          </div>
        ) : null}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50"
                : "mr-auto max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85"
            }
          >
            {m.content}
          </div>
        ))}

        {busy ? <AiLoadingState label="Generating reply…" /> : null}
        {err ? <AiErrorState code={err} onRetry={() => send()} /> : null}
      </div>

      <div className="mt-4 flex items-end gap-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder="Type your message…"
          className="min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-cyan-300/30"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy || draft.trim().length === 0}
          className="inline-flex h-[44px] items-center justify-center rounded-2xl bg-cyan-300/90 px-4 text-sm font-semibold text-black transition disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}

