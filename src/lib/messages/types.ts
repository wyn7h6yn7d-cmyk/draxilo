import { z } from "zod";

import { LOCALES, type Locale } from "@/lib/i18n/types";

export const messageStyleSchema = z.enum(["COLD_INTRO", "QUICK_AUDIT", "FOLLOW_UP"]);
export type MessageStyle = z.infer<typeof messageStyleSchema>;

export const messageToneSchema = z.enum(["FRIENDLY", "DIRECT", "SHARP"]);
export type MessageTone = z.infer<typeof messageToneSchema>;

export const messageLengthSchema = z.enum(["SHORT", "MEDIUM"]);
export type MessageLength = z.infer<typeof messageLengthSchema>;

export const messageChannelSchema = z.enum(["EMAIL", "LINKEDIN", "WHATSAPP"]);
export type MessageChannel = z.infer<typeof messageChannelSchema>;

export const localeSchema = z.enum(LOCALES);
export type MessageLocale = Locale;

