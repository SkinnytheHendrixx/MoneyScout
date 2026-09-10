import type { Pool } from "pg";

export const REQUIRED_QA_RUNTIME_TABLES = [
  "qa_runs",
  "qa_run_events",
] as const;

const MIGRATION_ID = "2026-09-09-autonomous-qa-debug-v1";

export async function prepareQaDebugSchema(targetPool: Pool): Promise<{
  appliedMigrationIds: string[];
  requiredTables: readonly string[];
}> {
  const client = await targetPool.connect();
  const appliedMigrationIds: string[] = [];
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "money-scout-autonomous-qa-debug-migrations",
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
      }>(
        "SELECT to_regclass('public.build_jobs')::text AS build_jobs, to_regclass('public.builder_workspaces')::text AS builder_workspaces",
      );
      if (!prerequisite.rows[0]?.build_jobs || !prerequisite.rows[0]?.builder_workspaces) {
        throw new Error("Autonomous QA migration requires build_jobs and builder_workspaces before API startup.");
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS qa_runs (
          id SERIAL PRIMARY KEY,
          build_job_id INTEGER NOT NULL REFERENCES build_jobs(id) ON DELETE CASCADE,
          builder_workspace_id INTEGER NOT NULL REFERENCES builder_workspaces(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          round_number INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          qa_provider TEXT NOT NULL DEFAULT 'UNCONFIGURED',
          qa_cost_mode TEXT NOT NULL DEFAULT 'ZERO_CASH',
          qa_provider_run_id TEXT,
          qa_idempotency_key TEXT NOT NULL,
          repository_url TEXT,
          branch_name TEXT,
          acceptance_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
          acceptance_results JSONB NOT NULL DEFAULT '[]'::jsonb,
          defects JSONB NOT NULL DEFAULT '[]'::jsonb,
          result_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          baseline_checks_passed TEXT,
          repair_provider_run_id TEXT,
          repair_idempotency_key TEXT,
          repair_attempt_count INTEGER NOT NULL DEFAULT 0,
          qa_dispatch_attempt_count INTEGER NOT NULL DEFAULT 0,
          last_error_code TEXT,
          last_error_message TEXT,
          started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          qa_finished_at TIMESTAMPTZ,
          repair_started_at TIMESTAMPTZ,
          repair_finished_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS qa_runs_build_round_unique
          ON qa_runs(build_job_id, round_number);
        CREATE UNIQUE INDEX IF NOT EXISTS qa_runs_idempotency_unique
          ON qa_runs(qa_idempotency_key);
        CREATE INDEX IF NOT EXISTS qa_runs_status_idx
          ON qa_runs(status, updated_at);
        CREATE INDEX IF NOT EXISTS qa_runs_build_job_idx
          ON qa_runs(build_job_id, round_number);
        CREATE INDEX IF NOT EXISTS qa_runs_opportunity_idx
          ON qa_runs(opportunity_id, created_at);

        CREATE TABLE IF NOT EXISTS qa_run_events (
          id SERIAL PRIMARY KEY,
          qa_run_id INTEGER NOT NULL REFERENCES qa_runs(id) ON DELETE CASCADE,
          build_job_id INTEGER NOT NULL REFERENCES build_jobs(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS qa_run_events_run_idx
          ON qa_run_events(qa_run_id, occurred_at);
        CREATE INDEX IF NOT EXISTS qa_run_events_build_job_idx
          ON qa_run_events(build_job_id, occurred_at);
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
    [[...REQUIRED_QA_RUNTIME_TABLES]],
  );
  const present = new Set(verification.rows.map((row) => row.table_name));
  const missing = REQUIRED_QA_RUNTIME_TABLES.filter((table) => !present.has(table));
  if (missing.length) {
    throw new Error(`Autonomous QA schema incomplete after migration. Missing: ${missing.join(", ")}`);
  }
  return { appliedMigrationIds, requiredTables: REQUIRED_QA_RUNTIME_TABLES };
}
