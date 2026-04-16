import { generateStructuredJson } from "@/lib/ai/service";

export async function runStructuredJson<T>(params: {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  schemaName: string;
  jsonSchema: Record<string, any>;
  prompt: string;
  parse: (json: unknown) => T;
}) {
  const result = await generateStructuredJson(params);
  return {
    parsed: result.parsed,
    rawText: result.rawText,
    model: result.meta.model,
    usage: result.meta.usage
      ? {
          input_tokens: result.meta.usage.inputTokens ?? undefined,
          output_tokens: result.meta.usage.outputTokens ?? undefined,
          total_tokens: result.meta.usage.totalTokens ?? undefined,
        }
      : undefined,
  };
}

