import "./lib/anthropic-provider";
import {
  pool,
  prepareBuilderWorkspaceSchema,
  prepareControlledReleaseSchema,
  prepareQaDebugSchema,
  prepareRuntimeSchema,
} from "@workspace/db";
import app from "./app";
import { startBuildOrchestratorWorker } from "./lib/build-orchestrator-worker";
import { startBuilderWorkspaceWorker } from "./lib/builder-workspace-worker";
import { startControlledReleaseWorker } from "./lib/controlled-release-worker";
import { startExecutionKernel } from "./lib/execution-kernel";
import { startExecutionReconciler } from "./lib/execution-reconciler";
import { logger } from "./lib/logger";
import { startPortfolioHeartbeat } from "./lib/portfolio-heartbeat";
import { startQaDebugWorker } from "./lib/qa-debug-worker";
import { reconcileDiscoveryRunsOnStartup } from "./routes/discovery";

const rawPort = process.env["PORT"];

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
  const schema = await prepareRuntimeSchema(pool);
  const builderSchema = await prepareBuilderWorkspaceSchema(pool);
  const qaSchema = await prepareQaDebugSchema(pool);
  const releaseSchema = await prepareControlledReleaseSchema(pool);
  logger.info(
    {
      appliedRuntimeMigrations: [
        ...schema.appliedMigrationIds,
        ...builderSchema.appliedMigrationIds,
        ...qaSchema.appliedMigrationIds,
        ...releaseSchema.appliedMigrationIds,
      ],
      requiredRuntimeTables: [
        ...schema.requiredTables,
        ...builderSchema.requiredTables,
        ...qaSchema.requiredTables,
        ...releaseSchema.requiredTables,
      ],
    },
    "Runtime database schema ready",
  );

  await reconcileDiscoveryRunsOnStartup();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
    startExecutionReconciler(port);
    startExecutionKernel(port);
    startBuildOrchestratorWorker();
    startBuilderWorkspaceWorker();
    startQaDebugWorker();
    startControlledReleaseWorker();
    startPortfolioHeartbeat(port);
  });
}

void startServer().catch((error) => {
  logger.error({ err: error }, "API startup failed before workers were started");
  process.exit(1);
});
