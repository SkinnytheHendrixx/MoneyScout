import type { Pool } from "pg";

export const REQUIRED_ASSET_RUNTIME_TABLES = [
  "assets",
  "asset_health_checks",
  "asset_observations",
  "asset_incidents",
  "asset_events",
] as const;

const MIGRATION_ID = "2026-09-10-asset-operations-v1";

export async function prepareAssetOperationsSchema(targetPool: Pool): Promise<{
  appliedMigrationIds: string[];
  requiredTables: readonly string[];
}> {
  const client = await targetPool.connect();
  const appliedMigrationIds: string[] = [];
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "money-scout-asset-operations-migrations",
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
        opportunities: string | null;
        build_jobs: string | null;
        release_jobs: string | null;
        evaluation_cycles: string | null;
      }>(
        "SELECT to_regclass('public.opportunities')::text AS opportunities, to_regclass('public.build_jobs')::text AS build_jobs, to_regclass('public.release_jobs')::text AS release_jobs, to_regclass('public.evaluation_cycles')::text AS evaluation_cycles",
      );
      const row = prerequisite.rows[0];
      if (!row?.opportunities || !row?.build_jobs || !row?.release_jobs || !row?.evaluation_cycles) {
        throw new Error("Asset operations migration requires opportunities, build_jobs, release_jobs, and evaluation_cycles before API startup.");
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS assets (
          id SERIAL PRIMARY KEY,
          asset_key TEXT NOT NULL,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          activation_release_job_id INTEGER NOT NULL REFERENCES release_jobs(id) ON DELETE RESTRICT,
          current_release_job_id INTEGER NOT NULL REFERENCES release_jobs(id) ON DELETE RESTRICT,
          build_job_id INTEGER NOT NULL REFERENCES build_jobs(id) ON DELETE RESTRICT,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          name_snapshot TEXT NOT NULL,
          product_shape TEXT NOT NULL,
          target_kind TEXT NOT NULL,
          production_url TEXT NOT NULL,
          repository_url TEXT,
          branch_name TEXT,
          release_provider TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          operating_mode TEXT NOT NULL DEFAULT 'MONITOR_ONLY',
          health_status TEXT NOT NULL DEFAULT 'UNKNOWN',
          authorities JSONB NOT NULL,
          operations_policy JSONB NOT NULL,
          revenue_instrumentation_status TEXT NOT NULL DEFAULT 'UNINSTRUMENTED',
          usage_instrumentation_status TEXT NOT NULL DEFAULT 'UNINSTRUMENTED',
          support_instrumentation_status TEXT NOT NULL DEFAULT 'UNINSTRUMENTED',
          total_observed_revenue_cents INTEGER NOT NULL DEFAULT 0,
          total_observed_cost_cents INTEGER NOT NULL DEFAULT 0,
          total_observed_transactions INTEGER NOT NULL DEFAULT 0,
          consecutive_health_failures INTEGER NOT NULL DEFAULT 0,
          last_health_check_at TIMESTAMPTZ,
          next_health_check_at TIMESTAMPTZ,
          last_healthy_at TIMESTAMPTZ,
          last_error_code TEXT,
          last_error_message TEXT,
          activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS assets_key_unique ON assets(asset_key);
        CREATE UNIQUE INDEX IF NOT EXISTS assets_opportunity_unique ON assets(opportunity_id);
        CREATE UNIQUE INDEX IF NOT EXISTS assets_activation_release_unique ON assets(activation_release_job_id);
        CREATE INDEX IF NOT EXISTS assets_status_idx ON assets(status, next_health_check_at);
        CREATE INDEX IF NOT EXISTS assets_health_idx ON assets(health_status, updated_at);

        CREATE TABLE IF NOT EXISTS asset_health_checks (
          id SERIAL PRIMARY KEY,
          asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          probe_kind TEXT NOT NULL,
          url TEXT,
          reachable BOOLEAN NOT NULL,
          http_status INTEGER,
          latency_ms INTEGER,
          error_code TEXT,
          error_message TEXT,
          checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS asset_health_checks_asset_idx ON asset_health_checks(asset_id, checked_at);

        CREATE TABLE IF NOT EXISTS asset_observations (
          id SERIAL PRIMARY KEY,
          asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
          observation_type TEXT NOT NULL,
          source TEXT NOT NULL,
          idempotency_key TEXT NOT NULL,
          provenance TEXT NOT NULL DEFAULT 'UNKNOWN',
          amount_cents INTEGER,
          quantity INTEGER,
          unit TEXT,
          external_reference TEXT,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          observed_at TIMESTAMPTZ NOT NULL,
          ingested_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS asset_observations_idempotency_unique ON asset_observations(idempotency_key);
        CREATE INDEX IF NOT EXISTS asset_observations_asset_idx ON asset_observations(asset_id, observed_at);
        CREATE INDEX IF NOT EXISTS asset_observations_type_idx ON asset_observations(observation_type, observed_at);

        CREATE TABLE IF NOT EXISTS asset_incidents (
          id SERIAL PRIMARY KEY,
          asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
          incident_key TEXT NOT NULL,
          incident_type TEXT NOT NULL,
          severity TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'OPEN',
          summary TEXT NOT NULL,
          evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
          detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          resolved_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS asset_incidents_key_unique ON asset_incidents(incident_key);
        CREATE INDEX IF NOT EXISTS asset_incidents_asset_idx ON asset_incidents(asset_id, status, detected_at);

        CREATE TABLE IF NOT EXISTS asset_events (
          id SERIAL PRIMARY KEY,
          asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS asset_events_asset_idx ON asset_events(asset_id, occurred_at);
        CREATE INDEX IF NOT EXISTS asset_events_opportunity_idx ON asset_events(opportunity_id, occurred_at);
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
    [[...REQUIRED_ASSET_RUNTIME_TABLES]],
  );
  const present = new Set(verification.rows.map((row) => row.table_name));
  const missing = REQUIRED_ASSET_RUNTIME_TABLES.filter((table) => !present.has(table));
  if (missing.length) {
    throw new Error(`Asset operations schema incomplete after migration. Missing: ${missing.join(", ")}`);
  }
  return { appliedMigrationIds, requiredTables: REQUIRED_ASSET_RUNTIME_TABLES };
}
