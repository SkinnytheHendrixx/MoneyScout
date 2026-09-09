import "./lib/anthropic-provider";
import app from "./app";
import { logger } from "./lib/logger";
import { startPortfolioHeartbeat } from "./lib/portfolio-heartbeat";
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

void reconcileDiscoveryRunsOnStartup().then(() => app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startPortfolioHeartbeat(port);
})).catch((error) => {
  logger.error({ err: error }, "Failed to reconcile discovery runs on startup");
  process.exit(1);
});
