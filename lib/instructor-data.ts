import { db } from "@/db/client";
import { teams, actionLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAllWeekState, getActionLog, getTeamBaselineActions } from "./actions";
import { getTeamQuizAverage, getTeamQuizBreakdown } from "./quiz";
import { getCurrentWeek } from "./module-settings";
import { EVIDENCE, isEvidenceUnlocked, type EvidenceItem } from "./evidence-catalog";
import { QUIZ_WEEK, ALL_QUIZ_WEEKS } from "./quiz-catalog";

export type TeamSummary = {
  id: string;
  name: string;
  createdAt: Date;
  unlockedCount: number;
  totalEvidenceCount: number;
  quizAverage: number | null;
  quizStudentsAttempted: number;
  totalActionsSpent: number;
  reservePoints: number;
};

function countUnlocked(evidence: EvidenceItem[], currentWeek: number, completedActionIds: Set<string>): number {
  return evidence.filter((e) => isEvidenceUnlocked(e, currentWeek, completedActionIds)).length;
}

/** One summary row per team, for the instructor overview table. */
export async function getAllTeamsSummary(): Promise<TeamSummary[]> {
  const [allTeams, currentWeek] = await Promise.all([db.query.teams.findMany(), getCurrentWeek()]);

  return Promise.all(
    allTeams.map(async (team) => {
      const [log, quiz] = await Promise.all([
        db.query.actionLog.findMany({ where: eq(actionLog.teamId, team.id) }),
        getTeamQuizAverage(team.id, QUIZ_WEEK),
      ]);
      const completedActionIds = new Set(log.map((entry) => entry.actionId));

      return {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt,
        unlockedCount: countUnlocked(EVIDENCE, currentWeek, completedActionIds),
        totalEvidenceCount: EVIDENCE.length,
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
  currentWeek: number;
  unlockedEvidence: EvidenceItem[];
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

  const [currentWeek, weekState, log, quizWeeks, baselineActions] = await Promise.all([
    getCurrentWeek(),
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

  const completedActionIds = new Set(log.map((entry) => entry.actionId));
  const unlockedEvidence = EVIDENCE.filter((e) => isEvidenceUnlocked(e, currentWeek, completedActionIds));

  return {
    team: { id: team.id, name: team.name, createdAt: team.createdAt, reservePoints: team.reservePoints },
    currentWeek,
    unlockedEvidence,
    weekState,
    log,
    baselineActions,
    quizWeeks,
  };
}
