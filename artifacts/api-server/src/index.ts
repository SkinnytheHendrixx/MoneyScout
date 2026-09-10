import "./lib/anthropic-provider";
import {
  pool,
  prepareBetCapitalAllocationSchema,
  prepareAssetOperationsSchema,
  prepareAssetFactorySchema,
  prepareBuilderWorkspaceSchema,
  prepareControlledReleaseSchema,
  prepareQaDebugSchema,
  prepareRuntimeSchema,
} from "@workspace/db";
import app from "./app";
import { startAssetEconomicsWorker } from "./lib/asset-economics-worker";
import { startBetReconciliationWorker } from "./lib/bet-reconciliation-worker";
import { startAssetFactoryWorker } from "./lib/asset-factory-worker";
import { startBuilderGatewayWorker } from "./lib/builder-gateway-worker";
import { startAssetOperationsWorker } from "./lib/asset-operations-worker";
import { startAssetRemediationWorker } from "./lib/asset-remediation-worker";
import { startCommercialActivationWorker } from "./lib/commercial-activation-worker";
import {
  registerCommercialPaymentAdapter,
  registerConfiguredCommercialHttpAdapter,
  createZeroCostCommercialFixtureAdapter,
} from "./lib/commercial-payment-adapter";
import { startBuildOrchestratorWorker } from "./lib/build-orchestrator-worker";
import { startBuilderWorkspaceWorker } from "./lib/builder-workspace-worker";
import { startControlledReleaseSafetyWorker } from "./lib/controlled-release-safety";
import { startExecutionKernel } from "./lib/execution-kernel";
import { startExecutionReconciler } from "./lib/execution-reconciler";
import { logger } from "./lib/logger";
import { startPortfolioHeartbeat } from "./lib/portfolio-heartbeat";
import { startQaDebugWorker } from "./lib/qa-debug-worker";
import { reconcileDiscoveryRunsOnStartup } from "./routes/discovery";

const rawPort = process.env["PORT"];
const runtimePreflight = process.env.MONEY_SCOUT_RUNTIME_PREFLIGHT === "1";

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer(): Promise<void> {
  if (process.env.NODE_ENV === "test")
    registerCommercialPaymentAdapter(createZeroCostCommercialFixtureAdapter());
  else registerConfiguredCommercialHttpAdapter();
  const schema = await prepareRuntimeSchema(pool);
  const builderSchema = await prepareBuilderWorkspaceSchema(pool);
  const qaSchema = await prepareQaDebugSchema(pool);
  const releaseSchema = await prepareControlledReleaseSchema(pool);
  const assetSchema = await prepareAssetOperationsSchema(pool);
  const betSchema = await prepareBetCapitalAllocationSchema(pool);
  const factorySchema = await prepareAssetFactorySchema(pool);
  logger.info(
    {
      appliedRuntimeMigrations: [
        ...schema.appliedMigrationIds,
        ...builderSchema.appliedMigrationIds,
        ...qaSchema.appliedMigrationIds,
        ...releaseSchema.appliedMigrationIds,
        ...assetSchema.appliedMigrationIds,
        ...betSchema.appliedMigrationIds,
        ...factorySchema.appliedMigrationIds,
      ],
      requiredRuntimeTables: [
        ...schema.requiredTables,
        ...builderSchema.requiredTables,
        ...qaSchema.requiredTables,
        ...releaseSchema.requiredTables,
        ...assetSchema.requiredTables,
        ...betSchema.requiredTables,
        ...factorySchema.requiredTables,
      ],
      runtimePreflight,
    },
    "Runtime database schema ready",
  );

  if (!runtimePreflight) {
    await reconcileDiscoveryRunsOnStartup();
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port, runtimePreflight }, "Server listening");
    if (runtimePreflight) {
      logger.info(
        "Runtime preflight mode is active; autonomous workers are intentionally disabled",
      );
      return;
    }

    startExecutionReconciler(port);
    startExecutionKernel(port);
    startBuildOrchestratorWorker();
    startBuilderWorkspaceWorker();
    startQaDebugWorker();
    startControlledReleaseSafetyWorker();
    startAssetOperationsWorker();
    startAssetEconomicsWorker();
    startAssetRemediationWorker();
    startCommercialActivationWorker();
    startBetReconciliationWorker();
    startAssetFactoryWorker();
    startBuilderGatewayWorker();
    startPortfolioHeartbeat(port);
  });
}

void startServer().catch((error) => {
  logger.error(
    { err: error },
    "API startup failed before workers were started",
  );
  process.exit(1);
});
