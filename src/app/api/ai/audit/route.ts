import { auditRequestSchema, runAuditUseCase } from "@/lib/ai/use-cases/audit";
import { handleAiPost } from "@/app/api/ai/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return await handleAiPost({
    tag: "audit",
    req,
    schema: auditRequestSchema,
    run: async (data) => runAuditUseCase(data),
  });
}

