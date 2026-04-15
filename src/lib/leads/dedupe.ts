import { normalizeCompanyName, normalizeDomain, normalizeEmail } from "@/lib/leads/normalize";

export type LeadDedupeKey = {
  normalizedDomain: string | null;
  normalizedEmail: string | null;
  normalizedName: string | null;
};

export function buildLeadDedupeKey(input: {
  domain?: string | null;
  website?: string | null;
  email?: string | null;
  companyName?: string | null;
}): LeadDedupeKey {
  const normalizedDomain = normalizeDomain(input.domain ?? null) ?? normalizeDomain(input.website ?? null);
  const normalizedEmail = normalizeEmail(input.email ?? null);
  const normalizedName = normalizeCompanyName(input.companyName ?? null);
  return { normalizedDomain, normalizedEmail, normalizedName };
}

export function stableDedupeString(key: LeadDedupeKey) {
  return `${key.normalizedDomain ?? ""}|${key.normalizedEmail ?? ""}|${key.normalizedName ?? ""}`;
}

