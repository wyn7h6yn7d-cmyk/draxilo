"use server";

import { JobType, LeadSourceType } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveWorkspaceForUser } from "@/lib/workspace";
import { normalizeCompanyName, normalizeDomain, normalizeEmail } from "@/lib/leads/normalize";
import { runJob } from "@/lib/jobs/executor";

const targetFieldSchema = z.enum([
  "company_name",
  "domain",
  "website",
  "email",
  "country",
  "city",
  "notes",
  "first_name",
  "last_name",
  "role",
]);

const importCsvSchema = z.object({
  fileName: z.string().min(1).max(200),
  mapping: z.record(targetFieldSchema, z.string().min(1)).optional(),
  rows: z.array(z.record(z.string(), z.string())).min(1).max(5000),
});

type ImportSummary = {
  created: number;
  updated: number;
  skipped: number;
  duplicates: number;
  errors: number;
};

type TargetField = z.infer<typeof targetFieldSchema>;
type Mapping = Partial<Record<TargetField, string>>;

function safeStr(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function pickRowField(
  row: Record<string, string>,
  mapping: Mapping,
  key: TargetField,
) {
  const col = mapping[key];
  if (!col) return "";
  return safeStr(row[col]);
}

function toWebsiteDomain(domain: string, website: string) {
  const normalizedDomain = normalizeDomain(domain || null) ?? normalizeDomain(website || null);
  const websiteUrl =
    normalizeDomain(website || null) ? (website.startsWith("http") ? website : `https://${normalizedDomain}`) : null;
  return { normalizedDomain, websiteUrl };
}

export async function importCsvLeadsAction(input: unknown) {
  const parsed = importCsvSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Invalid import payload.", issues: parsed.error.issues };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { ok: false as const, message: "Unauthorized." };

  const workspace = await getActiveWorkspaceForUser(user.id);
  if (!workspace) return { ok: false as const, message: "No workspace." };

  const { fileName, mapping, rows } = parsed.data;
  const m: Mapping = (mapping ?? {}) as Mapping;

  const hasCompany = !!m.company_name;
  const hasDomainOrWebsite = !!m.domain || !!m.website;
  if (!hasCompany && !hasDomainOrWebsite) {
    return { ok: false as const, message: "Map at least company_name or (domain/website)." };
  }

  const csvImport = await prisma.csvImport.create({
    data: {
      workspaceId: workspace.id,
      createdById: user.id,
      fileName,
      mimeType: "text/csv",
      sizeBytes: null,
      mapping: m as any,
      stats: { v: 1, rowCount: rows.length } as any,
    },
  });

  const job = await runJob({
    workspaceId: workspace.id,
    triggeredById: user.id,
    type: JobType.CSV_IMPORT,
    link: { csvImportId: csvImport.id },
    payload: { csvImportId: csvImport.id, fileName, mapping: m, rowCount: rows.length },
    handler: async () => {
      const summary: ImportSummary = { created: 0, updated: 0, skipped: 0, duplicates: 0, errors: 0 };
      const errorSamples: { row: number; message: string }[] = [];
      const seenKeys = new Set<string>();

      const leadSource = await prisma.leadSource.create({
        data: {
          workspaceId: workspace.id,
          type: LeadSourceType.CSV_IMPORT,
          csvImportId: csvImport.id,
          name: "CSV import",
          input: { fileName, mapping: m, rowCount: rows.length },
        },
      });

      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]!;

          const companyName = pickRowField(row, m, "company_name");
          const domain = pickRowField(row, m, "domain");
          const website = pickRowField(row, m, "website");
          const email = pickRowField(row, m, "email");
          const country = pickRowField(row, m, "country");
          const city = pickRowField(row, m, "city");
          const notes = pickRowField(row, m, "notes");
          const firstName = pickRowField(row, m, "first_name");
          const lastName = pickRowField(row, m, "last_name");
          const role = pickRowField(row, m, "role");

          const { normalizedDomain, websiteUrl } = toWebsiteDomain(domain, website);
          const normalizedEmail = normalizeEmail(email || null);
          const normalizedName = normalizeCompanyName(companyName || null);

          if (!normalizedDomain && !normalizedName && !normalizedEmail) {
            summary.skipped++;
            continue;
          }

          const key = `${normalizedDomain ?? ""}|${normalizedEmail ?? ""}|${normalizedName ?? ""}`;
          if (seenKeys.has(key)) {
            summary.duplicates++;
            continue;
          }
          seenKeys.add(key);

          let companyId: string | null = null;
          if (normalizedDomain) {
            const company = await tx.leadCompany.upsert({
              where: {
                workspaceId_normalizedDomain: { workspaceId: workspace.id, normalizedDomain },
              },
              create: {
                workspaceId: workspace.id,
                name: companyName || null,
                domain: normalizedDomain,
                normalizedDomain,
                websiteUrl: websiteUrl ?? (normalizedDomain ? `https://${normalizedDomain}` : null),
                country: country || null,
                city: city || null,
                metadata: { from: "csv_import", fileName: csvImport.fileName, normalizedName } as any,
              },
              update: {
                name: companyName || undefined,
                websiteUrl: websiteUrl ?? undefined,
                country: country || undefined,
                city: city || undefined,
                metadata: { from: "csv_import", fileName: csvImport.fileName, normalizedName } as any,
              },
            });
            companyId = company.id;
          }

          let contactId: string | null = null;
          if (normalizedEmail) {
            const contact = await tx.leadContact.upsert({
              where: {
                workspaceId_normalizedEmail: { workspaceId: workspace.id, normalizedEmail },
              },
              create: {
                workspaceId: workspace.id,
                companyId,
                email,
                normalizedEmail,
                firstName: firstName || null,
                lastName: lastName || null,
                title: role || null,
                metadata: { from: "csv_import", fileName: csvImport.fileName } as any,
              },
              update: {
                companyId: companyId ?? undefined,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                title: role || undefined,
                metadata: { from: "csv_import", fileName: csvImport.fileName } as any,
              },
            });
            contactId = contact.id;
          }

          const existing = await tx.lead.findFirst({
            where: {
              workspaceId: workspace.id,
              archivedAt: null,
              ...(normalizedDomain && normalizedEmail
                ? { normalizedDomain, normalizedEmail }
                : normalizedDomain
                  ? { normalizedDomain, normalizedEmail: null }
                  : normalizedEmail
                    ? { normalizedEmail, normalizedDomain: null }
                    : {}),
            } as any,
            orderBy: { updatedAt: "desc" },
          });

          if (existing) {
            await tx.lead.update({
              where: { id: existing.id },
              data: {
                sourceId: leadSource.id,
                companyId: companyId ?? existing.companyId,
                contactId: contactId ?? existing.contactId,
                displayName: companyName || existing.displayName,
                domain: normalizedDomain ?? existing.domain,
                normalizedDomain: normalizedDomain ?? existing.normalizedDomain,
                email: email || existing.email,
                normalizedEmail: normalizedEmail ?? existing.normalizedEmail,
                notes: notes || existing.notes,
                updatedAt: new Date(),
              },
            });
            summary.updated++;
          } else {
            try {
              await tx.lead.create({
                data: {
                  workspaceId: workspace.id,
                  sourceId: leadSource.id,
                  companyId,
                  contactId,
                  displayName: companyName || null,
                  domain: normalizedDomain,
                  normalizedDomain,
                  email: email || null,
                  normalizedEmail,
                  notes: notes || null,
                  tags: ["csv_import"],
                },
              });
              summary.created++;
            } catch (e: any) {
              summary.errors++;
              if (errorSamples.length < 15) {
                errorSamples.push({ row: i + 2, message: e?.message ?? "Failed to import row." });
              }
            }
          }
        }
      });

      await prisma.csvImport.update({
        where: { id: csvImport.id },
        data: { stats: { v: 1, rowCount: rows.length, summary, errorSamples } as any },
      });

      return { csvImportId: csvImport.id, summary, errorSamples };
    },
  });

  if (!job.ok || !job.result) return { ok: false as const, message: "CSV import failed." };
  return { ok: true as const, ...job.result };
}

