import { MockPublicWebProvider } from "./mock-public-web";
import { CsvProvider } from "./csv-provider";
import type { LeadSearchProviderAdapter, ProviderKey } from "./types";

class PlaceholderProvider implements LeadSearchProviderAdapter {
  constructor(
    public key: ProviderKey,
    public displayName: string,
    public notConfiguredMessage: string,
    private enabledEnvVar?: string,
  ) {}

  isEnabled() {
    return this.enabledEnvVar ? process.env[this.enabledEnvVar] === "1" : true;
  }
  isConfigured() {
    return false;
  }
  async run() {
    return {
      ok: false as const,
      error: "PROVIDER_NOT_CONFIGURED" as const,
      providerKey: this.key,
      message: this.notConfiguredMessage,
    };
  }
}

const PROVIDERS: LeadSearchProviderAdapter[] = [
  new MockPublicWebProvider(),
  new CsvProvider(),
  new PlaceholderProvider("MANUAL_PROVIDER", "Manual", "Manual provider is a placeholder. Add leads directly in the Leads area."),
  new PlaceholderProvider(
    "APIFY_PROVIDER",
    "Apify",
    "Apify provider not configured. TODO: add APIFY_TOKEN and an actor/task adapter.",
    "LEADFORGE_ENABLE_APIFY",
  ),
  new PlaceholderProvider(
    "GOOGLE_CSE_PROVIDER",
    "Google CSE",
    "Google CSE provider not configured. TODO: add GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX.",
    "LEADFORGE_ENABLE_GOOGLE_CSE",
  ),
  new PlaceholderProvider(
    "CUSTOM_API_PROVIDER",
    "Custom API",
    "Custom API provider not configured. TODO: add CUSTOM_API_BASE_URL + auth settings.",
    "LEADFORGE_ENABLE_CUSTOM_API",
  ),
];

export function getProvider(key: ProviderKey) {
  return PROVIDERS.find((p) => p.key === key) ?? null;
}

export function listProviders() {
  return PROVIDERS.filter((p) => p.isEnabled()).map((p) => ({
    key: p.key,
    displayName: p.displayName,
    configured: p.isConfigured(),
    notConfiguredMessage: p.notConfiguredMessage,
  }));
}

export function getDefaultProviderKey(): ProviderKey {
  // Prefer public web if configured, else fall back to CSV.
  const publicWeb = getProvider("PUBLIC_WEB_PROVIDER");
  if (publicWeb?.isEnabled() && publicWeb.isConfigured()) return "PUBLIC_WEB_PROVIDER";
  return "CSV_PROVIDER";
}

