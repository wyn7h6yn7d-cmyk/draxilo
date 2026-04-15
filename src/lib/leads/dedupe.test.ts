import { describe, expect, it } from "vitest";

import { buildLeadDedupeKey, stableDedupeString } from "@/lib/leads/dedupe";

describe("lead deduplication key", () => {
  it("prefers normalized domain from domain/website and includes email/name", () => {
    const key = buildLeadDedupeKey({
      domain: "https://www.Example.com/a",
      email: "USER@EXAMPLE.COM",
      companyName: " ACME OÜ ",
    });
    expect(key.normalizedDomain).toBe("example.com");
    expect(key.normalizedEmail).toBe("user@example.com");
    expect(key.normalizedName).toBe("acme o");
    expect(stableDedupeString(key)).toBe("example.com|user@example.com|acme o");
  });
});

