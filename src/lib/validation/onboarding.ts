import { z } from "zod";

import { LOCALES } from "@/lib/i18n/types";

const localeEnum = z.enum(LOCALES);

export const onboardingBaseSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  websiteUrl: z.string().trim().url().optional().or(z.literal("")),
  whatYouSell: z.string().trim().min(5).max(500),
  targetCustomerDescription: z.string().trim().min(10).max(800),
});

export const onboardingTargetingSchema = z.object({
  industries: z.array(z.string().trim().min(2).max(60)).max(50).default([]),
  countries: z.array(z.string().trim().min(2).max(60)).max(50).default([]),
  languagesToUse: z.array(localeEnum).min(1),
  preferredOutreachLanguage: localeEnum,
});

export const onboardingAdvancedSchema = z.object({
  offerType: z.string().trim().max(120).optional().or(z.literal("")),
  callToAction: z.string().trim().max(160).optional().or(z.literal("")),
  tonePreference: z.string().trim().max(80).optional().or(z.literal("")),
  targetCompanySize: z.string().trim().max(80).optional().or(z.literal("")),
  targetRoles: z.array(z.string().trim().min(2).max(80)).max(50).default([]),
  avoidIndustries: z.array(z.string().trim().min(2).max(60)).max(50).default([]),
  idealCustomerExamples: z.string().trim().max(1200).optional().or(z.literal("")),
});

export const onboardingFullSchema = onboardingBaseSchema
  .merge(onboardingTargetingSchema)
  .merge(onboardingAdvancedSchema);

export type OnboardingBase = z.infer<typeof onboardingBaseSchema>;
export type OnboardingTargeting = z.infer<typeof onboardingTargetingSchema>;
export type OnboardingAdvanced = z.infer<typeof onboardingAdvancedSchema>;
export type OnboardingFull = z.infer<typeof onboardingFullSchema>;

