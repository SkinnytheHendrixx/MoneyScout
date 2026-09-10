import type { Pool, PoolClient } from "pg";

export const REQUIRED_FACTORY_RUNTIME_TABLES = [
  "asset_factory_runs",
  "product_definitions",
  "requirement_graphs",
  "software_capability_families",
  "software_capability_implementations",
  "architecture_plans",
  "factory_review_defects",
  "asset_repositories",
  "builder_gateway_runs",
  "asset_factory_events",
] as const;

const MIGRATION_ID = "2026-09-10-asset-factory-builder-gateway-v1";
const OWNERSHIP_MIGRATION_ID =
  "2026-09-10-asset-factory-owned-record-cascades-v2";
const EXECUTION_PHASE_MIGRATION_ID =
  "2026-09-10-asset-factory-gateway-execution-phase-v3";

async function applied(
  client: PoolClient,
  migrationId: string,
): Promise<boolean> {
  const result = await client.query(
    "SELECT id FROM runtime_schema_migrations WHERE id = $1",
    [migrationId],
  );
  return Boolean(result.rowCount);
}

export async function prepareAssetFactorySchema(targetPool: Pool): Promise<{
  appliedMigrationIds: string[];
  requiredTables: readonly string[];
}> {
  const client = await targetPool.connect();
  const appliedMigrationIds: string[] = [];
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "money-scout-asset-factory-migrations",
    ]);
    await client.query(
      "CREATE TABLE IF NOT EXISTS runtime_schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    if (!(await applied(client, MIGRATION_ID))) {
      const prerequisites = await client.query<{
        opportunities: string | null;
        bets: string | null;
        builds: string | null;
        workspaces: string | null;
        qaRuns: string | null;
      }>(
        "SELECT to_regclass('public.opportunities')::text AS opportunities, to_regclass('public.bets')::text AS bets, to_regclass('public.build_jobs')::text AS builds, to_regclass('public.builder_workspaces')::text AS workspaces, to_regclass('public.qa_runs')::text AS \"qaRuns\"",
      );
      const row = prerequisites.rows[0];
      if (
        !row?.opportunities ||
        !row.bets ||
        !row.builds ||
        !row.workspaces ||
        !row.qaRuns
      ) {
        throw new Error(
          "Asset Factory migration requires opportunities, bets, build_jobs, builder_workspaces, and qa_runs.",
        );
      }
      await client.query(`
        CREATE TABLE IF NOT EXISTS asset_factory_runs (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
          idempotency_key TEXT NOT NULL,
          status TEXT NOT NULL,
          input_snapshot JSONB NOT NULL,
          input_fingerprint TEXT NOT NULL,
          product_definition_id INTEGER,
          architecture_plan_id INTEGER,
          asset_repository_id INTEGER,
          build_job_id INTEGER,
          blocker_code TEXT,
          next_action TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          finished_at TIMESTAMPTZ
        );
        CREATE UNIQUE INDEX IF NOT EXISTS asset_factory_runs_idempotency_unique ON asset_factory_runs(idempotency_key);
        CREATE INDEX IF NOT EXISTS asset_factory_runs_bet_idx ON asset_factory_runs(bet_id, created_at);
        CREATE INDEX IF NOT EXISTS asset_factory_runs_status_idx ON asset_factory_runs(status, updated_at);

        CREATE TABLE IF NOT EXISTS product_definitions (
          id SERIAL PRIMARY KEY,
          factory_run_id INTEGER NOT NULL REFERENCES asset_factory_runs(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
          previous_definition_id INTEGER,
          version INTEGER NOT NULL,
          status TEXT NOT NULL,
          fingerprint TEXT NOT NULL,
          input_snapshot_fingerprint TEXT NOT NULL,
          document JSONB NOT NULL,
          revision_reason TEXT NOT NULL,
          change_classification TEXT NOT NULL,
          changed_requirement_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
          bet_impact TEXT NOT NULL,
          acceptance_impact TEXT NOT NULL,
          frozen_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS product_definitions_bet_version_unique ON product_definitions(bet_id, version);
        CREATE UNIQUE INDEX IF NOT EXISTS product_definitions_fingerprint_unique ON product_definitions(fingerprint);
        CREATE INDEX IF NOT EXISTS product_definitions_run_idx ON product_definitions(factory_run_id);

        CREATE TABLE IF NOT EXISTS requirement_graphs (
          id SERIAL PRIMARY KEY,
          product_definition_id INTEGER NOT NULL REFERENCES product_definitions(id) ON DELETE CASCADE,
          fingerprint TEXT NOT NULL,
          graph JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS requirement_graphs_product_unique ON requirement_graphs(product_definition_id);
        CREATE UNIQUE INDEX IF NOT EXISTS requirement_graphs_fingerprint_unique ON requirement_graphs(fingerprint);

        CREATE TABLE IF NOT EXISTS software_capability_families (
          id SERIAL PRIMARY KEY,
          key TEXT NOT NULL,
          name TEXT NOT NULL,
          functional_contract JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS software_capability_families_key_unique ON software_capability_families(key);

        CREATE TABLE IF NOT EXISTS software_capability_implementations (
          id SERIAL PRIMARY KEY,
          family_id INTEGER NOT NULL REFERENCES software_capability_families(id) ON DELETE RESTRICT,
          implementation_key TEXT NOT NULL,
          version INTEGER NOT NULL,
          lifecycle_status TEXT NOT NULL,
          fingerprint TEXT NOT NULL,
          contract JSONB NOT NULL,
          supported_runtime_types JSONB NOT NULL DEFAULT '[]'::jsonb,
          dependency_bindings JSONB NOT NULL DEFAULT '[]'::jsonb,
          scaffold_source TEXT,
          builder_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
          conformance_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
          external_cost_model JSONB NOT NULL,
          cost_provenance JSONB NOT NULL,
          maintenance_burden TEXT NOT NULL,
          operational_burden TEXT NOT NULL,
          health_contract JSONB NOT NULL DEFAULT '[]'::jsonb,
          security_implications JSONB NOT NULL DEFAULT '[]'::jsonb,
          secret_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
          authority_implications JSONB NOT NULL DEFAULT '[]'::jsonb,
          known_limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
          evidence JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS software_capability_implementation_version_unique ON software_capability_implementations(implementation_key, version);
        CREATE UNIQUE INDEX IF NOT EXISTS software_capability_implementation_fingerprint_unique ON software_capability_implementations(fingerprint);
        CREATE INDEX IF NOT EXISTS software_capability_implementation_family_idx ON software_capability_implementations(family_id, lifecycle_status);

        CREATE TABLE IF NOT EXISTS architecture_plans (
          id SERIAL PRIMARY KEY,
          factory_run_id INTEGER NOT NULL REFERENCES asset_factory_runs(id) ON DELETE CASCADE,
          product_definition_id INTEGER NOT NULL REFERENCES product_definitions(id) ON DELETE CASCADE,
          requirement_graph_id INTEGER NOT NULL REFERENCES requirement_graphs(id) ON DELETE CASCADE,
          bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
          previous_plan_id INTEGER,
          version INTEGER NOT NULL,
          status TEXT NOT NULL,
          fingerprint TEXT NOT NULL,
          document JSONB NOT NULL,
          revision_reason TEXT NOT NULL,
          frozen_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS architecture_plans_product_version_unique ON architecture_plans(product_definition_id, version);
        CREATE UNIQUE INDEX IF NOT EXISTS architecture_plans_fingerprint_unique ON architecture_plans(fingerprint);
        CREATE INDEX IF NOT EXISTS architecture_plans_run_idx ON architecture_plans(factory_run_id);

        CREATE TABLE IF NOT EXISTS factory_review_defects (
          id SERIAL PRIMARY KEY,
          factory_run_id INTEGER NOT NULL REFERENCES asset_factory_runs(id) ON DELETE CASCADE,
          review_stage TEXT NOT NULL,
          subject_fingerprint TEXT NOT NULL,
          defect_key TEXT NOT NULL,
          critic TEXT NOT NULL,
          category TEXT NOT NULL,
          severity TEXT NOT NULL,
          fatal BOOLEAN NOT NULL,
          summary TEXT NOT NULL,
          repair_target TEXT NOT NULL,
          affected_requirement_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
          resolved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS factory_review_defects_identity_unique ON factory_review_defects(factory_run_id, review_stage, subject_fingerprint, defect_key);
        CREATE INDEX IF NOT EXISTS factory_review_defects_run_idx ON factory_review_defects(factory_run_id, fatal);

        CREATE TABLE IF NOT EXISTS asset_repositories (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
          asset_key TEXT NOT NULL,
          internal_slug TEXT NOT NULL,
          provider TEXT NOT NULL,
          status TEXT NOT NULL,
          repository_url TEXT,
          repository_external_id TEXT,
          default_branch TEXT NOT NULL DEFAULT 'main',
          base_commit_sha TEXT,
          manifests_fingerprint TEXT NOT NULL,
          manifest_files JSONB NOT NULL,
          last_error_code TEXT,
          last_error_message TEXT,
          provisioned_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS asset_repositories_bet_unique ON asset_repositories(bet_id);
        CREATE UNIQUE INDEX IF NOT EXISTS asset_repositories_asset_key_unique ON asset_repositories(asset_key);
        CREATE UNIQUE INDEX IF NOT EXISTS asset_repositories_slug_unique ON asset_repositories(internal_slug);
        CREATE INDEX IF NOT EXISTS asset_repositories_status_idx ON asset_repositories(status, updated_at);

        CREATE TABLE IF NOT EXISTS builder_gateway_runs (
          id SERIAL PRIMARY KEY,
          build_job_id INTEGER NOT NULL REFERENCES build_jobs(id) ON DELETE CASCADE,
          asset_repository_id INTEGER NOT NULL REFERENCES asset_repositories(id) ON DELETE CASCADE,
          idempotency_key TEXT NOT NULL,
          provider TEXT NOT NULL,
          provider_run_id TEXT,
          provider_thread_id TEXT,
          status TEXT NOT NULL,
          terminal_outcome TEXT,
          attempt_number INTEGER NOT NULL DEFAULT 1,
          repair_number INTEGER NOT NULL DEFAULT 0,
          branch_name TEXT NOT NULL,
          base_commit_sha TEXT,
          result_commit_sha TEXT,
          isolated_workspace_path TEXT,
          lease_owner TEXT,
          lease_expires_at TIMESTAMPTZ,
          usage JSONB NOT NULL,
          actual_external_cash_cost_cents INTEGER,
          cost_provenance TEXT NOT NULL,
          entitlement_consumption JSONB NOT NULL,
          result_summary TEXT,
          challenge JSONB,
          request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          cancellation_requested_at TIMESTAMPTZ,
          started_at TIMESTAMPTZ,
          finished_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS builder_gateway_runs_idempotency_unique ON builder_gateway_runs(idempotency_key);
        CREATE UNIQUE INDEX IF NOT EXISTS builder_gateway_runs_active_branch_unique ON builder_gateway_runs(asset_repository_id, branch_name) WHERE status IN ('QUEUED','PREPARING','RUNNING','CANCELLING');
        CREATE INDEX IF NOT EXISTS builder_gateway_runs_build_idx ON builder_gateway_runs(build_job_id, attempt_number);
        CREATE INDEX IF NOT EXISTS builder_gateway_runs_status_idx ON builder_gateway_runs(status, updated_at);

        CREATE TABLE IF NOT EXISTS asset_factory_events (
          id SERIAL PRIMARY KEY,
          factory_run_id INTEGER NOT NULL REFERENCES asset_factory_runs(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS asset_factory_events_run_idx ON asset_factory_events(factory_run_id, occurred_at);

        ALTER TABLE build_jobs ADD COLUMN IF NOT EXISTS factory_run_id INTEGER;
        ALTER TABLE build_jobs ADD COLUMN IF NOT EXISTS asset_repository_id INTEGER;
        ALTER TABLE build_jobs ADD COLUMN IF NOT EXISTS result_commit_sha TEXT;
        ALTER TABLE builder_workspaces ADD COLUMN IF NOT EXISTS gateway_run_id INTEGER;
        ALTER TABLE builder_workspaces ADD COLUMN IF NOT EXISTS result_commit_sha TEXT;
        ALTER TABLE builder_workspaces ALTER COLUMN cost_mode SET DEFAULT 'UNKNOWN';
        ALTER TABLE qa_runs ADD COLUMN IF NOT EXISTS commit_sha TEXT;
        ALTER TABLE qa_runs ALTER COLUMN qa_cost_mode SET DEFAULT 'UNKNOWN';

        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asset_factory_runs_product_definition_fk') THEN
            ALTER TABLE asset_factory_runs ADD CONSTRAINT asset_factory_runs_product_definition_fk FOREIGN KEY (product_definition_id) REFERENCES product_definitions(id) ON DELETE SET NULL;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asset_factory_runs_architecture_plan_fk') THEN
            ALTER TABLE asset_factory_runs ADD CONSTRAINT asset_factory_runs_architecture_plan_fk FOREIGN KEY (architecture_plan_id) REFERENCES architecture_plans(id) ON DELETE SET NULL;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asset_factory_runs_repository_fk') THEN
            ALTER TABLE asset_factory_runs ADD CONSTRAINT asset_factory_runs_repository_fk FOREIGN KEY (asset_repository_id) REFERENCES asset_repositories(id) ON DELETE SET NULL;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asset_factory_runs_build_job_fk') THEN
            ALTER TABLE asset_factory_runs ADD CONSTRAINT asset_factory_runs_build_job_fk FOREIGN KEY (build_job_id) REFERENCES build_jobs(id) ON DELETE SET NULL;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'build_jobs_factory_run_fk') THEN
            ALTER TABLE build_jobs ADD CONSTRAINT build_jobs_factory_run_fk FOREIGN KEY (factory_run_id) REFERENCES asset_factory_runs(id) ON DELETE SET NULL;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'build_jobs_asset_repository_fk') THEN
            ALTER TABLE build_jobs ADD CONSTRAINT build_jobs_asset_repository_fk FOREIGN KEY (asset_repository_id) REFERENCES asset_repositories(id) ON DELETE SET NULL;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'builder_workspaces_gateway_run_fk') THEN
            ALTER TABLE builder_workspaces ADD CONSTRAINT builder_workspaces_gateway_run_fk FOREIGN KEY (gateway_run_id) REFERENCES builder_gateway_runs(id) ON DELETE SET NULL;
          END IF;
        END $$;
      `);
      await client.query(
        "INSERT INTO runtime_schema_migrations (id) VALUES ($1)",
        [MIGRATION_ID],
      );
      appliedMigrationIds.push(MIGRATION_ID);
    }
    if (!(await applied(client, OWNERSHIP_MIGRATION_ID))) {
      await client.query(`
        ALTER TABLE asset_factory_runs DROP CONSTRAINT IF EXISTS asset_factory_runs_bet_id_bets_id_fk;
        ALTER TABLE asset_factory_runs DROP CONSTRAINT IF EXISTS asset_factory_runs_bet_id_fkey;
        ALTER TABLE asset_factory_runs ADD CONSTRAINT asset_factory_runs_bet_id_bets_id_fk FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE;

        ALTER TABLE product_definitions DROP CONSTRAINT IF EXISTS product_definitions_bet_id_bets_id_fk;
        ALTER TABLE product_definitions DROP CONSTRAINT IF EXISTS product_definitions_bet_id_fkey;
        ALTER TABLE product_definitions ADD CONSTRAINT product_definitions_bet_id_bets_id_fk FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE;

        ALTER TABLE architecture_plans DROP CONSTRAINT IF EXISTS architecture_plans_product_definition_id_product_definitions_id_fk;
        ALTER TABLE architecture_plans DROP CONSTRAINT IF EXISTS architecture_plans_product_definition_id_fkey;
        ALTER TABLE architecture_plans ADD CONSTRAINT architecture_plans_product_definition_id_product_definitions_id_fk FOREIGN KEY (product_definition_id) REFERENCES product_definitions(id) ON DELETE CASCADE;
        ALTER TABLE architecture_plans DROP CONSTRAINT IF EXISTS architecture_plans_requirement_graph_id_requirement_graphs_id_fk;
        ALTER TABLE architecture_plans DROP CONSTRAINT IF EXISTS architecture_plans_requirement_graph_id_fkey;
        ALTER TABLE architecture_plans ADD CONSTRAINT architecture_plans_requirement_graph_id_requirement_graphs_id_fk FOREIGN KEY (requirement_graph_id) REFERENCES requirement_graphs(id) ON DELETE CASCADE;
        ALTER TABLE architecture_plans DROP CONSTRAINT IF EXISTS architecture_plans_bet_id_bets_id_fk;
        ALTER TABLE architecture_plans DROP CONSTRAINT IF EXISTS architecture_plans_bet_id_fkey;
        ALTER TABLE architecture_plans ADD CONSTRAINT architecture_plans_bet_id_bets_id_fk FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE;

        ALTER TABLE asset_repositories DROP CONSTRAINT IF EXISTS asset_repositories_bet_id_bets_id_fk;
        ALTER TABLE asset_repositories DROP CONSTRAINT IF EXISTS asset_repositories_bet_id_fkey;
        ALTER TABLE asset_repositories ADD CONSTRAINT asset_repositories_bet_id_bets_id_fk FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE;

        ALTER TABLE builder_gateway_runs DROP CONSTRAINT IF EXISTS builder_gateway_runs_asset_repository_id_asset_repositories_id_fk;
        ALTER TABLE builder_gateway_runs DROP CONSTRAINT IF EXISTS builder_gateway_runs_asset_repository_id_fkey;
        ALTER TABLE builder_gateway_runs ADD CONSTRAINT builder_gateway_runs_asset_repository_id_asset_repositories_id_fk FOREIGN KEY (asset_repository_id) REFERENCES asset_repositories(id) ON DELETE CASCADE;
      `);
      await client.query(
        "INSERT INTO runtime_schema_migrations (id) VALUES ($1)",
        [OWNERSHIP_MIGRATION_ID],
      );
      appliedMigrationIds.push(OWNERSHIP_MIGRATION_ID);
    }
    if (!(await applied(client, EXECUTION_PHASE_MIGRATION_ID))) {
      await client.query(`
        ALTER TABLE builder_gateway_runs ADD COLUMN IF NOT EXISTS execution_phase TEXT NOT NULL DEFAULT 'PRE_PROVIDER';
      `);
      await client.query(
        "INSERT INTO runtime_schema_migrations (id) VALUES ($1)",
        [EXECUTION_PHASE_MIGRATION_ID],
      );
      appliedMigrationIds.push(EXECUTION_PHASE_MIGRATION_ID);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  const verification = await targetPool.query<{ table_name: string }>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])",
    [[...REQUIRED_FACTORY_RUNTIME_TABLES]],
  );
  const present = new Set(verification.rows.map((row) => row.table_name));
  const missing = REQUIRED_FACTORY_RUNTIME_TABLES.filter(
    (name) => !present.has(name),
  );
  if (missing.length) {
    throw new Error(
      `Asset Factory schema incomplete after migration. Missing: ${missing.join(", ")}`,
    );
  }
  return {
    appliedMigrationIds,
    requiredTables: REQUIRED_FACTORY_RUNTIME_TABLES,
  };
}
