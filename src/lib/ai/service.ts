import type { AiProvider, AiProviderId, AiGenerateStructuredParams, AiStructuredResult } from "@/lib/ai/providers/types";
import { GoogleGeminiProvider } from "@/lib/ai/providers/google";
import { getEnv } from "@/lib/env";

export type AiProviderConfig = {
  provider: AiProviderId;
};

function getProviderConfig(): AiProviderConfig {
  const p = getEnv().server.AI_PROVIDER?.trim().toLowerCase();
  if (p === "google") return { provider: "google" };
  // Default to google for a free-tier friendly developer experience.
  return { provider: "google" };
}

let cachedProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cachedProvider) return cachedProvider;
  const { provider } = getProviderConfig();
  switch (provider) {
    case "google":
      cachedProvider = new GoogleGeminiProvider();
      return cachedProvider;
  }
}

function shouldRetry(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return /429|rate|quota|timeout|temporar|503|overloaded|ECONNRESET|ETIMEDOUT/i.test(msg);
}

async function retry<T>(fn: () => Promise<T>, attempts: number) {
  let last: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i === attempts - 1) break;
      if (!shouldRetry(e)) break;
      const delayMs = 250 * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

export async function generateStructuredJson<T>(params: AiGenerateStructuredParams<T>): Promise<AiStructuredResult<T>> {
  const provider = getAiProvider();
  // One retry is usually enough for transient JSON/429 issues, without blowing free-tier usage.
  return await retry(() => provider.generateStructured(params), 2);
}

