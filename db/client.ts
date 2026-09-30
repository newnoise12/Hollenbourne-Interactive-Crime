// Database client — SQLite via better-sqlite3, both locally (./dev.db) and
// in production (a file on a persistent volume, see README's "Deploying").
// DATABASE_URL is a plain file path either way, not a connection string.
//
// A Postgres move is possible later but isn't a drop-in swap of just this
// file — Drizzle's sqlite-core and pg-core table builders are different
// APIs, so db/schema.ts itself would need converting too. See README's
// "Stack notes" for why SQLite-in-production was the pragmatic call.

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Lazy singleton — deliberately NOT opened at module load. Next.js's build
// step imports every API route module to collect its config, which
// transitively imports this file; opening the database eagerly here fails
// the build in production, where DATABASE_URL points at a path on a
// volume that's only mounted once the container actually runs, not during
// the build. The Proxy defers the real `new Database(...)` call until
// something actually reads a property off `db`, which never happens
// during that build-time import-only pass.
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;
let instance: DrizzleDb | null = null;

function getInstance(): DrizzleDb {
  if (!instance) {
    const sqlite = new Database(process.env.DATABASE_URL ?? "./dev.db");
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    instance = drizzle(sqlite, { schema });
  }
  return instance;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getInstance(), prop, receiver);
  },
});
