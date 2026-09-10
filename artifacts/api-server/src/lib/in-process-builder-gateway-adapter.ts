import { eq } from "drizzle-orm";
import {
  assetRepositoriesTable,
  builderGatewayRunsTable,
  db,
} from "@workspace/db";
import type {
  BuilderAgentAdapter,
  BuilderDispatchResult,
} from "./builder-agent-adapter";
import {
  cancelBuilderGatewayRun,
  createOrReuseBuilderGatewayRun,
} from "./builder-gateway";

function stateFor(status: string): BuilderDispatchResult["state"] {
  if (status === "QUEUED" || status === "PREPARING") return "QUEUED";
  if (status === "RUNNING" || status === "CANCELLING") return "RUNNING";
  if (status === "SUCCEEDED") return "SUCCEEDED";
  if (status === "CANCELLED") return "CANCELLED";
  return "FAILED";
}

async function resultFor(
  run: typeof builderGatewayRunsTable.$inferSelect,
): Promise<BuilderDispatchResult> {
  const [repository] = await db
    .select()
    .from(assetRepositoriesTable)
    .where(eq(assetRepositoriesTable.id, run.assetRepositoryId));
  return {
    providerRunId: String(run.id),
    gatewayRunId: run.id,
    repositoryUrl: repository?.repositoryUrl ?? null,
    branchName: run.branchName,
    workspaceUrl: null,
    state: stateFor(run.status),
    progressPercent:
      run.status === "SUCCEEDED" ? 100 : run.status === "RUNNING" ? 50 : null,
    summary: run.resultSummary,
    // The Gateway reconciles authoritative cash cost directly and idempotently.
    // This legacy delta field must remain zero or the QA repair loop would count it twice.
    externalCostCents: 0,
    actualExternalCashCostCents: run.actualExternalCashCostCents,
    terminalOutcome: run.terminalOutcome,
    resultCommitSha: run.resultCommitSha,
    usage: run.usage,
    costProvenance: run.costProvenance,
    entitlementConsumption: run.entitlementConsumption,
    challenge: run.challenge,
  };
}

export function createInProcessBuilderGatewayAdapter(): BuilderAgentAdapter {
  return {
    provider: "BUILTIN_BUILDER_GATEWAY",
    costMode: "GATEWAY_ENFORCED",
    async dispatch(input) {
      const { run } = await createOrReuseBuilderGatewayRun({
        buildJobId: input.buildJobId,
        idempotencyKey: input.idempotencyKey,
      });
      return resultFor(run);
    },
    async getStatus(providerRunId) {
      const id = Number(providerRunId);
      const [run] = await db
        .select()
        .from(builderGatewayRunsTable)
        .where(eq(builderGatewayRunsTable.id, id));
      if (!run) throw new Error("BUILDER_GATEWAY_RUN_NOT_FOUND");
      return resultFor(run);
    },
    async repair(input) {
      const { run } = await createOrReuseBuilderGatewayRun({
        buildJobId: input.buildJobId,
        idempotencyKey: input.idempotencyKey,
        repairDefects: input.defects,
      });
      return resultFor(run);
    },
    async cancel(providerRunId, reason) {
      const run = await cancelBuilderGatewayRun(Number(providerRunId), reason);
      if (!run) throw new Error("BUILDER_GATEWAY_RUN_NOT_FOUND");
      return resultFor(run);
    },
  };
}
