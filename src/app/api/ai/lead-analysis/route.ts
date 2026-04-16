import { NextResponse } from "next/server";

import { leadAnalysisRequestSchema, runLeadAnalysisUseCase } from "@/lib/ai/use-cases/lead-analysis";
import { safeUserFacingErrorCode } from "@/lib/ai/formatters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const startedAt = Date.now();
  const requestId = Math.random().toString(16).slice(2, 10);

  try {
    if (!process.env.GEMINI_API_KEY?.trim()) {
      console.warn(`[ai.lead-analysis][${requestId}] ai_unavailable (missing key)`);
      return NextResponse.json({ ok: false, error: "ai_unavailable" }, { status: 503 });
    }

    const raw = await req.json();
    const parsed = leadAnalysisRequestSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn(`[ai.lead-analysis][${requestId}] validation_error in ${Date.now() - startedAt}ms`);
      return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
    }

    try {
      const result = await runLeadAnalysisUseCase(parsed.data);
      console.info(`[ai.lead-analysis][${requestId}] ok in ${Date.now() - startedAt}ms`);
      return NextResponse.json({ ok: true, data: result.parsed, meta: result.meta });
    } catch (e) {
      const code = safeUserFacingErrorCode(e);
      console.error(`[ai.lead-analysis][${requestId}] ${code} in ${Date.now() - startedAt}ms`, e);
      return NextResponse.json({ ok: false, error: code }, { status: code === "ai_unavailable" ? 503 : 502 });
    }
  } catch {
    console.warn(`[ai.lead-analysis][${requestId}] bad_request in ${Date.now() - startedAt}ms`);
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
}

