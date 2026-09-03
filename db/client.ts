// Database client. Local dev: SQLite via better-sqlite3, zero external setup.
// Deployment: swap this file's contents for a Postgres client (e.g. from
// `drizzle-orm/node-postgres` or `drizzle-orm/postgres-js`) pointed at
// Railway/Render's provided connection string — the rest of the app talks
// to `db` through Drizzle's query API either way and doesn't need to change.

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database(process.env.DATABASE_URL ?? "./dev.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
