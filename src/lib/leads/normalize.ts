export function normalizeDomain(input?: string | null) {
  if (!input) return null;
  const raw = input.trim().toLowerCase();
  const withoutProtocol = raw.replace(/^https?:\/\//, "");
  const host = withoutProtocol.split("/")[0] ?? "";
  const clean = host.replace(/^www\./, "");
  return clean || null;
}

export function normalizeCompanyName(input?: string | null) {
  if (!input) return null;
  const s = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 .&-]/g, "");
  return s || null;
}

export function normalizeEmail(input?: string | null) {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  return s || null;
}

