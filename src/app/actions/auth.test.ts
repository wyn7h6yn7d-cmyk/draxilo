import { describe, expect, it, vi } from "vitest";

// Mock redirect to capture destinations.
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));

const signUpMock = vi.fn(async () => ({ error: null }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      signUp: signUpMock,
    },
  }),
}));

import { signUpAction } from "@/app/actions/auth";

describe("signup flow (server action)", () => {
  it("redirects to /app on success", async () => {
    const fd = new FormData();
    fd.set("email", "user@example.com");
    fd.set("password", "password123");

    await expect(signUpAction(fd)).rejects.toThrowError("REDIRECT:/app");
    expect(signUpMock).toHaveBeenCalled();
  });
});

