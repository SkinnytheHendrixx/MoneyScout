import { Router, type IRouter } from "express";
import { createAutonomousResolutionPlan } from "../lib/autonomous-resolution-engine";
import { createMonetizationExecutionPlan } from "../lib/monetization-execution-plan";
import { loadCommercialBuildBrief } from "./commercial-build";

const router: IRouter = Router();

router.get("/opportunities/:opportunityId/monetization-plan", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }

  const brief = await loadCommercialBuildBrief(opportunityId);
  if (!brief) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  const plan = createMonetizationExecutionPlan(brief);
  res.status(200).json({
    ...plan,
    autonomous_resolution_plans: plan.resolutionProblems.map(createAutonomousResolutionPlan),
    escalation_policy: "OWNER_ESCALATION_FOR_KNOWLEDGE_GAPS_FORBIDDEN_WITHOUT_EXHAUSTION_CERTIFICATE",
    generation: {
      external_cost_usd: 0,
      external_calls_performed: 0,
      persisted: false,
      executable: false,
      note: "This is a deterministic read-only execution plan. Missing buyer, pricing, or distribution evidence routes to autonomous resolution rather than owner homework. It does not start a coding agent, publish externally, charge a customer, send outreach, or authorize positive external spend.",
    },
  });
});

export default router;
