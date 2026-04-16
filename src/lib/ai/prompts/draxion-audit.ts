import type { PromptTemplate } from "@/lib/ai/types";

export type DraxionAuditInputs = {
  language: "et" | "en" | "ru";
  companyName: string;
  websiteUrl?: string | null;
  whatYouSell: string;
  websiteText?: string | null;
};

/**
 * AI Studio-friendly: paste the built prompt + schema to iterate quickly.
 * Runtime: always request STRICT JSON matching the schema.
 */
export const draxionAuditPrompt: PromptTemplate<DraxionAuditInputs> = {
  name: "draxion_audit",
  version: "1.0",
  build(i) {
    const lang = i.language;
    const sys =
      lang === "et"
        ? "Sa oled Draxioni AI-assistent. Tee kiire B2B müügi- ja veebiaudit."
        : lang === "ru"
          ? "Ты AI-ассистент Draxion. Сделай быстрый B2B аудит продаж и сайта."
          : "You are Draxion’s AI assistant. Produce a fast B2B sales + website audit.";

    const prompt = [
      sys,
      "Return STRICT JSON matching the provided JSON Schema exactly (no markdown, no extra keys).",
      "",
      "Constraints:",
      "- Be concise and specific.",
      "- Do not invent facts. If the website text is missing, rely only on the form inputs and lower confidence.",
      "",
      `CompanyName: ${i.companyName}`,
      `WebsiteUrl: ${i.websiteUrl ?? ""}`,
      `WhatTheySell: ${i.whatYouSell}`,
      "",
      "WebsiteText (optional):",
      i.websiteText ?? "",
    ].join("\n");

    return { prompt };
  },
};

