import { describe, expect, it } from "vitest";

import { normalizeDomain, normalizeEmail } from "@/lib/leads/normalize";

describe("normalizeDomain", () => {
  it("strips protocol, path, and www", () => {
    expect(normalizeDomain("https://www.Example.com/path?q=1")).toBe("example.com");
  });

  it("returns null for empty", () => {
    expect(normalizeDomain("")).toBe(null);
    expect(normalizeDomain(null)).toBe(null);
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Test@Example.COM ")).toBe("test@example.com");
  });
});

