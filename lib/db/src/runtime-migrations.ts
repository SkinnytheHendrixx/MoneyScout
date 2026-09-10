import type { Pool, PoolClient } from "pg";

export const REQUIRED_RUNTIME_TABLES = [
  "evaluation_cycles",
  "watch_registrations",
  "opportunity_runtime_state",
  "lifecycle_events",
  "portfolio_heartbeat_runs",
  "capabilities",
  "human_actions",
  "execution_jobs",
  "execution_job_events",
  "build_jobs",
] as const;

type RuntimeMigration = {
  id: string;
  apply: (client: PoolClient) => Promise<void>;
};

const createEnumIfMissing = async (
  client: PoolClient,
  name: string,
  values: readonly string[],
): Promise<void> => {
  const escapedValues = values.map((value) => `'${value.replaceAll("'", "''")}'`).join(", ");
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE ${name} AS ENUM (${escapedValues});
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

const migrations: RuntimeMigration[] = [
  {
    id: "2026-09-09-autonomy-operational-tables-v1",
    apply: async (client) => {
      const prerequisite = await client.query<{ opportunities: string | null }>(
        "SELECT to_regclass('public.opportunities')::text AS opportunities",
      );
      if (!prerequisite.rows[0]?.opportunities) {
        throw new Error(
          "Runtime migration prerequisite failed: public.opportunities does not exist. Apply the base Money Scout schema before starting the API.",
        );
      }

      await createEnumIfMissing(client, "evaluation_cycle_status", [
        "ACTIVE",
        "COMPLETED",
        "SUPERSEDED",
      ]);
      await createEnumIfMissing(client, "watch_registration_status", [
        "ACTIVE",
        "TRIGGERED",
        "CLOSED",
      ]);
      await createEnumIfMissing(client, "portfolio_heartbeat_status", [
        "RUNNING",
        "COMPLETE",
        "PARTIAL",
        "FAILED",
      ]);
      await createEnumIfMissing(client, "human_action_status", [
        "OPEN",
        "VERIFYING",
        "RESOLVED",
        "CANCELLED",
      ]);
      await createEnumIfMissing(client, "human_action_urgency", [
        "CRITICAL",
        "HIGH",
        "NORMAL",
        "LOW",
      ]);
      await createEnumIfMissing(client, "human_action_verification_mode", [
        "AUTOMATED_CHECK",
        "HUMAN_ATTESTATION",
        "EXTERNAL_CALLBACK",
      ]);
      await createEnumIfMissing(client, "capability_status", [
        "AVAILABLE",
        "PENDING",
        "MISSING",
        "EXPIRED",
        "REVOKED",
      ]);
      await createEnumIfMissing(client, "execution_job_status", [
        "QUEUED",
        "RUNNING",
        "WAITING",
        "HUMAN_BLOCKED",
        "WATCHING",
        "SUCCEEDED",
        "FAILED_TERMINAL",
        "CANCELLED",
      ]);
      await createEnumIfMissing(client, "execution_failure_class", [
        "TRANSIENT_INFRASTRUCTURE",
        "PROVIDER_NOT_READY",
        "ALREADY_RUNNING",
        "AUTHORIZATION_REQUIRED",
        "STAGE_FAILURE",
        "INTERRUPTED_UNKNOWN_OUTCOME",
        "INTERNAL_CAPABILITY_MISSING",
        "UNSUPPORTED_ACTION",
        "UNKNOWN",
      ]);
      await createEnumIfMissing(client, "build_job_status", [
        "ORCHESTRATING",
        "READY_FOR_BUILDER",
        "BUILDER_DISPATCHED",
        "BUILDING",
        "QA_PENDING",
        "COMPLETE",
        "BLOCKED",
        "FAILED",
        "CANCELLED",
      ]);

      await client.query(`
        CREATE TABLE IF NOT EXISTS evaluation_cycles (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          cycle_number INTEGER NOT NULL,
          status evaluation_cycle_status NOT NULL DEFAULT 'ACTIVE',
          trigger_type TEXT NOT NULL,
          trigger_reason TEXT NOT NULL,
          trigger_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          completed_at TIMESTAMPTZ
        );
        CREATE UNIQUE INDEX IF NOT EXISTS evaluation_cycles_opportunity_number_unique
          ON evaluation_cycles(opportunity_id, cycle_number);
        CREATE UNIQUE INDEX IF NOT EXISTS evaluation_cycles_one_active_per_opportunity
          ON evaluation_cycles(opportunity_id) WHERE status = 'ACTIVE';
        CREATE INDEX IF NOT EXISTS evaluation_cycles_opportunity_idx
          ON evaluation_cycles(opportunity_id, started_at);

        CREATE TABLE IF NOT EXISTS watch_registrations (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          problem TEXT NOT NULL,
          reason TEXT NOT NULL,
          trigger_descriptions TEXT[] NOT NULL DEFAULT '{}'::text[],
          baseline JSONB NOT NULL DEFAULT '{}'::jsonb,
          status watch_registration_status NOT NULL DEFAULT 'ACTIVE',
          registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_checked_at TIMESTAMPTZ,
          next_check_at TIMESTAMPTZ,
          triggered_at TIMESTAMPTZ,
          trigger_evidence JSONB,
          check_count INTEGER NOT NULL DEFAULT 0
        );
        CREATE UNIQUE INDEX IF NOT EXISTS watch_registrations_one_active_per_opportunity
          ON watch_registrations(opportunity_id) WHERE status = 'ACTIVE';
        CREATE INDEX IF NOT EXISTS watch_registrations_status_idx
          ON watch_registrations(status, next_check_at);
        CREATE INDEX IF NOT EXISTS watch_registrations_opportunity_idx
          ON watch_registrations(opportunity_id, registered_at);

        CREATE TABLE IF NOT EXISTS opportunity_runtime_state (
          opportunity_id INTEGER PRIMARY KEY REFERENCES opportunities(id) ON DELETE CASCADE,
          active_evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          current_activity_key TEXT NOT NULL DEFAULT 'IDLE',
          current_activity_label TEXT NOT NULL DEFAULT 'Idle',
          activity_status TEXT NOT NULL DEFAULT 'IDLE',
          activity_started_at TIMESTAMPTZ,
          expected_duration_seconds INTEGER,
          stage_index INTEGER,
          stage_count INTEGER,
          next_action TEXT,
          eta_basis TEXT,
          last_reconciled_at TIMESTAMPTZ,
          last_lifecycle_transition_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS opportunity_runtime_state_activity_idx
          ON opportunity_runtime_state(activity_status, current_activity_key);

        CREATE TABLE IF NOT EXISTS lifecycle_events (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          event_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS lifecycle_events_opportunity_idx
          ON lifecycle_events(opportunity_id, occurred_at);
        CREATE INDEX IF NOT EXISTS lifecycle_events_type_idx
          ON lifecycle_events(event_type, occurred_at);

        CREATE TABLE IF NOT EXISTS portfolio_heartbeat_runs (
          id SERIAL PRIMARY KEY,
          status portfolio_heartbeat_status NOT NULL DEFAULT 'RUNNING',
          started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          finished_at TIMESTAMPTZ,
          scanned_opportunity_count INTEGER NOT NULL DEFAULT 0,
          watches_registered_count INTEGER NOT NULL DEFAULT 0,
          watches_checked_count INTEGER NOT NULL DEFAULT 0,
          reactivated_opportunity_count INTEGER NOT NULL DEFAULT 0,
          stale_runs_recovered_count INTEGER NOT NULL DEFAULT 0,
          research_queue_count INTEGER NOT NULL DEFAULT 0,
          errors JSONB NOT NULL DEFAULT '[]'::jsonb
        );
        CREATE INDEX IF NOT EXISTS portfolio_heartbeat_runs_started_idx
          ON portfolio_heartbeat_runs(started_at);

        CREATE TABLE IF NOT EXISTS capabilities (
          id SERIAL PRIMARY KEY,
          key TEXT NOT NULL,
          provider TEXT NOT NULL,
          status capability_status NOT NULL DEFAULT 'MISSING',
          access_level TEXT NOT NULL DEFAULT 'AUTHENTICATED',
          verification_method TEXT,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          verified_at TIMESTAMPTZ,
          expires_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS capabilities_key_unique ON capabilities(key);
        CREATE INDEX IF NOT EXISTS capabilities_status_idx ON capabilities(status, provider);

        CREATE TABLE IF NOT EXISTS human_actions (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          status human_action_status NOT NULL DEFAULT 'OPEN',
          urgency human_action_urgency NOT NULL DEFAULT 'NORMAL',
          action_type TEXT NOT NULL,
          title TEXT NOT NULL,
          why_needed TEXT NOT NULL,
          instructions TEXT NOT NULL,
          blocked_stage TEXT NOT NULL,
          required_capability_key TEXT,
          required_capability_provider TEXT,
          verification_mode human_action_verification_mode NOT NULL DEFAULT 'HUMAN_ATTESTATION',
          resume_action TEXT NOT NULL,
          resume_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          resolution_data JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          resolved_at TIMESTAMPTZ
        );
        CREATE UNIQUE INDEX IF NOT EXISTS human_actions_one_open_blocker_unique
          ON human_actions(opportunity_id, action_type, blocked_stage)
          WHERE status IN ('OPEN', 'VERIFYING');
        CREATE INDEX IF NOT EXISTS human_actions_status_urgency_idx
          ON human_actions(status, urgency, created_at);
        CREATE INDEX IF NOT EXISTS human_actions_opportunity_idx
          ON human_actions(opportunity_id, created_at);
        CREATE INDEX IF NOT EXISTS human_actions_capability_idx
          ON human_actions(required_capability_key, status);

        CREATE TABLE IF NOT EXISTS execution_jobs (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          parent_job_id INTEGER,
          action TEXT NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          status execution_job_status NOT NULL DEFAULT 'QUEUED',
          priority INTEGER NOT NULL DEFAULT 50,
          idempotency_key TEXT NOT NULL,
          attempt_count INTEGER NOT NULL DEFAULT 0,
          available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          lease_expires_at TIMESTAMPTZ,
          started_at TIMESTAMPTZ,
          finished_at TIMESTAMPTZ,
          last_error_class execution_failure_class,
          last_error_code TEXT,
          last_error_message TEXT,
          result JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS execution_jobs_idempotency_unique
          ON execution_jobs(idempotency_key);
        CREATE INDEX IF NOT EXISTS execution_jobs_due_idx
          ON execution_jobs(status, available_at, priority);
        CREATE INDEX IF NOT EXISTS execution_jobs_opportunity_idx
          ON execution_jobs(opportunity_id, created_at);
        CREATE INDEX IF NOT EXISTS execution_jobs_lease_idx
          ON execution_jobs(status, lease_expires_at);
        CREATE INDEX IF NOT EXISTS execution_jobs_cycle_idx
          ON execution_jobs(evaluation_cycle_id, created_at);

        CREATE TABLE IF NOT EXISTS execution_job_events (
          id SERIAL PRIMARY KEY,
          job_id INTEGER NOT NULL REFERENCES execution_jobs(id) ON DELETE CASCADE,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS execution_job_events_job_idx
          ON execution_job_events(job_id, occurred_at);
        CREATE INDEX IF NOT EXISTS execution_job_events_opportunity_idx
          ON execution_job_events(opportunity_id, occurred_at);

        CREATE TABLE IF NOT EXISTS build_jobs (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          evaluation_cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE SET NULL,
          idempotency_key TEXT NOT NULL,
          status build_job_status NOT NULL DEFAULT 'ORCHESTRATING',
          product_shape TEXT NOT NULL,
          supporting_shapes JSONB NOT NULL DEFAULT '[]'::jsonb,
          builder_profile TEXT NOT NULL,
          contract JSONB NOT NULL,
          external_spend_ceiling_cents INTEGER NOT NULL DEFAULT 0,
          external_spend_used_cents INTEGER NOT NULL DEFAULT 0,
          builder_workspace_id TEXT,
          blocked_reason TEXT,
          started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          finished_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS build_jobs_idempotency_unique ON build_jobs(idempotency_key);
        CREATE INDEX IF NOT EXISTS build_jobs_opportunity_idx ON build_jobs(opportunity_id, created_at);
        CREATE INDEX IF NOT EXISTS build_jobs_cycle_idx ON build_jobs(evaluation_cycle_id, created_at);
        CREATE INDEX IF NOT EXISTS build_jobs_status_idx ON build_jobs(status, updated_at);
      `);
    },
  },
];

export type RuntimeSchemaPreparationResult = {
  appliedMigrationIds: string[];
  requiredTables: readonly string[];
};

export async function prepareRuntimeSchema(targetPool: Pool): Promise<RuntimeSchemaPreparationResult> {
  const client = await targetPool.connect();
  const appliedMigrationIds: string[] = [];

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "money-scout-runtime-schema-migrations",
    ]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS runtime_schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    for (const migration of migrations) {
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM runtime_schema_migrations WHERE id = $1",
        [migration.id],
      );
      if (existing.rowCount && existing.rowCount > 0) {
        continue;
      }

      await migration.apply(client);
      await client.query("INSERT INTO runtime_schema_migrations (id) VALUES ($1)", [migration.id]);
      appliedMigrationIds.push(migration.id);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  const regclassList = REQUIRED_RUNTIME_TABLES.map((_, index) => `to_regclass($${index + 1})::text AS t${index}`);
  const schemaCheck = await targetPool.query<Record<string, string | null>>(
    `SELECT ${regclassList.join(", ")}`,
    REQUIRED_RUNTIME_TABLES.map((table) => `public.${table}`),
  );
  const row = schemaCheck.rows[0] ?? {};
  const missing = REQUIRED_RUNTIME_TABLES.filter((_, index) => !row[`t${index}`]);
  if (missing.length > 0) {
    throw new Error(
      `Runtime database schema is incomplete after migrations. Missing tables: ${missing.join(", ")}`,
    );
  }

  return {
    appliedMigrationIds,
    requiredTables: REQUIRED_RUNTIME_TABLES,
  };
}
