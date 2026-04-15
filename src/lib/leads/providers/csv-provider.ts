import { parseCsvText } from "@/lib/csv/parse";
import type { LeadSearchProviderAdapter, ProviderRunResult, SearchCompanyResult } from "./types";

export class CsvProvider implements LeadSearchProviderAdapter {
  key = "CSV_PROVIDER" as const;
  displayName = "CSV";
  notConfiguredMessage = "CSV provider is always available.";

  isEnabled() {
    return true;
  }

  isConfigured() {
    return true;
  }

  async run(params: { csvText?: string }): Promise<ProviderRunResult> {
    const csvText = params.csvText ?? "";
    if (!csvText.trim()) {
      return { ok: true, providerKey: this.key, response: { results: [], page: 1, pageSize: 1000 } };
    }

    const parsed = parseCsvText(csvText);
    const header = parsed.headers;
    const idx = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    const iCompany = idx("companyName");
    const iDomain = idx("domain");
    const iCountry = idx("country");
    const iCity = idx("city");
    const iUrl = idx("sourceUrl");
    const iTitle = idx("title");
    const iSnippet = idx("snippet");

    const results: SearchCompanyResult[] = [];
    for (const row of parsed.rows) {
      const cols = header.map((h) => row[h] ?? "");
      const r: SearchCompanyResult = {
        companyName: iCompany >= 0 ? cols[iCompany] : undefined,
        domain: iDomain >= 0 ? cols[iDomain] : undefined,
        country: iCountry >= 0 ? cols[iCountry] : undefined,
        city: iCity >= 0 ? cols[iCity] : undefined,
        sourceUrl: iUrl >= 0 ? cols[iUrl] : undefined,
        title: iTitle >= 0 ? cols[iTitle] : undefined,
        snippet: iSnippet >= 0 ? cols[iSnippet] : undefined,
        sourceType: "CSV_IMPORT",
        confidenceScore: undefined,
      };
      if (r.companyName || r.domain || r.sourceUrl) results.push(r);
      if (results.length >= 1000) break;
    }

    return {
      ok: true,
      providerKey: this.key,
      response: { results, page: 1, pageSize: results.length, totalEstimate: results.length },
    };
  }
}

