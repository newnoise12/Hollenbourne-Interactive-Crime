// Hollenbourne Case Review — core data model (Drizzle ORM, SQLite for local dev)
//
// Moving to Postgres for deployment later means swapping the driver import
// in db/client.ts and re-running migrations against the new database —
// this schema file itself barely changes (column types are near-identical
// between Drizzle's sqlite-core and pg-core).

import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// A team is the unit everything else hangs off — one shared login per team,
// not per student, matching the game's team-based trust mechanic.
export const teams = sqliteTable("teams", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  passcodeHash: text("passcode_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// A logged-in browser session for a team. One team can have several active
// sessions at once (different devices/members logged in simultaneously).
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// One row per team per week: trust-bonus actions earned that week, and how
// many of the total budget (baseline + bonus) they've spent. The bonus
// resets every week by design — this table is the live record of that.
export const weekActionState = sqliteTable(
  "week_action_state",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    week: integer("week").notNull(),
    trustBonus: integer("trust_bonus").notNull().default(0),
    actionsSpent: integer("actions_spent").notNull().default(0),
  },
  (table) => [uniqueIndex("team_week_idx").on(table.teamId, table.week)]
);

// Permanent record of every action a team has taken and its outcome — the
// case log. Does not reset week to week, unlike the budget table above.
export const actionLog = sqliteTable("action_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  week: integer("week").notNull(),
  actionId: text("action_id").notNull(),
  label: text("label").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// One row per exhibit a team has successfully cited. Absence of a row means
// that exhibit is still locked/uncited for that team.
export const evidenceCitations = sqliteTable(
  "evidence_citations",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    exhibitId: text("exhibit_id").notNull(),
    citationText: text("citation_text").notNull(),
    titleSpan: text("title_span"),
    citedAt: integer("cited_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("team_exhibit_idx").on(table.teamId, table.exhibitId)]
);

// One row per quiz a team has completed — answers kept as JSON text rather
// than a full normalised answers table, to keep this simple for now.
export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  quizId: text("quiz_id").notNull(),
  week: integer("week").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  answers: text("answers").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// A logged-in instructor session. Unlike `sessions`, there's no teamId —
// there's exactly one shared instructor passcode (checked against
// INSTRUCTOR_PASSCODE_HASH), not distinct instructor accounts, so a session
// here just proves "the passcode was entered," nothing more.
export const instructorSessions = sqliteTable("instructor_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});
