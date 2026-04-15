import { describe, expect, it } from "vitest";

import { outreachBodyPrompt } from "@/lib/ai/prompts/outreach-body-generation";

describe("outreachBodyPrompt", () => {
  it("includes key controls and inputs", () => {
    const { prompt } = outreachBodyPrompt.build({
      language: "en",
      style: "COLD_INTRO",
      tone: "DIRECT",
      length: "SHORT",
      wordLimit: 120,
      workspaceBusinessName: "Draxilo",
      whatYouSell: "AI outreach",
      callToAction: "book a quick call",
      companyName: "Acme",
      domain: "acme.com",
      companySummary: "B2B SaaS",
      painPoints: ["pipeline"],
      evidenceConfidence: 0.6,
      customInstruction: "Avoid exclamation marks.",
    });

    expect(prompt).toContain("Language: en");
    expect(prompt).toContain("Style: COLD_INTRO");
    expect(prompt).toContain("Tone: DIRECT");
    expect(prompt).toContain("hard body limit: 120 words");
    expect(prompt).toContain("CompanyName: Acme");
    expect(prompt).toContain("CustomInstruction: Avoid exclamation marks.");
  });
});

