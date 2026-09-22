import { db } from "@/db/client";
import { teams, evidenceCitations, actionLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCitationsForTeam } from "./evidence";
import { getAllWeekState, getActionLog, getTeamBaselineActions } from "./actions";
import { getTeamQuizAverage, getTeamQuizBreakdown } from "./quiz";
import { EVIDENCE } from "./evidence-catalog";
import { QUIZ_WEEK, ALL_QUIZ_WEEKS } from "./quiz-catalog";

export type TeamSummary = {
  id: string;
  name: string;
  createdAt: Date;
  citedCount: number;
  citableCount: number;
  quizAverage: number | null;
  quizStudentsAttempted: number;
  totalActionsSpent: number;
  reservePoints: number;
};

const CITABLE_COUNT = EVIDENCE.filter((e) => !e.locked).length;

/** One summary row per team, for the instructor overview table. */
export async function getAllTeamsSummary(): Promise<TeamSummary[]> {
  const allTeams = await db.query.teams.findMany();

  return Promise.all(
    allTeams.map(async (team) => {
      const [citations, log, quiz] = await Promise.all([
        db.query.evidenceCitations.findMany({ where: eq(evidenceCitations.teamId, team.id) }),
        db.query.actionLog.findMany({ where: eq(actionLog.teamId, team.id) }),
        getTeamQuizAverage(team.id, QUIZ_WEEK),
      ]);

      return {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt,
        citedCount: citations.length,
        citableCount: CITABLE_COUNT,
        quizAverage: quiz.average,
        quizStudentsAttempted: quiz.studentsAttempted,
        totalActionsSpent: log.length, // one row per action taken; cost is implicit in the catalog, count is enough for an at-a-glance summary
        reservePoints: team.reservePoints,
      };
    })
  );
}

export type TeamQuizWeekDetail = {
  week: number;
  average: number | null;
  breakdown: Awaited<ReturnType<typeof getTeamQuizBreakdown>>;
};

export type TeamDetail = {
  team: { id: string; name: string; createdAt: Date; reservePoints: number };
  citations: Awaited<ReturnType<typeof getCitationsForTeam>>;
  weekState: Awaited<ReturnType<typeof getAllWeekState>>;
  log: Awaited<ReturnType<typeof getActionLog>>;
  baselineActions: number;
  // One entry per quiz week (Week 2's ranking quiz, plus every Weeks 4-6
  // quiz in quiz-catalog.ts's QUIZ_DEFS) — not just Week 2, so the
  // instructor's full-detail view stays complete as more quizzes land.
  quizWeeks: TeamQuizWeekDetail[];
};

/** Full detail for one team — reuses the same queries the team's own dashboard pages use. */
export async function getTeamDetail(teamId: string): Promise<TeamDetail | null> {
  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) });
  if (!team) return null;

  const [citations, weekState, log, quizWeeks, baselineActions] = await Promise.all([
    getCitationsForTeam(team.id),
    getAllWeekState(team.id),
    getActionLog(team.id),
    Promise.all(
      ALL_QUIZ_WEEKS.map(async (week) => {
        const [average, breakdown] = await Promise.all([getTeamQuizAverage(team.id, week), getTeamQuizBreakdown(team.id, week)]);
        return { week, average: average.average, breakdown };
      })
    ),
    getTeamBaselineActions(team.id),
  ]);

  return {
    team: { id: team.id, name: team.name, createdAt: team.createdAt, reservePoints: team.reservePoints },
    citations,
    weekState,
    log,
    baselineActions,
    quizWeeks,
  };
}
