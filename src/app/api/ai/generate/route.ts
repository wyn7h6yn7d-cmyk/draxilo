import { NextResponse } from "next/server";

import { aiGenerateRequestSchema, runAiGenerateUseCase } from "@/lib/ai/use-cases/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type CacheEntry = { createdAt: number; response: any };
const DEDUPE_TTL_MS = 30_000;
const dedupe = new Map<string, CacheEntry>();

function dedupeGet(key: string) {
  const now = Date.now();
  const hit = dedupe.get(key);
  if (!hit) return null;
  if (now - hit.createdAt > DEDUPE_TTL_MS) {
    dedupe.delete(key);
    return null;
  }
  return hit.response;
}

function dedupeSet(key: string, response: any) {
  dedupe.set(key, { createdAt: Date.now(), response });
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  const requestId = Math.random().toString(16).slice(2, 10);

  try {
    if (!process.env.GEMINI_API_KEY?.trim()) {
      console.warn(`[ai.generate][${requestId}] ai_unavailable (missing key)`);
      return NextResponse.json({ ok: false, error: "ai_unavailable" }, { status: 503 });
    }

    const raw = await req.json();
    const parsed = aiGenerateRequestSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn(`[ai.generate][${requestId}] validation_error in ${Date.now() - startedAt}ms`);
      return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
    }

    const dedupeKey = parsed.data.dedupeKey?.trim();
    if (dedupeKey) {
      const cached = dedupeGet(dedupeKey);
      if (cached) {
        console.info(`[ai.generate][${requestId}] deduped in ${Date.now() - startedAt}ms`);
        return NextResponse.json(cached);
      }
    }

    try {
      const result = await runAiGenerateUseCase(parsed.data);
      if (dedupeKey && result.ok) dedupeSet(dedupeKey, result);
      console.info(`[ai.generate][${requestId}] ok in ${Date.now() - startedAt}ms`);
      return NextResponse.json(result);
    } catch (e) {
      console.error(`[ai.generate][${requestId}] ai_failed in ${Date.now() - startedAt}ms`, e);
      return NextResponse.json({ ok: false, error: "ai_failed" }, { status: 502 });
    }
  } catch {
    console.warn(`[ai.generate][${requestId}] bad_request in ${Date.now() - startedAt}ms`);
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
}

