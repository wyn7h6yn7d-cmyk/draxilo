import { chatRequestSchema, runChatUseCase } from "@/lib/ai/use-cases/chat";
import { handleAiPost } from "@/app/api/ai/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  return await handleAiPost({
    tag: "chat",
    req,
    schema: chatRequestSchema,
    run: async (data) => runChatUseCase(data),
  });
}

