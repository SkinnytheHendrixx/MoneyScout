import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const runtimeSchemaMigrationsTable = pgTable("runtime_schema_migrations", {
  id: text("id").primaryKey(),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});
