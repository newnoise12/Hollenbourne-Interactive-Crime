import { db } from "@/db/client";
import { weekActionState, actionLog } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActionItem, BASELINE_ACTIONS, MAX_TRUST_BONUS } from "./actions-catalog";
import { QUIZ_WEEK } from "./quiz-catalog";
import { getTeamQuizAverage } from "./quiz";

export class ActionsError extends Error {}

export type WeekState = { trustBonus: number; actionsSpent: number };
export type WeekStateMap = Record<number, WeekState>;

export type LogEntry = {
  week: number;
  actionId: string;
  label: string;
  outcome: string;
  createdAt: Date;
};

/**
 * A week's trust bonus, resolved from whichever source actually governs it:
 * for the quiz week, that's the live average of the team's quiz scores
 * (see getTeamQuizAverage, lib/quiz.ts) — never the stored column, which
 * nothing writes to for that week any more. Every other week still reads
 * the manually-set stored value.
 */
async function resolveTrustBonus(teamId: string, week: number, storedTrustBonus: number): Promise<number> {
  if (week === QUIZ_WEEK) {
    const { average } = await getTeamQuizAverage(teamId, week);
    return average ?? 0;
  }
  return storedTrustBonus;
}

/** Reads every week's trust bonus + spend for a team, keyed by week number. */
export async function getAllWeekState(teamId: string): Promise<WeekStateMap> {
  const rows = await db.query.weekActionState.findMany({
    where: eq(weekActionState.teamId, teamId),
  });

  const map: WeekStateMap = {};
  for (const row of rows) {
    map[row.week] = { trustBonus: await resolveTrustBonus(teamId, row.week, row.trustBonus), actionsSpent: row.actionsSpent };
  }
  // The quiz week's trust bonus can be live even before any actions have
  // been taken (and so before any weekActionState row exists) — make sure
  // it still shows up rather than defaulting to 0 baseline-only.
  if (!(QUIZ_WEEK in map)) {
    const trustBonus = await resolveTrustBonus(teamId, QUIZ_WEEK, 0);
    if (trustBonus > 0) map[QUIZ_WEEK] = { trustBonus, actionsSpent: 0 };
  }
  return map;
}

/** Reads the full permanent action log for a team, newest first. Does not reset week to week. */
export async function getActionLog(teamId: string): Promise<LogEntry[]> {
  const rows = await db.query.actionLog.findMany({
    where: eq(actionLog.teamId, teamId),
    orderBy: desc(actionLog.createdAt),
  });

  return rows.map((row) => ({
    week: row.week,
    actionId: row.actionId,
    label: row.label,
    outcome: row.outcome,
    createdAt: row.createdAt,
  }));
}

async function getWeekRow(teamId: string, week: number) {
  return db.query.weekActionState.findFirst({
    where: and(eq(weekActionState.teamId, teamId), eq(weekActionState.week, week)),
  });
}

/**
 * Sets a team's trust bonus for a given week (clamped 0-MAX_TRUST_BONUS).
 * Rejected for the quiz week — that value is computed live from quiz
 * scores (see resolveTrustBonus above) and manual edits would either be
 * silently overridden or, worse, visibly ignored.
 */
export async function setTrustBonus(teamId: string, week: number, trustBonus: number): Promise<WeekState> {
  if (week === QUIZ_WEEK) {
    throw new ActionsError("This week's trust bonus is set automatically from the quiz average and can't be edited manually.");
  }

  const clamped = Math.min(MAX_TRUST_BONUS, Math.max(0, Math.round(trustBonus)));

  const [row] = await db
    .insert(weekActionState)
    .values({ teamId, week, trustBonus: clamped, actionsSpent: 0 })
    .onConflictDoUpdate({
      target: [weekActionState.teamId, weekActionState.week],
      set: { trustBonus: clamped },
    })
    .returning();

  return { trustBonus: row.trustBonus, actionsSpent: row.actionsSpent };
}

/**
 * Spends the given action's cost against a team's weekly budget and records
 * it in the permanent action log. Remaining budget is always recomputed from
 * the current DB row (and, for the quiz week, the live quiz average) — a
 * client-sent "remaining" is never trusted.
 */
export async function takeAction(teamId: string, week: number, actionId: string): Promise<{ weekState: WeekState; logEntry: LogEntry }> {
  const action = getActionItem(actionId);
  if (!action) throw new ActionsError("Unknown action.");

  if (action.prerequisiteActionId) {
    const prereqDone = await db.query.actionLog.findFirst({
      where: and(eq(actionLog.teamId, teamId), eq(actionLog.actionId, action.prerequisiteActionId)),
    });
    if (!prereqDone) {
      throw new ActionsError("This action's prerequisite hasn't been completed yet.");
    }
  }

  const existing = await getWeekRow(teamId, week);
  const trustBonus = await resolveTrustBonus(teamId, week, existing?.trustBonus ?? 0);
  const actionsSpent = existing?.actionsSpent ?? 0;
  const remaining = BASELINE_ACTIONS + trustBonus - actionsSpent;

  if (remaining < action.cost) {
    throw new ActionsError("Not enough actions remaining this week.");
  }

  const nextSpent = actionsSpent + action.cost;

  const [weekRow] = await db
    .insert(weekActionState)
    .values({ teamId, week, trustBonus: 0, actionsSpent: nextSpent })
    .onConflictDoUpdate({
      target: [weekActionState.teamId, weekActionState.week],
      set: { actionsSpent: nextSpent },
    })
    .returning();

  const [logRow] = await db
    .insert(actionLog)
    .values({ teamId, week, actionId: action.id, label: action.label, outcome: action.outcome })
    .returning();

  return {
    weekState: { trustBonus, actionsSpent: weekRow.actionsSpent },
    logEntry: {
      week: logRow.week,
      actionId: logRow.actionId,
      label: logRow.label,
      outcome: logRow.outcome,
      createdAt: logRow.createdAt,
    },
  };
}
