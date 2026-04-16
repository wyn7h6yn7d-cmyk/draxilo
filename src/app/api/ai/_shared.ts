import { NextResponse } from "next/server";
import type { z } from "zod";

import { safeUserFacingErrorCode } from "@/lib/ai/formatters";

export type AiRouteTag = "chat" | "audit" | "lead-analysis" | "generate";

export async function handleAiPost<TSchema extends z.ZodTypeAny>(params: {
  tag: AiRouteTag;
  req: Request;
  schema: TSchema;
  run: (data: z.infer<TSchema>) => Promise<{ parsed: any; meta?: any }>;
}) {
  const startedAt = Date.now();
  const requestId = Math.random().toString(16).slice(2, 10);
  const prefix = `ai.${params.tag}`;

  try {
    if (!process.env.GEMINI_API_KEY?.trim()) {
      console.warn(`[${prefix}][${requestId}] ai_unavailable (missing key)`);
      return NextResponse.json({ ok: false, error: "ai_unavailable" }, { status: 503 });
    }

    const raw = await params.req.json();
    const parsed = params.schema.safeParse(raw);
    if (!parsed.success) {
      console.warn(`[${prefix}][${requestId}] validation_error in ${Date.now() - startedAt}ms`);
      return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
    }

    try {
      const result = await params.run(parsed.data);
      console.info(`[${prefix}][${requestId}] ok in ${Date.now() - startedAt}ms`);
      return NextResponse.json({ ok: true, data: result.parsed, meta: result.meta });
    } catch (e) {
      const code = safeUserFacingErrorCode(e);
      console.error(`[${prefix}][${requestId}] ${code} in ${Date.now() - startedAt}ms`, e);
      return NextResponse.json({ ok: false, error: code }, { status: code === "ai_unavailable" ? 503 : 502 });
    }
  } catch {
    console.warn(`[${prefix}][${requestId}] bad_request in ${Date.now() - startedAt}ms`);
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
}

