import { GoogleGenAI } from "@google/genai";

import { getEnv } from "@/lib/env";
import type { AiProvider, AiGenerateStructuredParams, AiStructuredResult, AiUsage } from "@/lib/ai/providers/types";

function getGoogleClient() {
  const apiKey = getEnv().server.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  return new GoogleGenAI({ apiKey });
}

function extractUsage(usage: any): AiUsage | undefined {
  if (!usage || typeof usage !== "object") return undefined;
  const inputTokens = typeof usage.promptTokenCount === "number" ? usage.promptTokenCount : undefined;
  const outputTokens = typeof usage.candidatesTokenCount === "number" ? usage.candidatesTokenCount : undefined;
  const totalTokens = typeof usage.totalTokenCount === "number" ? usage.totalTokenCount : undefined;
  if (inputTokens == null && outputTokens == null && totalTokens == null) return undefined;
  return { inputTokens, outputTokens, totalTokens };
}

function safeJsonParse(raw: string): unknown {
  // JSON mode should return clean JSON, but be defensive for transient model hiccups.
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(trimmed.slice(first, last + 1));
    }
    throw new Error("AI output was not valid JSON");
  }
}

function coerceResponseText(response: any): string {
  // @google/genai responses differ by version:
  // - sometimes `text` is a string
  // - sometimes `text()` is a function returning string
  // - sometimes text is nested in candidates/parts
  try {
    const t = response?.text;
    if (typeof t === "string") return t;
    if (typeof t === "function") {
      const out = t.call(response);
      if (typeof out === "string") return out;
    }
  } catch {
    // fall through to candidates parsing
  }

  const candidates = Array.isArray(response?.candidates) ? response.candidates : [];
  for (const c of candidates) {
    const parts = c?.content?.parts;
    if (!Array.isArray(parts)) continue;
    const text = parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("");
    if (text.trim()) return text;
  }

  return "";
}

function snippet(s: string, max = 240) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export class GoogleGeminiProvider implements AiProvider {
  readonly id = "google" as const;

  async generateStructured<T>(params: AiGenerateStructuredParams<T>): Promise<AiStructuredResult<T>> {
    const ai = getGoogleClient();
    const fallbackModel = "gemini-2.0-flash";

    async function call(model: string) {
      return await ai.models.generateContent({
        model,
        contents: params.prompt,
        config: {
          temperature: params.temperature,
          maxOutputTokens: params.maxOutputTokens,
          responseMimeType: "application/json",
          responseJsonSchema: params.jsonSchema,
        },
      });
    }

    let response: Awaited<ReturnType<typeof call>>;
    let usedModel = params.model;
    try {
      response = await call(params.model);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // Common auth-style failures.
      if (/401|403|unauthorized|permission denied|API key|invalid key|forbidden/i.test(msg)) {
        throw new Error(`AI_AUTH: ${msg}`);
      }
      // If a model is misconfigured in env (common on Vercel), fall back once.
      const isModelProblem = /model|not found|invalid argument|unknown model|does not exist/i.test(msg);
      if (isModelProblem && params.model !== fallbackModel) {
        usedModel = fallbackModel;
        response = await call(fallbackModel);
      } else {
        throw e;
      }
    }

    const rawText = coerceResponseText(response);
    if (!rawText.trim()) throw new Error(`AI output was empty (model=${usedModel})`);

    let json: unknown;
    try {
      json = safeJsonParse(rawText);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`AI_JSON_PARSE: ${msg} (model=${usedModel}, raw="${snippet(rawText)}")`);
    }

    let parsed: T;
    try {
      parsed = params.parse(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`AI_SCHEMA_PARSE: ${msg} (model=${usedModel}, raw="${snippet(rawText)}")`);
    }

    return {
      parsed,
      rawText,
      meta: {
        provider: this.id,
        model: usedModel,
        usage: extractUsage((response as any).usageMetadata),
      },
    };
  }
}


