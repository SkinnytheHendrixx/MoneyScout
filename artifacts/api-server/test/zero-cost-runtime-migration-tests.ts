import assert from "node:assert/strict";
import {
  pool,
  prepareAssetFactorySchema,
  prepareBetCapitalAllocationSchema,
  prepareRuntimeSchema,
  REQUIRED_BET_RUNTIME_TABLES,
  REQUIRED_FACTORY_RUNTIME_TABLES,
  REQUIRED_RUNTIME_TABLES,
} from "@workspace/db";

const first = await prepareRuntimeSchema(pool);
assert.deepEqual(first.requiredTables, REQUIRED_RUNTIME_TABLES);

const second = await prepareRuntimeSchema(pool);
assert.equal(
  second.appliedMigrationIds.length,
  0,
  "runtime migrations must be idempotent",
);

const verification = await pool.query<{ table_name: string }>(
  `SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
  [[...REQUIRED_RUNTIME_TABLES]],
);
const present = new Set(verification.rows.map((row) => row.table_name));
for (const table of REQUIRED_RUNTIME_TABLES) {
  assert.ok(present.has(table), `runtime migration did not ensure ${table}`);
}

const marker = await pool.query<{ id: string }>(
  "SELECT id FROM runtime_schema_migrations WHERE id = $1",
  ["2026-09-09-autonomy-operational-tables-v1"],
);
assert.equal(
  marker.rowCount,
  1,
  "runtime migration marker should be persisted exactly once",
);

const betFirst = await prepareBetCapitalAllocationSchema(pool);
assert.deepEqual(betFirst.requiredTables, REQUIRED_BET_RUNTIME_TABLES);
const betSecond = await prepareBetCapitalAllocationSchema(pool);
assert.equal(
  betSecond.appliedMigrationIds.length,
  0,
  "Bet runtime migration must be idempotent",
);
const betTables = await pool.query<{ table_name: string }>(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])",
  [[...REQUIRED_BET_RUNTIME_TABLES]],
);
assert.deepEqual(
  new Set(betTables.rows.map((row) => row.table_name)),
  new Set(REQUIRED_BET_RUNTIME_TABLES),
);
const legacyLink = await pool.query<{ is_nullable: string }>(
  "SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'build_jobs' AND column_name = 'bet_id'",
);
assert.equal(
  legacyLink.rows[0]?.is_nullable,
  "YES",
  "legacy Builds must remain valid without fabricated Bet linkage",
);

const factoryFirst = await prepareAssetFactorySchema(pool);
assert.deepEqual(factoryFirst.requiredTables, REQUIRED_FACTORY_RUNTIME_TABLES);
const factorySecond = await prepareAssetFactorySchema(pool);
assert.equal(
  factorySecond.appliedMigrationIds.length,
  0,
  "Asset Factory migration must be idempotent",
);
const factoryTables = await pool.query<{ table_name: string }>(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])",
  [[...REQUIRED_FACTORY_RUNTIME_TABLES]],
);
assert.deepEqual(
  new Set(factoryTables.rows.map((row) => row.table_name)),
  new Set(REQUIRED_FACTORY_RUNTIME_TABLES),
);
const historicalBuildCompatibility = await pool.query<{ is_nullable: string }>(
  "SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'build_jobs' AND column_name = 'factory_run_id'",
);
assert.equal(
  historicalBuildCompatibility.rows[0]?.is_nullable,
  "YES",
  "historical Builds cannot receive fabricated Factory lineage",
);

await pool.end();
console.log("PASS zero-cost runtime migrations");
