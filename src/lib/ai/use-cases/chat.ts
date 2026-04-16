import { z } from "zod";

import { runStructuredJson } from "@/lib/ai/client";
import { normalizeWhitespace } from "@/lib/ai/formatters";

const chatSchema = z.object({
  reply: z.string().min(1).max(3000),
});
export type ChatOutput = z.infer<typeof chatSchema>;

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
  language: z.enum(["et", "en", "ru"]).optional(),
  model: z.string().min(1).optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

const CHAT_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: { reply: { type: "string" } },
  required: ["reply"],
};

export async function runChatUseCase(req: ChatRequest) {
  const model =
    req.model?.trim() ||
    process.env.AI_MESSAGE_MODEL ||
    process.env.AI_MODEL ||
    "gemini-2.0-flash";
  const lang = req.language ?? "en";

  const transcript = req.messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${normalizeWhitespace(m.content)}`)
    .join("\n");

  const prompt = [
    `You are Draxion AI. Respond in ${lang}.`,
    "Be concise, product-minded, and helpful.",
    "Return STRICT JSON matching the provided JSON Schema exactly (no markdown, no extra keys).",
    "",
    "Conversation:",
    transcript,
  ].join("\n");

  const ai = await runStructuredJson({
    model,
    temperature: 0.3,
    maxOutputTokens: 600,
    schemaName: "DraxionChatReply",
    jsonSchema: CHAT_JSON_SCHEMA as any,
    prompt,
    parse: (json) => chatSchema.parse(json),
  });

  return { parsed: ai.parsed, meta: { model: ai.model, usage: ai.usage } };
}

