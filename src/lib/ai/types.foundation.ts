import { z } from "zod";

export const draxionLocaleSchema = z.enum(["et", "en", "ru"]);
export type DraxionLocale = z.infer<typeof draxionLocaleSchema>;

export type ApiOk<T> = { ok: true; data: T; meta?: { model?: string; usage?: any } };
export type ApiErr = { ok: false; error: "validation" | "ai_unavailable" | "ai_failed" };

export type ChatMessage = { role: "user" | "assistant"; content: string };

