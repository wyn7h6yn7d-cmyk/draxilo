import * as cheerio from "cheerio";

const MAX_HTML_BYTES = 1024 * 1024; // 1MB
const FETCH_TIMEOUT_MS = 12_000;

export async function fetchHomepageHtml(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "DraxiloBot/1.0 (enrichment; +https://draxilo.local) AppleWebKit",
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      return { ok: false as const, error: `HTTP_${res.status}` as const };
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { ok: false as const, error: "NOT_HTML" as const };
    }

    const reader = res.body?.getReader();
    if (!reader) return { ok: false as const, error: "NO_BODY" as const };

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > MAX_HTML_BYTES) {
          controller.abort();
          return { ok: false as const, error: "TOO_LARGE" as const };
        }
        chunks.push(value);
      }
    }

    const buf = Buffer.concat(chunks);
    return { ok: true as const, html: buf.toString("utf8"), bytes: total, contentType };
  } catch (e: any) {
    const error = e?.name === "AbortError" ? "TIMEOUT" : "FETCH_FAILED";
    return { ok: false as const, error };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function extractVisibleText(html: string) {
  const $ = cheerio.load(html);

  // Remove noisy elements.
  $("script, style, noscript, svg, canvas, iframe, header, footer, nav").remove();

  const text = $("body").text();
  return text;
}

export function findLikelyPageUrls(baseUrl: string, html: string) {
  const $ = cheerio.load(html);
  const anchors = $("a[href]")
    .toArray()
    .map((a) => ($(a).attr("href") ?? "").trim())
    .filter(Boolean);

  const normalize = (href: string) => {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return null;
    }
  };

  const looksLike = (href: string, tokens: string[]) => {
    const s = href.toLowerCase();
    return tokens.some((t) => s.includes(t));
  };

  const contact = anchors.find((h) => looksLike(h, ["contact", "kontak", "kontakt", "contact-us", "contacts"]));
  const pricing = anchors.find((h) => looksLike(h, ["pricing", "prices", "hinnad", "price", "plans", "tariff"]));

  return {
    contactPageUrl: contact ? normalize(contact) : null,
    pricingPageUrl: pricing ? normalize(pricing) : null,
  };
}

export function cleanAndTruncateText(input: string, maxChars: number) {
  const cleaned = input
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length <= maxChars) return cleaned;

  // Prefer truncating on paragraph boundary.
  const slice = cleaned.slice(0, maxChars);
  const lastBreak = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  const cut = lastBreak > maxChars * 0.6 ? lastBreak : maxChars;
  return cleaned.slice(0, cut).trim();
}

