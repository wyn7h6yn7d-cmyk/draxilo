import { NextResponse } from "next/server";

import { websiteEnrichmentSchema } from "@/lib/ai/schemas";
import { runOpenAIDemoPipeline } from "@/lib/demo/openai-pipeline";
import type { DemoContinuation, DemoLanguage, DemoRequestBody, DemoTone } from "@/lib/demo/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LANGS = new Set<string>(["et", "en", "ru"]);
const TONES = new Set<string>(["friendly", "direct", "sharp"]);

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

    const hasAiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
    if (!hasAiKey) {
      console.warn(`[demo][${requestId}] AI unavailable (missing key)`);
      return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
    }

    try {
      const result = await runOpenAIDemoPipeline(body);
      console.info(`[demo][${requestId}] ok in ${Date.now() - startedAt}ms`);
      return NextResponse.json(result);
    } catch (e) {
      console.error(`[demo][${requestId}] ai_failed in ${Date.now() - startedAt}ms`, e);
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
  } catch {
    console.warn(`[demo][${requestId}] bad_request in ${Date.now() - startedAt}ms`);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
