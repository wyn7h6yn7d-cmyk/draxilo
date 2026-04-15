import { z } from "zod";

import { LOCALES } from "@/lib/i18n/types";

const localeEnum = z.enum(LOCALES);

// 1) Website enrichment extraction / analysis (structured)
export const websiteEnrichmentSchema = z.object({
  companySummary: z.string().min(1).max(800),
  likelyIndustry: z.string().min(1).max(120),
  likelyServicesOrProducts: z.array(z.string().min(1).max(120)).max(25),
  targetAudience: z.array(z.string().min(1).max(120)).max(25),
  possiblePainPoints: z.array(z.string().min(1).max(160)).max(25),
  websiteLanguages: z.array(localeEnum).min(1).max(3),
  locationClues: z.array(z.string().min(1).max(120)).max(10),
  contactPageUrl: z.string().url().nullable(),
  pricingPageUrl: z.string().url().nullable(),
  confidence: z.number().min(0).max(1),
});
export type WebsiteEnrichment = z.infer<typeof websiteEnrichmentSchema>;

// 2) Company summary structuring (useful when you have fragmented notes)
export const companySummarySchema = z.object({
  summary: z.string().min(1).max(900),
  industry: z.string().min(1).max(120),
  productsOrServices: z.array(z.string().min(1).max(120)).max(25),
  audience: z.array(z.string().min(1).max(120)).max(25),
  differentiation: z.array(z.string().min(1).max(160)).max(10),
  confidence: z.number().min(0).max(1),
});
export type CompanySummary = z.infer<typeof companySummarySchema>;

// Shared message enums (internal; channel is EMAIL for now)
export const messageToneSchema = z.enum(["FRIENDLY", "DIRECT", "SHARP"]);
export const messageLengthSchema = z.enum(["SHORT", "MEDIUM"]);
export const messageStyleSchema = z.enum(["COLD_INTRO", "QUICK_AUDIT", "FOLLOW_UP"]);
export const messageChannelSchema = z.enum(["EMAIL", "LINKEDIN", "WHATSAPP"]);

// 3-5) Outreach message generation outputs
export const outreachSubjectSchema = z.object({
  languageUsed: localeEnum,
  subject: z.string().min(1).max(120),
  rationale: z.array(z.string().min(1).max(180)).max(8),
  confidence: z.number().min(0).max(1),
});
export type OutreachSubject = z.infer<typeof outreachSubjectSchema>;

export const outreachBodySchema = z.object({
  languageUsed: localeEnum,
  body: z.string().min(1).max(4000),
  personalizationRationale: z.array(z.string().min(1).max(180)).max(12),
  confidence: z.number().min(0).max(1),
});
export type OutreachBody = z.infer<typeof outreachBodySchema>;

export const followUpSchema = z.object({
  languageUsed: localeEnum,
  subject: z.string().min(1).max(120),
  body: z.string().min(1).max(4000),
  personalizationRationale: z.array(z.string().min(1).max(180)).max(12),
  confidence: z.number().min(0).max(1),
});
export type FollowUp = z.infer<typeof followUpSchema>;

// 6) Message QA reviewer
export const messageQaSchema = z.object({
  pass: z.boolean(),
  issues: z.array(z.string().min(1).max(200)).max(20),
  suggestedEdits: z.array(z.string().min(1).max(220)).max(20),
  riskScore: z.number().min(0).max(1),
});
export type MessageQa = z.infer<typeof messageQaSchema>;

// 7) Lead scoring
export const leadScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  tier: z.enum(["A", "B", "C", "D"]),
  reasons: z.array(z.string().min(1).max(180)).max(12),
  confidence: z.number().min(0).max(1),
});
export type LeadScore = z.infer<typeof leadScoreSchema>;

