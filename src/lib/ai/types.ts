import { z } from "zod";

import { LOCALES } from "@/lib/i18n/types";

export const localeSchema = z.enum(LOCALES);
export type AiLocale = z.infer<typeof localeSchema>;

export type PromptTemplate<TInputs> = {
  name: string;
  version: string;
  build(inputs: TInputs): { prompt: string };
};

