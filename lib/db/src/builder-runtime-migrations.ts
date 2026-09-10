import type { Pool, PoolClient } from "pg";

export const REQUIRED_BUILDER_RUNTIME_TABLES = [
  "builder_workspaces",
  "builder_workspace_events",
] as const;

const MIGRATION_ID = "2026-09-09-builder-workspace-v1";

async function createEnumIfMissing(
  client: PoolClient,
  name: string,
  values: readonly string[],
): Promise<void> {
  const escapedValues = values.map((value) => `'${value.replaceAll("'", "''")}'`).join(", ");
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE ${name} AS ENUM (${escapedValues});
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

export async function prepareBuilderWorkspaceSchema(targetPool: Pool): Promise<{
  appliedMigrationIds: string[];
  requiredTables: readonly string[];
}> {
  const client = await targetPool.connect();
  const appliedMigrationIds: string[] = [];
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "money-scout-builder-workspace-migrations",
    ]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS runtime_schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    const existing = await client.query<{ id: string }>(
      "SELECT id FROM runtime_schema_migrations WHERE id = $1",
      [MIGRATION_ID],
    );
    if (!existing.rowCount) {
      const prerequisite = await client.query<{ build_jobs: string | null }>(
        "SELECT to_regclass('public.build_jobs')::text AS build_jobs",
      );
      if (!prerequisite.rows[0]?.build_jobs) {
        throw new Error("Builder workspace migration requires public.build_jobs before API startup.");
      }
      await createEnumIfMissing(client, "builder_workspace_status", [
        "PROVISIONING",
        "READY",
        "DISPATCHING",
        "RUNNING",
        "QA_PENDING",
        "HUMAN_BLOCKED",
        "FAILED",
        "CANCELLED",
      ]);
      await client.query(`
        CREATE TABLE IF NOT EXISTS builder_workspaces (
          id SERIAL PRIMARY KEY,
          build_job_id INTEGER NOT NULL REFERENCES build_jobs(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          workspace_key TEXT NOT NULL,
          provider TEXT NOT NULL,
          adapter_kind TEXT NOT NULL DEFAULT 'GENERIC_HTTP',
          cost_mode TEXT NOT NULL DEFAULT 'ZERO_CASH',
          status builder_workspace_status NOT NULL DEFAULT 'PROVISIONING',
          provider_run_id TEXT,
          repository_url TEXT,
          branch_name TEXT,
          workspace_url TEXT,
          progress_percent INTEGER,
          status_summary TEXT,
          last_error_code TEXT,
          last_error_message TEXT,
          dispatch_attempt_count INTEGER NOT NULL DEFAULT 0,
          dispatched_at TIMESTAMPTZ,
          last_polled_at TIMESTAMPTZ,
          finished_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS builder_workspaces_build_job_unique
          ON builder_workspaces(build_job_id);
        CREATE UNIQUE INDEX IF NOT EXISTS builder_workspaces_key_unique
          ON builder_workspaces(workspace_key);
        CREATE INDEX IF NOT EXISTS builder_workspaces_status_idx
          ON builder_workspaces(status, updated_at);
        CREATE INDEX IF NOT EXISTS builder_workspaces_opportunity_idx
          ON builder_workspaces(opportunity_id, created_at);

        CREATE TABLE IF NOT EXISTS builder_workspace_events (
          id SERIAL PRIMARY KEY,
          workspace_id INTEGER NOT NULL REFERENCES builder_workspaces(id) ON DELETE CASCADE,
          build_job_id INTEGER NOT NULL REFERENCES build_jobs(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS builder_workspace_events_workspace_idx
          ON builder_workspace_events(workspace_id, occurred_at);
        CREATE INDEX IF NOT EXISTS builder_workspace_events_build_job_idx
          ON builder_workspace_events(build_job_id, occurred_at);
      `);
      await client.query("INSERT INTO runtime_schema_migrations (id) VALUES ($1)", [MIGRATION_ID]);
      appliedMigrationIds.push(MIGRATION_ID);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  const verification = await targetPool.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
    [[...REQUIRED_BUILDER_RUNTIME_TABLES]],
  );
  const present = new Set(verification.rows.map((row) => row.table_name));
  const missing = REQUIRED_BUILDER_RUNTIME_TABLES.filter((table) => !present.has(table));
  if (missing.length) {
    throw new Error(`Builder workspace schema incomplete after migration. Missing: ${missing.join(", ")}`);
  }
  return { appliedMigrationIds, requiredTables: REQUIRED_BUILDER_RUNTIME_TABLES };
}
