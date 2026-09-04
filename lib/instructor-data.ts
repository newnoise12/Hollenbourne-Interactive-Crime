import { db } from "@/db/client";
import { teams, evidenceCitations, actionLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCitationsForTeam } from "./evidence";
import { getAllWeekState, getActionLog } from "./actions";
import { getQuizAttempts } from "./quiz";
import { EVIDENCE } from "./evidence-catalog";
import { MAX_ATTEMPTS } from "./quiz-catalog";

export type TeamSummary = {
  id: string;
  name: string;
  createdAt: Date;
  citedCount: number;
  citableCount: number;
  quizBestScore: number | null;
  quizMaxScore: number | null;
  quizAttemptsUsed: number;
  quizMaxAttempts: number;
  totalActionsSpent: number;
};

const CITABLE_COUNT = EVIDENCE.filter((e) => !e.locked).length;

/** One summary row per team, for the instructor overview table. */
export async function getAllTeamsSummary(): Promise<TeamSummary[]> {
  const allTeams = await db.query.teams.findMany();

  return Promise.all(
    allTeams.map(async (team) => {
      const [citations, log, attempts] = await Promise.all([
        db.query.evidenceCitations.findMany({ where: eq(evidenceCitations.teamId, team.id) }),
        db.query.actionLog.findMany({ where: eq(actionLog.teamId, team.id) }),
        getQuizAttempts(team.id),
      ]);

      const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;

      return {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt,
        citedCount: citations.length,
        citableCount: CITABLE_COUNT,
        quizBestScore: bestScore,
        quizMaxScore: attempts[0]?.maxScore ?? null,
        quizAttemptsUsed: attempts.length,
        quizMaxAttempts: MAX_ATTEMPTS,
        totalActionsSpent: log.length, // one row per action taken; cost is implicit in the catalog, count is enough for an at-a-glance summary
      };
    })
  );
}

export type TeamDetail = {
  team: { id: string; name: string; createdAt: Date };
  citations: Awaited<ReturnType<typeof getCitationsForTeam>>;
  weekState: Awaited<ReturnType<typeof getAllWeekState>>;
  log: Awaited<ReturnType<typeof getActionLog>>;
  quizAttempts: Awaited<ReturnType<typeof getQuizAttempts>>;
};

/** Full detail for one team — reuses the same queries the team's own dashboard pages use. */
export async function getTeamDetail(teamId: string): Promise<TeamDetail | null> {
  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) });
  if (!team) return null;

  const [citations, weekState, log, quizAttempts] = await Promise.all([
    getCitationsForTeam(team.id),
    getAllWeekState(team.id),
    getActionLog(team.id),
    getQuizAttempts(team.id),
  ]);

  return {
    team: { id: team.id, name: team.name, createdAt: team.createdAt },
    citations,
    weekState,
    log,
    quizAttempts,
  };
}
