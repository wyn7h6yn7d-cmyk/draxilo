import { describe, expect, it } from "vitest";

import { computeLeadScore } from "@/lib/leads/scoring";

describe("computeLeadScore", () => {
  it("gives higher score when website + email + good enrichment confidence", () => {
    const a = computeLeadScore({
      workspace: { whatYouSell: "lead generation automation", industries: ["SaaS"], countries: ["EE"] },
      lead: { hasWebsite: true, hasContactEmail: true, companyCountry: "EE" },
      enrichment: {
        companySummary: "We build lead generation automation for B2B teams.",
        likelyIndustry: "SaaS",
        likelyServicesOrProducts: ["lead generation automation"],
        targetAudience: ["B2B"],
        possiblePainPoints: ["pipeline"],
        websiteLanguages: ["en"],
        locationClues: [],
        contactPageUrl: null,
        pricingPageUrl: null,
        confidence: 0.9,
      },
    });

    const b = computeLeadScore({
      workspace: { whatYouSell: "lead generation automation", industries: ["SaaS"], countries: ["EE"] },
      lead: { hasWebsite: false, hasContactEmail: false, companyCountry: null },
      enrichment: null,
    });

    expect(a.total).toBeGreaterThan(b.total);
    expect(a.factors.websiteCompleteness).toBe(15);
  });
});

