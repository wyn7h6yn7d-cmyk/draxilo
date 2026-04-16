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

export class GoogleGeminiProvider implements AiProvider {
  readonly id = "google" as const;

  async generateStructured<T>(params: AiGenerateStructuredParams<T>): Promise<AiStructuredResult<T>> {
    const ai = getGoogleClient();

    const response = await ai.models.generateContent({
      model: params.model,
      contents: params.prompt,
      config: {
        temperature: params.temperature,
        maxOutputTokens: params.maxOutputTokens,
        responseMimeType: "application/json",
        responseJsonSchema: params.jsonSchema,
      },
    });

    const rawText = response.text ?? "";
    const json = safeJsonParse(rawText);
    const parsed = params.parse(json);

    return {
      parsed,
      rawText,
      meta: {
        provider: this.id,
        model: params.model,
        usage: extractUsage((response as any).usageMetadata),
      },
    };
  }
}


