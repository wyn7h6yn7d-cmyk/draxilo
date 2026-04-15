import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    workspaceSettings: { upsert: vi.fn(async () => ({})) },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: () => {},
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
  }),
}));

vi.mock("@/lib/workspace", () => ({
  getActiveWorkspaceForUser: async () => ({ id: "w1" }),
}));

import { saveOnboardingAction } from "@/app/actions/workspace-settings";

describe("onboarding save (server action)", () => {
  it("upserts workspace settings when input is valid", async () => {
    const res = await saveOnboardingAction({
      businessName: "Acme",
      websiteUrl: "https://acme.example",
      whatYouSell: "B2B services",
      targetCustomerDescription: "B2B companies in EE",
      industries: ["SaaS"],
      countries: ["EE"],
      languagesToUse: ["en"],
      preferredOutreachLanguage: "en",
      offerType: "",
      callToAction: "",
      tonePreference: "",
      targetCompanySize: "",
      targetRoles: [],
      avoidIndustries: [],
      idealCustomerExamples: "",
    });

    expect(res.ok).toBe(true);
    const { prisma } = await import("@/lib/db");
    expect((prisma as any).workspaceSettings.upsert).toHaveBeenCalled();
  });
});

