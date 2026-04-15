import { Resend } from "resend";
import { getEnv } from "@/lib/env";

export function getResendClient() {
  const apiKey = getEnv().server.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");
  return new Resend(apiKey);
}

