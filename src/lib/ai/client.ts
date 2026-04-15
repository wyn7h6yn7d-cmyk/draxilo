import OpenAI from "openai";
import { getEnv } from "@/lib/env";

export function getOpenAIClient() {
  const apiKey = getEnv().server.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

export async function runStructuredJson<T>(params: {
  model: string;
  temperature: number;
  maxOutputTokens: number;
  schemaName: string;
  jsonSchema: Record<string, any>;
  prompt: string;
  parse: (json: unknown) => T;
}) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: params.model,
    temperature: params.temperature,
    max_output_tokens: params.maxOutputTokens,
    input: [{ role: "user", content: [{ type: "input_text", text: params.prompt }] }],
    text: {
      format: {
        type: "json_schema",
        name: params.schemaName,
        schema: params.jsonSchema,
      },
    },
  });

  const rawText = response.output_text;
  const json = JSON.parse(rawText);
  const parsed = params.parse(json);

  return {
    parsed,
    rawText,
    model: response.model,
    usage: response.usage,
  };
}

