"use server";

import { Locale as PrismaLocale } from "@prisma/client";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { leadSearchSchema, type LeadSearchInput } from "@/lib/validation/lead-search";
import { runPublicWebLeadSearch, saveSearchResultsAsLeads } from "@/lib/leads/search-service";
import type { SearchCompanyResult } from "@/lib/leads/providers/types";
import { toDbLocale } from "@/lib/i18n/db-locale";
import { getLocale } from "@/lib/i18n/locale";
import { getProvider } from "@/lib/leads/providers";
import { z } from "zod";

export async function searchLeadsAction(input: unknown) {
  const schema = z
    .object({
      providerKey: z.enum([
        "PUBLIC_WEB_PROVIDER",
        "CSV_PROVIDER",
        "MANUAL_PROVIDER",
        "APIFY_PROVIDER",
        "GOOGLE_CSE_PROVIDER",
        "CUSTOM_API_PROVIDER",
      ]),
      query: leadSearchSchema.optional(),
      csvText: z.string().optional(),
    })
    .refine((x) => (x.providerKey === "CSV_PROVIDER" ? !!x.csvText : !!x.query), {
      message: "Missing provider input",
    });

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "INVALID_INPUT" as const, issues: parsed.error.issues };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  const locale = await getLocale();
  const localeDb = toDbLocale(locale) as unknown as PrismaLocale;

  if (parsed.data.providerKey === "PUBLIC_WEB_PROVIDER") {
    const result = await runPublicWebLeadSearch({
      workspaceId: workspace.id,
      createdById: user.id,
      localeDb,
      input: parsed.data.query as LeadSearchInput,
    });
    if (!result.ok) {
      return { ok: false as const, error: result.error, message: result.message ?? "PROVIDER_NOT_CONFIGURED" };
    }
    return result;
  }

  const provider = getProvider(parsed.data.providerKey);
  if (!provider || !provider.isEnabled() || !provider.isConfigured()) {
    return {
      ok: false as const,
      error: "PROVIDER_NOT_CONFIGURED" as const,
      message: provider?.notConfiguredMessage ?? "Provider is not configured.",
    };
  }

  const ran = await provider.run({ query: parsed.data.query as any, csvText: parsed.data.csvText });
  if (!ran.ok) {
    return { ok: false as const, error: "PROVIDER_NOT_CONFIGURED" as const, message: ran.message };
  }

  // For non-public-web providers, we return results without persistence in V1.
  return {
    ok: true as const,
    provider: { key: provider.key, displayName: provider.displayName },
    leadSearchId: null,
    leadSourceId: null,
    page: ran.response.page,
    pageSize: ran.response.pageSize,
    totalEstimate: ran.response.totalEstimate,
    results: ran.response.results,
  };
}

export async function saveLeadsFromSearchAction(params: {
  leadSourceId: string;
  selected: SearchCompanyResult[];
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, error: "UNAUTHORIZED" as const };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, error: "NO_WORKSPACE" as const };

  if (!params.leadSourceId || !Array.isArray(params.selected) || params.selected.length === 0) {
    return { ok: false as const, error: "INVALID_INPUT" as const };
  }

  const res = await saveSearchResultsAsLeads({
    workspaceId: workspace.id,
    createdById: user.id,
    leadSourceId: params.leadSourceId,
    selected: params.selected.slice(0, 200),
  });

  return { ok: true as const, createdLeadIds: res.createdLeadIds };
}

