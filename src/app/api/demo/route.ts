import { NextResponse } from "next/server";

import { websiteEnrichmentSchema } from "@/lib/ai/schemas";
import { runOpenAIDemoPipeline } from "@/lib/demo/openai-pipeline";
import type { DemoContinuation, DemoLanguage, DemoRequestBody, DemoTone } from "@/lib/demo/types";

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

    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());
    if (!hasOpenAI) {
      return NextResponse.json({ error: "openai_unconfigured" }, { status: 503 });
    }

    try {
      const result = await runOpenAIDemoPipeline(body);
      return NextResponse.json(result);
    } catch (e) {
      console.error("[demo] OpenAI pipeline failed", e);
      return NextResponse.json({ error: "ai_failed" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
