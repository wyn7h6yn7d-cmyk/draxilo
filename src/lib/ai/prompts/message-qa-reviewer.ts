import type { PromptTemplate } from "@/lib/ai/types";

/**
 * Inputs:
 * - proposed subject/body
 * - constraints and policy reminders
 *
 * Expected output:
 * - STRICT JSON matching messageQaSchema (src/lib/ai/schemas.ts)
 */
export type MessageQaInputs = {
  language: "et" | "en" | "ru";
  subject: string;
  body: string;
  wordLimit: number;
};

export const messageQaPrompt: PromptTemplate<MessageQaInputs> = {
  name: "message_qa_reviewer",
  version: "1.0",
  build(i) {
    const prompt = [
      "You are a strict QA reviewer for B2B outreach copy.",
      "Return STRICT JSON that matches the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      `Language: ${i.language}`,
      `WordLimit: ${i.wordLimit}`,
      "",
      "Check for:",
      "- spamminess (salesy hype, exclamation, urgency, clickbait)",
      "- vagueness / fluff",
      "- unsupported claims",
      "- exceeding word limit",
      "",
      "Email:",
      `Subject: ${i.subject}`,
      "Body:",
      i.body,
    ].join("\n");

    return { prompt };
  },
};

