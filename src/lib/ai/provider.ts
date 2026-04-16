import { getEnv } from "@/lib/env";
import { GoogleGeminiProvider } from "@/lib/ai/google";
import type { AiGenerateStructuredParams, AiProvider as InternalAiProvider, AiStructuredResult } from "@/lib/ai/providers/types";

export type AiProviderId = "google";

export type AiProvider = {
  id: AiProviderId;
  generateStructured<T>(params: AiGenerateStructuredParams<T>): Promise<AiStructuredResult<T>>;
};

function resolveProviderId(): AiProviderId {
  const p = getEnv().server.AI_PROVIDER?.trim().toLowerCase();
  if (p === "google") return "google";
  return "google";
}

let cached: InternalAiProvider | null = null;

export function getProvider(): AiProvider {
  if (cached) return cached as unknown as AiProvider;
  const id = resolveProviderId();
  switch (id) {
    case "google":
      cached = new GoogleGeminiProvider();
      return cached as unknown as AiProvider;
  }
}

