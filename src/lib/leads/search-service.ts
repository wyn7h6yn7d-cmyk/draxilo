import { JobType, LeadSourceType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/leads/providers";
import type { SearchCompanyResult } from "@/lib/leads/providers/types";
import { normalizeCompanyName, normalizeDomain } from "@/lib/leads/normalize";
import { splitWords, type LeadSearchInput } from "@/lib/validation/lead-search";
import { runJob } from "@/lib/jobs/executor";

export async function runPublicWebLeadSearch(params: {
  workspaceId: string;
  createdById: string;
  localeDb: "ET" | "EN" | "RU";
  input: LeadSearchInput;
}) {
  const provider = getProvider("PUBLIC_WEB_PROVIDER");
  if (!provider || !provider.isEnabled() || !provider.isConfigured()) {
    return { ok: false as const, error: "PROVIDER_NOT_CONFIGURED" as const, message: provider?.notConfiguredMessage };
  }

  const query = {
    keyword: params.input.keyword,
    industry: params.input.industry || undefined,
    country: params.input.country || undefined,
    cityOrRegion: params.input.cityOrRegion || undefined,
    companySize: params.input.companySize || undefined,
    language: params.input.language || undefined,
    mustHaveWords: splitWords(params.input.mustHaveWords || undefined),
    excludeWords: splitWords(params.input.excludeWords || undefined),
    page: params.input.page ?? 1,
    pageSize: params.input.pageSize ?? 10,
  };

  const leadSearch = await prisma.leadSearch.create({
    data: {
      workspaceId: params.workspaceId,
      createdById: params.createdById,
      name: `${query.keyword}${query.country ? ` — ${query.country}` : ""}`,
      service: "Lead search",
      targetAudience: "",
      campaignGoals: "",
      query: query.keyword,
      locale: params.localeDb as any,
      parameters: {
        v: 1,
        provider: provider.key,
        query,
      },
    },
  });

  const job = await runJob({
    workspaceId: params.workspaceId,
    triggeredById: params.createdById,
    type: JobType.LEAD_SEARCH,
    link: { leadSearchId: leadSearch.id },
    payload: { providerKey: provider.key, query, locale: params.localeDb },
    handler: async () => {
      const ran = await provider.run({ query });
      if (!ran.ok) throw new Error(ran.message);
      const response = ran.response;
      const source = await prisma.leadSource.create({
        data: {
          workspaceId: params.workspaceId,
          type: LeadSourceType.PUBLIC_WEB,
          leadSearchId: leadSearch.id,
          name: "Public web search",
          input: {
            providerKey: provider.key,
            query,
            page: response.page,
            pageSize: response.pageSize,
            totalEstimate: response.totalEstimate,
          },
        },
      });
      return {
        sourceId: source.id,
        page: response.page,
        pageSize: response.pageSize,
        totalEstimate: response.totalEstimate,
        results: response.results,
        provider: { key: provider.key, displayName: provider.displayName },
      };
    },
  });

  if (!job.ok || !job.result) {
    return { ok: false as const, error: "SEARCH_FAILED" as const };
  }

  return {
    ok: true as const,
    jobRunId: job.jobRunId,
    leadSearchId: leadSearch.id,
    leadSourceId: job.result.sourceId,
    page: job.result.page,
    pageSize: job.result.pageSize,
    totalEstimate: job.result.totalEstimate,
    results: job.result.results,
    provider: job.result.provider,
  };
}

export async function saveSearchResultsAsLeads(params: {
  workspaceId: string;
  createdById: string;
  leadSourceId: string;
  selected: SearchCompanyResult[];
}) {
  const createdLeadIds: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const r of params.selected) {
      const normalizedDomain = normalizeDomain(r.domain ?? r.sourceUrl ?? null);
      const normalizedName = normalizeCompanyName(r.companyName ?? null);

      // Dedupe: prefer domain; fall back to name-only lead entry.
      let companyId: string | null = null;
      if (normalizedDomain) {
        const company = await tx.leadCompany.upsert({
          where: {
            workspaceId_normalizedDomain: {
              workspaceId: params.workspaceId,
              normalizedDomain,
            },
          },
          create: {
            workspaceId: params.workspaceId,
            name: r.companyName ?? null,
            websiteUrl: normalizedDomain ? `https://${normalizedDomain}` : null,
            domain: normalizedDomain,
            normalizedDomain,
            country: r.country ?? null,
            city: r.city ?? null,
            metadata: {
              from: "lead_search_v1",
              title: r.title,
              snippet: r.snippet,
              sourceUrl: r.sourceUrl,
              confidenceScore: r.confidenceScore,
            },
          },
          update: {
            name: r.companyName ?? undefined,
            domain: normalizedDomain,
            country: r.country ?? undefined,
            city: r.city ?? undefined,
            metadata: {
              from: "lead_search_v1",
              title: r.title,
              snippet: r.snippet,
              sourceUrl: r.sourceUrl,
              confidenceScore: r.confidenceScore,
              normalizedName,
            },
          },
        });
        companyId = company.id;
      }

      // Leads dedupe uses (workspaceId, normalizedDomain, normalizedEmail). We don't have email here.
      // We'll set normalizedEmail = null and rely on domain uniqueness (and UI merging later).
      const lead = await tx.lead.create({
        data: {
          workspaceId: params.workspaceId,
          sourceId: params.leadSourceId,
          companyId,
          displayName: r.companyName ?? null,
          domain: normalizedDomain,
          normalizedDomain,
          normalizedEmail: null,
          tags: ["lead_search_v1"],
          notes: r.snippet ?? null,
        },
      });

      createdLeadIds.push(lead.id);
    }
  });

  return { createdLeadIds };
}

