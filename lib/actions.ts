import { db } from "@/db/client";
import { weekActionState, actionLog, teams } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActionItem, MAX_TRUST_BONUS } from "./actions-catalog";
import { ALL_QUIZ_WEEKS } from "./quiz-catalog";
import { getTeamQuizAverage } from "./quiz";
import { getStudentsForTeam } from "./students";

const QUIZ_WEEK_SET = new Set(ALL_QUIZ_WEEKS);

export class ActionsError extends Error {}

export type WeekState = { trustBonus: number; actionsSpent: number };
export type WeekStateMap = Record<number, WeekState>;

/**
 * A team's weekly baseline: 1 action point per student, per week, per the
 * authoritative spec (Reference/case-content/mechanics/hollenbourne-action-economy.md)
 * — not a flat per-team constant. Floored at 1 so a team with no students
 * recorded yet (nobody's taken the quiz, which is the only thing that adds
 * a student row) isn't locked out entirely; team size is read live from the
 * roster rather than stored, so it naturally follows instructor reassignments.
 */
export async function getTeamBaselineActions(teamId: string): Promise<number> {
  const roster = await getStudentsForTeam(teamId);
  return Math.max(1, roster.length);
}

/** A team's permanent, never-resetting case-reserve balance (see bankReservePoint below). */
export async function getTeamReserve(teamId: string): Promise<number> {
  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) });
  return team?.reservePoints ?? 0;
}

/**
 * Whether a team can currently bank: requires having earned a trust bonus
 * this week (a team with only the baseline can't bank — see
 * hollenbourne-action-economy.md) and at least 2 unspent points available.
 */
export function canBank(trustBonus: number, remaining: number): boolean {
  return trustBonus > 0 && remaining >= 2;
}

export type LogEntry = {
  week: number;
  actionId: string;
  label: string;
  outcome: string;
  createdAt: Date;
};

/**
 * A week's trust bonus, resolved from whichever source actually governs it:
 * for any quiz week (ALL_QUIZ_WEEKS — Week 2's ranking quiz, plus every
 * quiz in quiz-catalog.ts's QUIZ_DEFS), that's the live average of the
 * team's quiz scores (see getTeamQuizAverage, lib/quiz.ts) — never the
 * stored column, which nothing writes to for those weeks any more. Every
 * other week still reads the manually-set stored value. Two quizzes can
 * share a week (Week 6's pair of argument quizzes) — getTeamQuizAverage
 * pools every attempt tagged with that week regardless of which quiz it
 * came from, taking each student's best score across either one.
 */
async function resolveTrustBonus(teamId: string, week: number, storedTrustBonus: number): Promise<number> {
  if (QUIZ_WEEK_SET.has(week)) {
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
  // A quiz week's trust bonus can be live even before any actions have been
  // taken (and so before any weekActionState row exists) — make sure it
  // still shows up rather than defaulting to 0 baseline-only, for every
  // quiz week, not just Week 2.
  for (const week of ALL_QUIZ_WEEKS) {
    if (!(week in map)) {
      const trustBonus = await resolveTrustBonus(teamId, week, 0);
      if (trustBonus > 0) map[week] = { trustBonus, actionsSpent: 0 };
    }
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
  if (QUIZ_WEEK_SET.has(week)) {
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
 * Spends the given action's cost and records it in the permanent action
 * log. By default draws from the team's weekly budget; pass useReserve to
 * pay from the team's permanent case reserve instead (see
 * getTeamReserve/bankReservePoint) — the two pools never mix in one call.
 * Remaining budget/reserve is always recomputed from the current DB row
 * (and, for a quiz week, the live quiz average) — a client-sent "remaining"
 * is never trusted.
 */
export async function takeAction(
  teamId: string,
  week: number,
  actionId: string,
  useReserve = false
): Promise<{ weekState: WeekState; reservePoints: number; logEntry: LogEntry }> {
  const action = getActionItem(actionId);
  if (!action) throw new ActionsError("Unknown action.");

  if (action.availableFromWeek && week < action.availableFromWeek) {
    throw new ActionsError(`This action isn't available until Week ${action.availableFromWeek}.`);
  }

  if (action.prerequisiteActionIds?.length) {
    for (const prereqId of action.prerequisiteActionIds) {
      const prereqDone = await db.query.actionLog.findFirst({
        where: and(eq(actionLog.teamId, teamId), eq(actionLog.actionId, prereqId)),
      });
      if (!prereqDone) {
        throw new ActionsError("This action's prerequisites haven't all been completed yet.");
      }
    }
  }

  const existing = await getWeekRow(teamId, week);
  const trustBonus = await resolveTrustBonus(teamId, week, existing?.trustBonus ?? 0);
  const actionsSpent = existing?.actionsSpent ?? 0;

  let weekRow: { trustBonus: number; actionsSpent: number };

  if (useReserve) {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) });
    if (!team) throw new ActionsError("Team not found.");
    if (team.reservePoints < action.cost) {
      throw new ActionsError("Not enough case-reserve points.");
    }
    await db
      .update(teams)
      .set({ reservePoints: team.reservePoints - action.cost })
      .where(eq(teams.id, teamId));
    weekRow = { trustBonus, actionsSpent };
  } else {
    const baseline = await getTeamBaselineActions(teamId);
    const remaining = baseline + trustBonus - actionsSpent;
    if (remaining < action.cost) {
      throw new ActionsError("Not enough actions remaining this week.");
    }

    const nextSpent = actionsSpent + action.cost;
    const [row] = await db
      .insert(weekActionState)
      .values({ teamId, week, trustBonus: 0, actionsSpent: nextSpent })
      .onConflictDoUpdate({
        target: [weekActionState.teamId, weekActionState.week],
        set: { actionsSpent: nextSpent },
      })
      .returning();
    weekRow = { trustBonus, actionsSpent: row.actionsSpent };
  }

  const [logRow] = await db
    .insert(actionLog)
    .values({ teamId, week, actionId: action.id, label: action.label, outcome: action.outcome })
    .returning();

  const reservePoints = await getTeamReserve(teamId);

  return {
    weekState: weekRow,
    reservePoints,
    logEntry: {
      week: logRow.week,
      actionId: logRow.actionId,
      label: logRow.label,
      outcome: logRow.outcome,
      createdAt: logRow.createdAt,
    },
  };
}

/**
 * Converts 2 of a team's unspent weekly points into 1 permanent case-reserve
 * point (see canBank above for eligibility). Logged in the permanent action
 * log like any other action, so it shows up in the case log for
 * transparency, but it isn't in actions-catalog.ts since it's a budget
 * operation, not an investigation action.
 */
export async function bankReservePoint(teamId: string, week: number): Promise<{ weekState: WeekState; reservePoints: number }> {
  const existing = await getWeekRow(teamId, week);
  const trustBonus = await resolveTrustBonus(teamId, week, existing?.trustBonus ?? 0);
  const actionsSpent = existing?.actionsSpent ?? 0;
  const baseline = await getTeamBaselineActions(teamId);
  const remaining = baseline + trustBonus - actionsSpent;

  if (!canBank(trustBonus, remaining)) {
    throw new ActionsError("Banking requires having earned a trust bonus this week, and at least 2 unspent points.");
  }

  const nextSpent = actionsSpent + 2;
  const [weekRow] = await db
    .insert(weekActionState)
    .values({ teamId, week, trustBonus: 0, actionsSpent: nextSpent })
    .onConflictDoUpdate({
      target: [weekActionState.teamId, weekActionState.week],
      set: { actionsSpent: nextSpent },
    })
    .returning();

  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) });
  if (!team) throw new ActionsError("Team not found.");
  const [updatedTeam] = await db
    .update(teams)
    .set({ reservePoints: team.reservePoints + 1 })
    .where(eq(teams.id, teamId))
    .returning();

  await db.insert(actionLog).values({
    teamId,
    week,
    actionId: "bank-reserve",
    label: "Banked 2 weekly points into the case reserve",
    outcome: "+1 case reserve point.",
  });

  return { weekState: { trustBonus, actionsSpent: weekRow.actionsSpent }, reservePoints: updatedTeam.reservePoints };
}
