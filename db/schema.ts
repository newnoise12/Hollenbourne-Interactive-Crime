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
//
// reservePoints: the permanently-accumulating case reserve (see
// lib/actions.ts's bankReservePoint) — converts 2 unspent weekly points
// into 1 reserve point. Team-wide, never resets, spendable by anyone on
// the team once non-zero, independent of any single week's budget.
export const teams = sqliteTable("teams", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  passcodeHash: text("passcode_hash").notNull(),
  reservePoints: integer("reserve_points").notNull().default(0),
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

// A named individual within a team. Teams share one login (evidence board,
// action economy stay team-shared, no individual auth there) — students
// exist only so quiz attempts can be attributed to a person rather than
// the whole team. No passwords: picking/typing a name is enough.
export const students = sqliteTable(
  "students",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("team_student_name_idx").on(table.teamId, table.name)]
);

// One row per quiz attempt by one student — answers kept as JSON text
// rather than a full normalised answers table, to keep this simple for now.
//
// teamIdAtAttempt captures the student's team *at the moment they
// submitted*, and is never updated after the fact. This is deliberate: an
// instructor can move a student to a different team later (see
// reassignStudentTeam in lib/students.ts), but a past week's team average
// must never change as a result — grouping by teamIdAtAttempt rather than
// the student's current team makes that automatic.
export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  teamIdAtAttempt: text("team_id_at_attempt")
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

// The evidence board's corkboard zone — a pin is a *reference* to an
// evidence-catalog.ts exhibit plus a board position, never a copy of its
// content, so edits to the underlying evidence data never need to
// propagate to N stored copies. One pin per team per exhibit: unpinning
// deletes the row; re-pinning creates a fresh one. Team-scoped throughout,
// one board per team, not shared globally.
export const evidencePins = sqliteTable(
  "evidence_pins",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    exhibitId: text("exhibit_id").notNull(),
    x: integer("x").notNull(),
    y: integer("y").notNull(),
    note: text("note"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("team_pin_exhibit_idx").on(table.teamId, table.exhibitId)]
);

// A labelled connection between two pinned cards — the annotation belongs
// to the relationship, not floating text on the board. Both ends reference
// evidencePins (not raw exhibit ids), so a connection only ever exists
// between two cards already on this team's board.
export const evidenceConnections = sqliteTable("evidence_connections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  fromPinId: text("from_pin_id")
    .notNull()
    .references(() => evidencePins.id, { onDelete: "cascade" }),
  toPinId: text("to_pin_id")
    .notNull()
    .references(() => evidencePins.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// A single global row (id is always the literal "singleton") holding the
// module-wide current week — the one thing every team's evidence/action
// availability is gated against. Instructor-controlled (see
// lib/module-settings.ts), not calendar-derived: gives control for
// extensions, snow days, or an early/late start rather than assuming the
// term runs exactly on schedule.
export const moduleSettings = sqliteTable("module_settings", {
  id: text("id").primaryKey().default("singleton"),
  currentWeek: integer("current_week").notNull().default(1),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// One row per student — a persistent draft, not an append-only attempt log
// like quizAttempts, since this is progress being edited (Mock CW2
// practice: pick 3 of 4 data items, cite + interpret each, then write a
// synthesis), not discrete graded submissions. Unscored: never touches
// trust bonus or quizAttempts. See lib/cw2-practice.ts.
export const cw2MockDrafts = sqliteTable(
  "cw2_mock_drafts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    selectedItemIds: text("selected_item_ids"), // JSON string[] (exactly 3 of the 4 items) | null until chosen
    responses: text("responses").notNull().default("{}"), // JSON Record<itemId, ItemResponse>
    synthesis: text("synthesis"), // nullable until written; JSON { relationship, argument }
    synthesisFeedback: text("synthesis_feedback"), // nullable JSON
    // Daily cap on AI checks (formative-feedback brief: "a sensible daily
    // cap rather than an unlimited retry loop"). checksDate is the London
    // calendar date the count applies to; a stale date means the count is 0.
    checksToday: integer("checks_today").notNull().default(0),
    checksDate: text("checks_date"),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("student_cw2_draft_idx").on(table.studentId)]
);

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
