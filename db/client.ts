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

const sqlite = new Database(process.env.DATABASE_URL ?? "./dev.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
