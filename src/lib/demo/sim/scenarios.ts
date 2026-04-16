import type { DemoScenario } from "@/lib/demo/sim/types";

import { agencyScenario } from "@/lib/demo/sim/scenarios/agency";
import { b2bSaasScenario } from "@/lib/demo/sim/scenarios/b2b-saas";
import { industrialSupplierScenario } from "@/lib/demo/sim/scenarios/industrial-supplier";
import { localServiceScenario } from "@/lib/demo/sim/scenarios/local-service";
import { maintenanceScenario } from "@/lib/demo/sim/scenarios/maintenance";

export const DEMO_SCENARIOS: readonly DemoScenario[] = [
  maintenanceScenario,
  b2bSaasScenario,
  localServiceScenario,
  industrialSupplierScenario,
  agencyScenario,
] as const;

export function getScenarioById(id: string | null | undefined) {
  return DEMO_SCENARIOS.find((s) => s.id === id) ?? null;
}

