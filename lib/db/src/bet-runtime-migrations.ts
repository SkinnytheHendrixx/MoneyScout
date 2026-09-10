import type { Pool, PoolClient } from "pg";

export const REQUIRED_BET_RUNTIME_TABLES = [
  "bets",
  "bet_events",
  "bet_cost_attributions",
] as const;
const MIGRATION_ID = "2026-09-10-bet-capital-allocation-v1";

async function applied(client: PoolClient): Promise<boolean> {
  const result = await client.query(
    "SELECT id FROM runtime_schema_migrations WHERE id = $1",
    [MIGRATION_ID],
  );
  return Boolean(result.rowCount);
}

export async function prepareBetCapitalAllocationSchema(
  targetPool: Pool,
): Promise<{
  appliedMigrationIds: string[];
  requiredTables: readonly string[];
}> {
  const client = await targetPool.connect();
  const appliedMigrationIds: string[] = [];
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "money-scout-bet-capital-allocation-migrations",
    ]);
    await client.query(
      "CREATE TABLE IF NOT EXISTS runtime_schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    if (!(await applied(client))) {
      const prerequisites = await client.query<{
        opportunities: string | null;
        cycles: string | null;
        builds: string | null;
      }>(
        "SELECT to_regclass('public.opportunities')::text AS opportunities, to_regclass('public.evaluation_cycles')::text AS cycles, to_regclass('public.build_jobs')::text AS builds",
      );
      const row = prerequisites.rows[0];
      if (!row?.opportunities || !row.cycles || !row.builds)
        throw new Error(
          "Bet migration requires opportunities, evaluation_cycles, and build_jobs.",
        );
      await client.query(`
        CREATE TABLE IF NOT EXISTS bets (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          idempotency_key TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PROPOSED',
          decision_contract JSONB NOT NULL,
          resource_envelope JSONB NOT NULL,
          build_envelope JSONB NOT NULL,
          primary_risk TEXT,
          blocker_code TEXT,
          next_action TEXT NOT NULL,
          allocated_external_cash_cents INTEGER,
          committed_external_cash_cents INTEGER NOT NULL DEFAULT 0,
          consumed_external_cash_cents INTEGER NOT NULL DEFAULT 0,
          remaining_external_cash_cents INTEGER,
          approved_at TIMESTAMPTZ,
          approved_by TEXT,
          activated_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT bets_status_check CHECK (status IN ('PROPOSED','APPROVED','ACTIVE','PAUSED','SUCCEEDED','WITHDRAWN','EXHAUSTED')),
          CONSTRAINT bets_nonnegative_cash_check CHECK (
            (allocated_external_cash_cents IS NULL OR allocated_external_cash_cents >= 0) AND
            committed_external_cash_cents >= 0 AND consumed_external_cash_cents >= 0 AND
            (remaining_external_cash_cents IS NULL OR remaining_external_cash_cents >= 0)
          )
        );
        CREATE UNIQUE INDEX IF NOT EXISTS bets_idempotency_unique ON bets(idempotency_key);
        CREATE INDEX IF NOT EXISTS bets_opportunity_idx ON bets(opportunity_id, created_at);
        CREATE INDEX IF NOT EXISTS bets_status_idx ON bets(status, updated_at);
        CREATE TABLE IF NOT EXISTS bet_events (
          id SERIAL PRIMARY KEY,
          bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS bet_events_bet_idx ON bet_events(bet_id, occurred_at);
        CREATE TABLE IF NOT EXISTS bet_cost_attributions (
          id SERIAL PRIMARY KEY,
          bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
          source_type TEXT NOT NULL,
          source_id INTEGER NOT NULL,
          resource_bucket TEXT NOT NULL,
          committed_cents INTEGER NOT NULL DEFAULT 0,
          consumed_cents INTEGER NOT NULL DEFAULT 0,
          source_updated_at TIMESTAMPTZ NOT NULL,
          reconciled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          CONSTRAINT bet_cost_attributions_nonnegative_check CHECK (committed_cents >= 0 AND consumed_cents >= 0)
        );
        CREATE UNIQUE INDEX IF NOT EXISTS bet_cost_attributions_source_unique ON bet_cost_attributions(bet_id, source_type, source_id);
        CREATE INDEX IF NOT EXISTS bet_cost_attributions_bet_idx ON bet_cost_attributions(bet_id, resource_bucket);
        ALTER TABLE build_jobs ADD COLUMN IF NOT EXISTS bet_id INTEGER REFERENCES bets(id) ON DELETE RESTRICT;
        CREATE INDEX IF NOT EXISTS build_jobs_bet_idx ON build_jobs(bet_id, created_at);
      `);
      await client.query(
        "INSERT INTO runtime_schema_migrations (id) VALUES ($1)",
        [MIGRATION_ID],
      );
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
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])",
    [[...REQUIRED_BET_RUNTIME_TABLES]],
  );
  const present = new Set(verification.rows.map((row) => row.table_name));
  const missing = REQUIRED_BET_RUNTIME_TABLES.filter(
    (name) => !present.has(name),
  );
  if (missing.length)
    throw new Error(
      `Bet schema incomplete after migration. Missing: ${missing.join(", ")}`,
    );
  return { appliedMigrationIds, requiredTables: REQUIRED_BET_RUNTIME_TABLES };
}
