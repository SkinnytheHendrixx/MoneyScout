import type { NextFunction, Request, Response } from "express";

/**
 * Execution-failure recovery is a workflow problem, not a new market thesis.
 * The current Resolution HTTP runtime has a closed set of persisted problem keys.
 * Until the runtime is migrated to the shared ResolutionProblem registry, map the
 * two recovery-only keys onto the closest existing recovery classes while
 * preserving the original failure context in the unresolved question.
 *
 * This never authorizes a replay of the failed paid stage. It only routes the
 * failure through the existing autonomous resolution ladder.
 */
export function normalizeExecutionRecoveryResolutionProblem(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.method !== "POST" || !req.path.match(/^\/opportunities\/\d+\/resolution\/advance$/)) {
    next();
    return;
  }
  const rawProblem = req.body?.problem;
  if (rawProblem !== "RESEARCH_EXECUTION_FAILURE" && rawProblem !== "VALIDATION_EXECUTION_FAILURE") {
    next();
    return;
  }

  const unresolved = typeof req.body?.unresolved_question === "string"
    ? req.body.unresolved_question.trim()
    : "Execution failed with no preserved detail.";
  req.body = {
    ...req.body,
    problem: rawProblem === "RESEARCH_EXECUTION_FAILURE"
      ? "RESEARCH_BUDGET_EXHAUSTED"
      : "VALIDATION_EVIDENCE_FAILURE",
    unresolved_question: `[${rawProblem}] ${unresolved}`.slice(0, 4_000),
    execution_recovery_problem: rawProblem,
  };
  next();
}
