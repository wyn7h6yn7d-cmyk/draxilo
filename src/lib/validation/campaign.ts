import { z } from "zod";

import { LOCALES } from "@/lib/i18n/types";

export const campaignCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  objective: z.string().trim().max(400).optional().or(z.literal("")),
  localeDefault: z.enum(LOCALES).default("et"),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;

