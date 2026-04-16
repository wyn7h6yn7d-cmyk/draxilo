import { getEnv } from "@/lib/env";
import type { DemoAnalysisResponse, DemoRequestBody } from "@/lib/demo/types";
import { simulateDemoAnalysis } from "@/lib/demo/sim/generator";
import { runAIDemoPipeline } from "@/lib/demo/ai-pipeline";

export type DemoEngineMode = "simulated" | "live_ai";

export function getDemoEngineMode(): DemoEngineMode {
  const raw = getEnv().server.DEMO_ENGINE?.trim().toLowerCase();
  if (raw === "live_ai") return "live_ai";
  return "simulated";
}

export async function runDemoEngine(req: DemoRequestBody): Promise<DemoAnalysisResponse> {
  const mode = getDemoEngineMode();

  if (mode === "live_ai") {
    // Live AI is opt-in; keep public demo stable by default.
    if (!process.env.GEMINI_API_KEY?.trim()) throw new Error("Missing GEMINI_API_KEY");
    return await runAIDemoPipeline(req);
  }

  return simulateDemoAnalysis(req);
}

