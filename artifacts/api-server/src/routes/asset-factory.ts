import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  architecturePlansTable,
  assetFactoryEventsTable,
  assetFactoryRunsTable,
  assetRepositoriesTable,
  builderGatewayRunsTable,
  buildJobsTable,
  db,
  factoryReviewDefectsTable,
  productDefinitionsTable,
} from "@workspace/db";
import { startAssetFactoryRun } from "../lib/asset-factory";

const router: IRouter = Router();

router.post(
  "/opportunities/:opportunityId/asset-factory",
  async (req, res): Promise<void> => {
    const opportunityId = Number(req.params.opportunityId);
    const requestedBetId =
      req.body?.bet_id == null ? null : Number(req.body.bet_id);
    if (
      !Number.isInteger(opportunityId) ||
      opportunityId <= 0 ||
      (requestedBetId != null &&
        (!Number.isInteger(requestedBetId) || requestedBetId <= 0))
    ) {
      res.status(400).json({ error: "Invalid opportunity or Bet id" });
      return;
    }
    const result = await startAssetFactoryRun({
      opportunityId,
      requestedBetId,
    });
    if (result.kind === "NOT_FOUND") {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }
    if (result.kind !== "RUN") {
      res.status(409).json({
        error: result.kind,
        message:
          result.kind === "BET_REQUIRED"
            ? "An approved or active Bet is required before a Factory run can begin."
            : result.kind === "BET_INACTIVE"
              ? `The selected Bet is ${result.betStatus}; no new Factory progression is allowed.`
              : result.blockers.join(" "),
        authority_granted: false,
        external_cost_cents: 0,
      });
      return;
    }
    res.status(200).json({
      factory_run: result.run,
      reused: result.reused,
      authority: {
        provider_spend: false,
        customer_charging: false,
        public_release: false,
        outbound: false,
        advertising: false,
        production_credentials: false,
        custom_domain: false,
      },
    });
  },
);

router.get("/asset-factory/runs", async (_req, res): Promise<void> => {
  const runs = await db
    .select()
    .from(assetFactoryRunsTable)
    .orderBy(desc(assetFactoryRunsTable.updatedAt));
  res.status(200).json({ runs });
});

router.get("/asset-factory/runs/:runId", async (req, res): Promise<void> => {
  const runId = Number(req.params.runId);
  if (!Number.isInteger(runId) || runId <= 0) {
    res.status(400).json({ error: "Invalid Factory run id" });
    return;
  }
  const [run] = await db
    .select()
    .from(assetFactoryRunsTable)
    .where(eq(assetFactoryRunsTable.id, runId));
  if (!run) {
    res.status(404).json({ error: "Factory run not found" });
    return;
  }
  const [
    productDefinition,
    architecturePlan,
    repository,
    buildJob,
    defects,
    events,
  ] = await Promise.all([
    run.productDefinitionId
      ? db
          .select()
          .from(productDefinitionsTable)
          .where(eq(productDefinitionsTable.id, run.productDefinitionId))
          .then((rows) => rows[0] ?? null)
      : null,
    run.architecturePlanId
      ? db
          .select()
          .from(architecturePlansTable)
          .where(eq(architecturePlansTable.id, run.architecturePlanId))
          .then((rows) => rows[0] ?? null)
      : null,
    run.assetRepositoryId
      ? db
          .select()
          .from(assetRepositoriesTable)
          .where(eq(assetRepositoriesTable.id, run.assetRepositoryId))
          .then((rows) => rows[0] ?? null)
      : null,
    run.buildJobId
      ? db
          .select()
          .from(buildJobsTable)
          .where(eq(buildJobsTable.id, run.buildJobId))
          .then((rows) => rows[0] ?? null)
      : null,
    db
      .select()
      .from(factoryReviewDefectsTable)
      .where(eq(factoryReviewDefectsTable.factoryRunId, run.id))
      .orderBy(factoryReviewDefectsTable.id),
    db
      .select()
      .from(assetFactoryEventsTable)
      .where(eq(assetFactoryEventsTable.factoryRunId, run.id))
      .orderBy(assetFactoryEventsTable.id),
  ]);
  const gatewayRuns = buildJob
    ? await db
        .select()
        .from(builderGatewayRunsTable)
        .where(eq(builderGatewayRunsTable.buildJobId, buildJob.id))
        .orderBy(desc(builderGatewayRunsTable.attemptNumber))
    : [];
  res.status(200).json({
    run,
    product_definition: productDefinition,
    architecture_plan: architecturePlan,
    review_defects: defects,
    asset_repository: repository,
    build_job: buildJob,
    builder_gateway_runs: gatewayRuns,
    events,
  });
});

export default router;
