export type LeadSourceTypeV1 = "PUBLIC_WEB" | "CSV_IMPORT" | "MANUAL" | "API_PROVIDER";

export type ProviderKey =
  | "PUBLIC_WEB_PROVIDER"
  | "CSV_PROVIDER"
  | "MANUAL_PROVIDER"
  | "APIFY_PROVIDER"
  | "GOOGLE_CSE_PROVIDER"
  | "CUSTOM_API_PROVIDER";

export type LeadSearchQuery = {
  keyword: string;
  industry?: string;
  country?: string;
  cityOrRegion?: string;
  companySize?: string;
  language?: string;
  mustHaveWords?: string[];
  excludeWords?: string[];
  page: number;
  pageSize: number;
};

export type SearchCompanyResult = {
  companyName?: string;
  domain?: string;
  title?: string;
  snippet?: string;
  country?: string;
  city?: string;
  sourceUrl?: string;
  sourceType: LeadSourceTypeV1;
  confidenceScore?: number; // 0..1
};

export type SearchCompaniesResponse = {
  results: SearchCompanyResult[];
  page: number;
  pageSize: number;
  totalEstimate?: number;
};

export type ProviderNotConfigured = {
  ok: false;
  error: "PROVIDER_NOT_CONFIGURED";
  providerKey: ProviderKey;
  message: string;
};

export type ProviderOk = {
  ok: true;
  providerKey: ProviderKey;
  response: SearchCompaniesResponse;
};

export type ProviderRunResult = ProviderOk | ProviderNotConfigured;

export interface LeadSearchProviderAdapter {
  key: ProviderKey;
  displayName: string;
  isEnabled(): boolean;
  isConfigured(): boolean;
  notConfiguredMessage: string;
  run(params: {
    query?: LeadSearchQuery;
    csvText?: string;
  }): Promise<ProviderRunResult>;
}

