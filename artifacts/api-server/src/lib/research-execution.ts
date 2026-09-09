import type { ResearchNextAction, ResearchPlan } from "./research-orchestrator";

export type ResearchExecutionStep = "POLICY_CHECK" | "DEMAND_CHECK" | "KILL_RISK_CHECK";

export type ResearchExecutionResult = {
  stepsExecuted: ResearchExecutionStep[];
  finalPlan: ResearchPlan;
};

export type ResearchExecutionDependencies = {
  readPlan: () => Promise<ResearchPlan>;
  runPolicyCheck: () => Promise<void>;
  runDemandCheck: () => Promise<void>;
  runKillRiskCheck: () => Promise<void>;
  maxPaidSteps?: number;
};

const executableAction = (action: ResearchNextAction): boolean =>
  action === "RUN_POLICY_CHECK" ||
  action === "RUN_DEMAND_CHECK" ||
  action === "RUN_KILL_RISK_CHECK";

export async function executeResearchWorkflow(
  dependencies: ResearchExecutionDependencies,
): Promise<ResearchExecutionResult> {
  const maxPaidSteps = dependencies.maxPaidSteps ?? 3;
  if (!Number.isInteger(maxPaidSteps) || maxPaidSteps < 0 || maxPaidSteps > 3) {
    throw new Error("Research execution maxPaidSteps must be between 0 and 3");
  }

  const stepsExecuted: ResearchExecutionStep[] = [];
  let plan = await dependencies.readPlan();

  while (stepsExecuted.length < maxPaidSteps && executableAction(plan.nextAction)) {
    if (!plan.automaticExternalCallsEnabled) break;

    if (plan.nextAction === "RUN_POLICY_CHECK") {
      await dependencies.runPolicyCheck();
      stepsExecuted.push("POLICY_CHECK");
    } else if (plan.nextAction === "RUN_DEMAND_CHECK") {
      await dependencies.runDemandCheck();
      stepsExecuted.push("DEMAND_CHECK");
    } else if (plan.nextAction === "RUN_KILL_RISK_CHECK") {
      await dependencies.runKillRiskCheck();
      stepsExecuted.push("KILL_RISK_CHECK");
    }

    plan = await dependencies.readPlan();
  }

  return { stepsExecuted, finalPlan: plan };
}
