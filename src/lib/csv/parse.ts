import Papa from "papaparse";

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

export function parseCsvText(text: string): ParsedCsv {
  const res = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const headers = (res.meta.fields ?? []).filter(Boolean);
  const rows = (res.data ?? []).map((r) => {
    const out: Record<string, string> = {};
    headers.forEach((k) => (out[k] = String((r as any)[k] ?? "").trim()));
    return out;
  });

  return { headers, rows };
}

