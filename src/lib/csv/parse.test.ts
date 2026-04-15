import { describe, expect, it } from "vitest";

import { parseCsvText } from "@/lib/csv/parse";

describe("parseCsvText", () => {
  it("parses utf-8 text with headers and trims values", () => {
    const csv = "company_name,email\nAcme OÜ,  test@acme.ee \n";
    const parsed = parseCsvText(csv);
    expect(parsed.headers).toEqual(["company_name", "email"]);
    expect(parsed.rows[0]).toEqual({ company_name: "Acme OÜ", email: "test@acme.ee" });
  });
});

