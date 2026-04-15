import type {
  LeadSearchQuery,
  SearchCompanyResult,
  LeadSearchProviderAdapter,
  ProviderRunResult,
} from "./types";

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function makeDomain(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18);
  return base ? `${base}.example` : undefined;
}

export class MockPublicWebProvider implements LeadSearchProviderAdapter {
  key = "PUBLIC_WEB_PROVIDER" as const;
  displayName = "Public web (mock)";
  notConfiguredMessage =
    "Public web provider is not configured. Set LEADFORGE_ENABLE_MOCK_PUBLIC_WEB=1 for local dev, or connect a real provider.";

  isEnabled() {
    return true;
  }

  isConfigured() {
    return process.env.LEADFORGE_ENABLE_MOCK_PUBLIC_WEB === "1";
  }

  async run(params: { query?: LeadSearchQuery }): Promise<ProviderRunResult> {
    const query = params.query;
    if (!query) {
      return { ok: true, providerKey: this.key, response: { results: [], page: 1, pageSize: 10 } };
    }
    if (!this.isConfigured()) {
      return { ok: false, error: "PROVIDER_NOT_CONFIGURED", providerKey: this.key, message: this.notConfiguredMessage };
    }

    const seed = hash(
      [
        query.keyword,
        query.industry ?? "",
        query.country ?? "",
        query.cityOrRegion ?? "",
        query.companySize ?? "",
        query.language ?? "",
        (query.mustHaveWords ?? []).join("|"),
        (query.excludeWords ?? []).join("|"),
      ].join("::"),
    );

    const totalEstimate = 87 + (seed % 120);
    const start = (query.page - 1) * query.pageSize;
    const end = Math.min(totalEstimate, start + query.pageSize);

    const results: SearchCompanyResult[] = [];
    for (let i = start; i < end; i++) {
      const n = seed + i * 2654435761;
      const companyName = `Company ${((n >>> 0) % 9000) + 1000}`;
      const domain = makeDomain(companyName);
      const country = query.country ?? (n % 2 === 0 ? "EE" : "FI");
      const city = query.cityOrRegion ?? (n % 3 === 0 ? "Tallinn" : n % 3 === 1 ? "Tartu" : "Helsinki");

      results.push({
        companyName,
        domain,
        title: `${companyName} — ${query.keyword}`,
        snippet: `Matches “${query.keyword}”${query.industry ? ` in ${query.industry}` : ""}.`,
        country,
        city,
        sourceUrl: domain ? `https://${domain}` : undefined,
        sourceType: "PUBLIC_WEB",
        confidenceScore: Math.max(0.35, Math.min(0.95, 0.55 + ((n % 40) / 100))),
      });
    }

    return {
      ok: true,
      providerKey: this.key,
      response: { results, page: query.page, pageSize: query.pageSize, totalEstimate },
    };
  }
}

