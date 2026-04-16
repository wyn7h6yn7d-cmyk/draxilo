import { NextResponse } from "next/server";

import { websiteEnrichmentSchema } from "@/lib/ai/schemas";
import { safeUserFacingErrorCode } from "@/lib/ai/formatters";
import { runAIDemoPipeline } from "@/lib/demo/ai-pipeline";
import type { DemoContinuation, DemoLanguage, DemoRequestBody, DemoTone } from "@/lib/demo/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LANGS = new Set<string>(["et", "en", "ru"]);
const TONES = new Set<string>(["friendly", "direct", "sharp"]);

type CacheEntry = { expiresAt: number; value: unknown };
const demoCache = new Map<string, CacheEntry>();
const DEMO_CACHE_TTL_MS = 10 * 60 * 1000;

function cacheKey(body: DemoRequestBody) {
  // Keep it stable + cheap; continuation already embeds enrichment and should not affect the final output materially.
  return JSON.stringify({
    companyName: body.companyName,
    websiteUrl: body.websiteUrl,
    whatYouSell: body.whatYouSell,
    language: body.language,
    tone: body.tone,
    intent: body.intent,
    variantSalt: body.variantSalt,
  });
}

function parseContinuation(raw: unknown): DemoContinuation | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const parsed = websiteEnrichmentSchema.safeParse(o.enrichment);
  if (!parsed.success) return undefined;
  const fetched = o.fetchedFromUrl;
  return {
    enrichment: parsed.data,
    fetchedFromUrl: typeof fetched === "string" ? fetched : null,
  };
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  const requestId = Math.random().toString(16).slice(2, 10);
  try {
    const raw = (await req.json()) as Partial<DemoRequestBody>;
    const companyName = typeof raw.companyName === "string" ? raw.companyName.trim() : "";
    const websiteUrl = typeof raw.websiteUrl === "string" ? raw.websiteUrl.trim() : "";
    const whatYouSell = typeof raw.whatYouSell === "string" ? raw.whatYouSell.trim() : "";
    const language = LANGS.has(raw.language ?? "") ? (raw.language as DemoLanguage) : "et";
    const tone = TONES.has(raw.tone ?? "") ? (raw.tone as DemoTone) : "direct";
    const variantSalt = typeof raw.variantSalt === "number" && Number.isFinite(raw.variantSalt) ? raw.variantSalt : 0;
    const continuation = parseContinuation(raw.continuation);

    if (companyName.length < 2 || whatYouSell.length < 2) {
      return NextResponse.json({ error: "validation" }, { status: 400 });
    }

    const body: DemoRequestBody = {
      companyName,
      websiteUrl,
      whatYouSell,
      language,
      tone,
      variantSalt,
      intent: raw.intent === "regenerate_email" ? "regenerate_email" : "full",
      continuation,
    };

    const hasAiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
    if (!hasAiKey) {
      console.warn(`[demo][${requestId}] AI unavailable (missing key)`);
      return NextResponse.json({ error: "ai_unavailable", requestId }, { status: 503, headers: { "x-request-id": requestId } });
    }

    try {
      const key = cacheKey(body);
      const cached = demoCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        console.info(`[demo][${requestId}] cache_hit`);
        return NextResponse.json(cached.value, { headers: { "x-request-id": requestId, "x-cache": "hit" } });
      }

      const result = await runAIDemoPipeline(body);
      demoCache.set(key, { value: result, expiresAt: Date.now() + DEMO_CACHE_TTL_MS });
      console.info(`[demo][${requestId}] ok in ${Date.now() - startedAt}ms`);
      return NextResponse.json(result, { headers: { "x-request-id": requestId } });
    } catch (e) {
      const code = safeUserFacingErrorCode(e);
      console.error(`[demo][${requestId}] ${code} in ${Date.now() - startedAt}ms`, e);
      return NextResponse.json(
        { error: code, requestId },
        { status: code === "ai_unavailable" ? 503 : 502, headers: { "x-request-id": requestId } },
      );
    }
  } catch {
    console.warn(`[demo][${requestId}] bad_request in ${Date.now() - startedAt}ms`);
    return NextResponse.json({ error: "bad_request", requestId }, { status: 400, headers: { "x-request-id": requestId } });
  }
}
