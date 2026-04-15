"use client";

import * as React from "react";
import Papa from "papaparse";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/toast/toast-provider";
import { importCsvLeadsAction } from "@/app/actions/csv-import";

type TargetField =
  | "company_name"
  | "domain"
  | "website"
  | "email"
  | "country"
  | "city"
  | "notes"
  | "first_name"
  | "last_name"
  | "role";

const TARGET_FIELDS: { key: TargetField }[] = [
  { key: "company_name" },
  { key: "domain" },
  { key: "website" },
  { key: "email" },
  { key: "country" },
  { key: "city" },
  { key: "notes" },
  { key: "first_name" },
  { key: "last_name" },
  { key: "role" },
];

type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

function guessMapping(headers: string[]) {
  const map: Partial<Record<TargetField, string>> = {};
  const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const h = headers.map((x) => ({ raw: x, n: norm(x) }));

  const pick = (field: TargetField, candidates: string[]) => {
    const found = h.find((x) => candidates.includes(x.n));
    if (found) map[field] = found.raw;
  };

  pick("company_name", ["company", "company_name", "companyname", "name"]);
  pick("domain", ["domain", "company_domain", "website_domain"]);
  pick("website", ["website", "website_url", "url", "homepage"]);
  pick("email", ["email", "email_address", "contact_email"]);
  pick("country", ["country", "country_code"]);
  pick("city", ["city", "region", "location_city"]);
  pick("notes", ["notes", "note", "comment"]);
  pick("first_name", ["first_name", "firstname", "first"]);
  pick("last_name", ["last_name", "lastname", "last"]);
  pick("role", ["role", "title", "job_title"]);

  return map;
}

function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const headers = (results.meta.fields ?? []).filter(Boolean);
        const rows = (results.data ?? []).map((r) => {
          const out: Record<string, string> = {};
          headers.forEach((k) => (out[k] = String((r as any)[k] ?? "").trim()));
          return out;
        });
        resolve({ headers, rows });
      },
      error: (err) => reject(err),
    });
  });
}

export function CsvImportWizard({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = React.useTransition();

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [file, setFile] = React.useState<File | null>(null);
  const [parsed, setParsed] = React.useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = React.useState<Partial<Record<TargetField, string>>>({});
  const [errors, setErrors] = React.useState<string[]>([]);

  const preview = React.useMemo(() => {
    if (!parsed) return [];
    return parsed.rows.slice(0, 10).map((r) => {
      const get = (f: TargetField) => (mapping[f] ? r[mapping[f]!] : "");
      return {
        company_name: get("company_name"),
        domain: get("domain"),
        website: get("website"),
        email: get("email"),
        country: get("country"),
        city: get("city"),
        notes: get("notes"),
        first_name: get("first_name"),
        last_name: get("last_name"),
        role: get("role"),
      };
    });
  }, [parsed, mapping]);

  async function onPickFile(f: File) {
    setErrors([]);
    setFile(f);
    try {
      const p = await parseCsvFile(f);
      if (p.headers.length === 0) {
        setErrors([dict.leads.csvImport.errors.noHeaders]);
        return;
      }
      setParsed(p);
      setMapping(guessMapping(p.headers));
      setStep(2);
    } catch {
      setErrors([dict.leads.csvImport.errors.parseFailed]);
    }
  }

  function validateMapping() {
    const e: string[] = [];
    const hasCompany = !!mapping.company_name;
    const hasDomainOrWebsite = !!mapping.domain || !!mapping.website;
    if (!hasCompany && !hasDomainOrWebsite) {
      e.push(dict.leads.csvImport.errors.mappingRequired);
    }
    setErrors(e);
    return e.length === 0;
  }

  function next() {
    if (step === 2 && !validateMapping()) return;
    setStep((s) => (s === 3 ? 3 : ((s + 1) as any)));
  }

  function back() {
    setErrors([]);
    setStep((s) => (s === 1 ? 1 : ((s - 1) as any)));
  }

  function startImport() {
    if (!file || !parsed) return;
    if (!validateMapping()) return;

    startTransition(async () => {
      const res = await importCsvLeadsAction({
        fileName: file.name,
        mapping,
        rows: parsed.rows,
      });
      if (!res.ok) {
        toast.push({ title: dict.toasts.error, description: res.message ?? dict.errors.generic, variant: "error" });
        return;
      }
      toast.push({
        title: dict.toasts.saved,
        description: `Created ${res.summary.created}, updated ${res.summary.updated}, skipped ${res.summary.skipped}.`,
      });
      router.push("/app/leads");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{dict.leads.csvImport.pageTitle}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {dict.leads.csvImport.pageSubtitle}
          </p>
        </div>
        <Link
          href="/sample-leads.csv"
          className="text-sm text-zinc-700 hover:underline dark:text-zinc-300"
          download
        >
          {dict.leads.csvImport.downloadSample}
        </Link>
      </div>

      {errors.length ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.leads.csvImport.upload.title}</CardTitle>
            <CardDescription>{dict.leads.csvImport.upload.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone
              labels={{
                dropHere: dict.leads.csvImport.upload.dropHere,
                utf8Hint: dict.leads.csvImport.upload.utf8Hint,
              }}
              onFile={(f) => void onPickFile(f)}
              disabled={pending}
            />
            <div className="mt-4">
              <Label>{dict.leads.csvImport.upload.chooseFile}</Label>
              <Input
                type="file"
                accept=".csv,text/csv"
                disabled={pending}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPickFile(f);
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 && parsed ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.leads.csvImport.mapping.title}</CardTitle>
            <CardDescription>{dict.leads.csvImport.mapping.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {TARGET_FIELDS.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label>{(dict.leads.csvImport.fields as any)[f.key]}</Label>
                  <select
                    value={mapping[f.key] ?? ""}
                    onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value || undefined })}
                    className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    <option value="">{dict.leads.csvImport.mapping.skip}</option>
                    {parsed.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={back}>
                {dict.leads.csvImport.actions.back}
              </Button>
              <Button onClick={next}>{dict.leads.csvImport.actions.preview}</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 && parsed ? (
        <Card>
          <CardHeader>
            <CardTitle>{dict.leads.csvImport.preview.title}</CardTitle>
            <CardDescription>{dict.leads.csvImport.preview.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                  <tr>
                    {TARGET_FIELDS.map((f) => (
                      <th key={f.key} className="py-2 pr-4">
                        {f.key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {preview.map((r, idx) => (
                    <tr key={idx}>
                      {TARGET_FIELDS.map((f) => (
                        <td key={f.key} className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                          {(r as any)[f.key] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={back} disabled={pending}>
                {dict.leads.csvImport.actions.back}
              </Button>
              <Button onClick={startImport} disabled={pending}>
                {dict.leads.csvImport.actions.import}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Dropzone({
  onFile,
  disabled,
  labels,
}: {
  onFile: (f: File) => void;
  disabled: boolean;
  labels: { dropHere: string; utf8Hint: string };
}) {
  const [over, setOver] = React.useState(false);

  return (
    <div
      className={[
        "rounded-xl border border-dashed p-6 text-center",
        over
          ? "border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900/30"
          : "border-zinc-200 dark:border-zinc-800",
        disabled ? "opacity-60" : "",
      ].join(" ")}
      onDragEnter={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (disabled) return;
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
    >
      <div className="text-sm font-medium">{labels.dropHere}</div>
      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{labels.utf8Hint}</div>
    </div>
  );
}

