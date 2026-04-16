export const WEBSITE_ENRICHMENT_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    companySummary: { type: "string" },
    likelyIndustry: { type: "string" },
    likelyServicesOrProducts: { type: "array", items: { type: "string" } },
    targetAudience: { type: "array", items: { type: "string" } },
    possiblePainPoints: { type: "array", items: { type: "string" } },
    websiteLanguages: {
      type: "array",
      items: { type: "string", enum: ["et", "en", "ru"] },
      minItems: 1,
      maxItems: 3,
    },
    locationClues: { type: "array", items: { type: "string" } },
    contactPageUrl: { anyOf: [{ type: "string" }, { type: "null" }] },
    pricingPageUrl: { anyOf: [{ type: "string" }, { type: "null" }] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: [
    "companySummary",
    "likelyIndustry",
    "likelyServicesOrProducts",
    "targetAudience",
    "possiblePainPoints",
    "websiteLanguages",
    "locationClues",
    "contactPageUrl",
    "pricingPageUrl",
    "confidence",
  ],
};

export const OUTREACH_SUBJECT_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    languageUsed: { type: "string", enum: ["et", "en", "ru"] },
    subject: { type: "string" },
    rationale: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["languageUsed", "subject", "rationale", "confidence"],
};

export const OUTREACH_BODY_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    languageUsed: { type: "string", enum: ["et", "en", "ru"] },
    body: { type: "string" },
    personalizationRationale: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["languageUsed", "body", "personalizationRationale", "confidence"],
};

export const LEAD_SCORE_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    tier: { type: "string", enum: ["A", "B", "C", "D"] },
    reasons: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["score", "tier", "reasons", "confidence"],
};

export const DRAXION_AUDIT_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    quickWins: { type: "array", items: { type: "string" } },
    recommendedNextSteps: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["headline", "summary", "strengths", "risks", "quickWins", "recommendedNextSteps", "confidence"],
};

export const DRAXION_LEAD_ANALYSIS_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    tier: { type: "string", enum: ["A", "B", "C", "D"] },
    reasons: { type: "array", items: { type: "string" } },
    objections: { type: "array", items: { type: "string" } },
    bestAngle: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["score", "tier", "reasons", "objections", "bestAngle", "confidence"],
};

