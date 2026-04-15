import { z } from "zod";

const serverSchema = z.object({
  // NOTE: Next.js may evaluate server modules during build/prerender without runtime env.
  // We enforce this at runtime (see getEnv()).
  DATABASE_URL: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ENRICH_MODEL: z.string().optional(),
  OPENAI_MESSAGE_MODEL: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),

  LEADFORGE_ENABLE_MOCK_PUBLIC_WEB: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

let cached: { server: ServerEnv; public: PublicEnv } | null = null;

export function getEnv() {
  if (cached) return cached;

  const server = serverSchema.parse(process.env);
  const pub = publicSchema.parse(process.env);

  // Runtime enforcement (avoid failing `next build` in environments without runtime secrets).
  const phase = process.env.NEXT_PHASE ?? "";
  const isBuildPhase = phase.includes("production-build") || phase.includes("phase-production-build");
  if (!isBuildPhase) {
    if (!server.DATABASE_URL) {
      throw new z.ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["DATABASE_URL"],
          message: "DATABASE_URL is required at runtime.",
        } as any,
      ]);
    }
    if (!pub.NEXT_PUBLIC_SUPABASE_URL || !pub.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new z.ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["NEXT_PUBLIC_SUPABASE_URL"],
          message: "NEXT_PUBLIC_SUPABASE_URL is required at runtime.",
        } as any,
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
          message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required at runtime.",
        } as any,
      ]);
    }
  }

  cached = { server, public: pub };
  return cached;
}

