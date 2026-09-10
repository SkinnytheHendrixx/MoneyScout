import assert from "node:assert/strict";
import { pool, prepareRuntimeSchema, REQUIRED_RUNTIME_TABLES } from "@workspace/db";

const first = await prepareRuntimeSchema(pool);
assert.deepEqual(first.requiredTables, REQUIRED_RUNTIME_TABLES);

const second = await prepareRuntimeSchema(pool);
assert.equal(second.appliedMigrationIds.length, 0, "runtime migrations must be idempotent");

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
assert.equal(marker.rowCount, 1, "runtime migration marker should be persisted exactly once");

await pool.end();
console.log("PASS zero-cost runtime migrations");
