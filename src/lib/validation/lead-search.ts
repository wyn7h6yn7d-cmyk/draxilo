import { z } from "zod";

import { LOCALES } from "@/lib/i18n/types";

export const leadSearchSchema = z.object({
  keyword: z.string().trim().min(2).max(120),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  cityOrRegion: z.string().trim().max(80).optional().or(z.literal("")),
  companySize: z.string().trim().max(80).optional().or(z.literal("")),
  language: z.enum(LOCALES).optional().or(z.literal("")),
  mustHaveWords: z.string().trim().max(300).optional().or(z.literal("")),
  excludeWords: z.string().trim().max(300).optional().or(z.literal("")),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(50).default(10),
});

export type LeadSearchInput = z.infer<typeof leadSearchSchema>;

export function splitWords(input: string | undefined) {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);
}

