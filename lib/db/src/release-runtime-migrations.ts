import type { Pool } from "pg";

export const REQUIRED_RELEASE_RUNTIME_TABLES = [
  "release_jobs",
  "release_events",
] as const;

const MIGRATION_ID = "2026-09-09-controlled-release-v1";

export async function prepareControlledReleaseSchema(targetPool: Pool): Promise<{
  appliedMigrationIds: string[];
  requiredTables: readonly string[];
}> {
  const client = await targetPool.connect();
  const appliedMigrationIds: string[] = [];
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "money-scout-controlled-release-migrations",
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
      const prerequisite = await client.query<{
        build_jobs: string | null;
        builder_workspaces: string | null;
        qa_runs: string | null;
      }>(
        "SELECT to_regclass('public.build_jobs')::text AS build_jobs, to_regclass('public.builder_workspaces')::text AS builder_workspaces, to_regclass('public.qa_runs')::text AS qa_runs",
      );
      if (!prerequisite.rows[0]?.build_jobs || !prerequisite.rows[0]?.builder_workspaces || !prerequisite.rows[0]?.qa_runs) {
        throw new Error("Controlled release migration requires build_jobs, builder_workspaces, and qa_runs before API startup.");
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS release_jobs (
          id SERIAL PRIMARY KEY,
          build_job_id INTEGER NOT NULL REFERENCES build_jobs(id) ON DELETE CASCADE,
          builder_workspace_id INTEGER NOT NULL REFERENCES builder_workspaces(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          idempotency_key TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'READY_FOR_PREVIEW',
          product_shape TEXT NOT NULL,
          target_kind TEXT NOT NULL,
          plan JSONB NOT NULL,
          release_provider TEXT NOT NULL DEFAULT 'UNCONFIGURED',
          release_cost_mode TEXT NOT NULL DEFAULT 'ZERO_CASH',
          preview_provider_run_id TEXT,
          preview_idempotency_key TEXT NOT NULL,
          preview_url TEXT,
          preview_visibility TEXT,
          preview_health_passed BOOLEAN,
          preview_dispatch_attempt_count INTEGER NOT NULL DEFAULT 0,
          production_provider_run_id TEXT,
          production_idempotency_key TEXT NOT NULL,
          production_url TEXT,
          production_visibility TEXT,
          production_health_passed BOOLEAN,
          production_dispatch_attempt_count INTEGER NOT NULL DEFAULT 0,
          external_spend_ceiling_cents INTEGER NOT NULL DEFAULT 0,
          external_spend_used_cents INTEGER NOT NULL DEFAULT 0,
          public_release_authorized_at TIMESTAMPTZ,
          public_release_authorized_by TEXT,
          blocked_reason TEXT,
          last_error_code TEXT,
          last_error_message TEXT,
          started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          preview_finished_at TIMESTAMPTZ,
          production_finished_at TIMESTAMPTZ,
          finished_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS release_jobs_build_job_unique ON release_jobs(build_job_id);
        CREATE UNIQUE INDEX IF NOT EXISTS release_jobs_idempotency_unique ON release_jobs(idempotency_key);
        CREATE UNIQUE INDEX IF NOT EXISTS release_jobs_preview_idempotency_unique ON release_jobs(preview_idempotency_key);
        CREATE UNIQUE INDEX IF NOT EXISTS release_jobs_production_idempotency_unique ON release_jobs(production_idempotency_key);
        CREATE INDEX IF NOT EXISTS release_jobs_status_idx ON release_jobs(status, updated_at);
        CREATE INDEX IF NOT EXISTS release_jobs_opportunity_idx ON release_jobs(opportunity_id, created_at);
        CREATE INDEX IF NOT EXISTS release_jobs_cycle_idx ON release_jobs(evaluation_cycle_id, created_at);

        CREATE TABLE IF NOT EXISTS release_events (
          id SERIAL PRIMARY KEY,
          release_job_id INTEGER NOT NULL REFERENCES release_jobs(id) ON DELETE CASCADE,
          build_job_id INTEGER NOT NULL REFERENCES build_jobs(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS release_events_release_job_idx ON release_events(release_job_id, occurred_at);
        CREATE INDEX IF NOT EXISTS release_events_opportunity_idx ON release_events(opportunity_id, occurred_at);
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
    [[...REQUIRED_RELEASE_RUNTIME_TABLES]],
  );
  const present = new Set(verification.rows.map((row) => row.table_name));
  const missing = REQUIRED_RELEASE_RUNTIME_TABLES.filter((table) => !present.has(table));
  if (missing.length) {
    throw new Error(`Controlled release schema incomplete after migration. Missing: ${missing.join(", ")}`);
  }
  return { appliedMigrationIds, requiredTables: REQUIRED_RELEASE_RUNTIME_TABLES };
}
