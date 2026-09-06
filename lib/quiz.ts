import { db } from "@/db/client";
import { quizAttempts, students } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import {
  QUIZ_ID,
  QUIZ_WEEK,
  MAX_SCORE,
  MAX_ATTEMPTS,
  STAGE_1_ITEMS,
  STAGE_2_ITEMS,
  scoreAttempt,
  isValidOrder,
} from "./quiz-catalog";

export class QuizError extends Error {}

export type QuizAnswers = { stage1Order: string[]; stage2Order: string[] };

export type QuizAttempt = {
  score: number;
  maxScore: number;
  answers: QuizAnswers;
  completedAt: Date;
};

/** Returns every attempt one student has made at the Week 2 quiz, oldest first. Empty if none yet. */
export async function getQuizAttempts(studentId: string): Promise<QuizAttempt[]> {
  const rows = await db.query.quizAttempts.findMany({
    where: and(eq(quizAttempts.studentId, studentId), eq(quizAttempts.quizId, QUIZ_ID)),
    orderBy: asc(quizAttempts.completedAt),
  });

  return rows.map((row) => ({
    score: row.score,
    maxScore: row.maxScore,
    answers: JSON.parse(row.answers) as QuizAnswers,
    completedAt: row.completedAt,
  }));
}

/**
 * Scores and records one student's attempt at the Week 2 quiz (up to
 * MAX_ATTEMPTS per student). Unlike the old team-shared version, this does
 * NOT write a trust bonus anywhere — the team's trust bonus is now a live
 * average of its members' best scores (see getTeamQuizAverage in
 * lib/actions.ts's getAllWeekState), derived on read rather than stored.
 *
 * teamIdAtAttempt is captured here and never touched again, including if
 * the student is later moved to a different team.
 */
export async function submitQuizAttempt(
  studentId: string,
  teamIdAtAttempt: string,
  stage1Order: string[],
  stage2Order: string[]
): Promise<QuizAttempt> {
  const existing = await getQuizAttempts(studentId);
  if (existing.length >= MAX_ATTEMPTS) {
    throw new QuizError(`This quiz has already been attempted ${MAX_ATTEMPTS} times — no attempts left.`);
  }

  if (!isValidOrder(stage1Order, STAGE_1_ITEMS) || !isValidOrder(stage2Order, STAGE_2_ITEMS)) {
    throw new QuizError("Invalid ranking submitted.");
  }

  const score = scoreAttempt(stage1Order, stage2Order);
  const answers: QuizAnswers = { stage1Order, stage2Order };

  const [row] = await db
    .insert(quizAttempts)
    .values({
      studentId,
      teamIdAtAttempt,
      quizId: QUIZ_ID,
      week: QUIZ_WEEK,
      score,
      maxScore: MAX_SCORE,
      answers: JSON.stringify(answers),
    })
    .returning();

  return { score: row.score, maxScore: row.maxScore, answers, completedAt: row.completedAt };
}

export type TeamQuizAverage = { average: number | null; studentsAttempted: number };

/**
 * A team's live trust-bonus input for a quiz week: each contributing
 * student's *best* score, averaged, rounded to the nearest integer, and
 * clamped to [0, MAX_SCORE]. Grouped by teamIdAtAttempt — the team a
 * student was on when they took it — not their current team, so a later
 * reassignment can never change a past week's average.
 *
 * average is null (not 0) when nobody's attempted yet, so callers can tell
 * "no data" apart from "everyone scored zero."
 */
export async function getTeamQuizAverage(teamId: string, week: number): Promise<TeamQuizAverage> {
  const rows = await db.query.quizAttempts.findMany({
    where: and(eq(quizAttempts.teamIdAtAttempt, teamId), eq(quizAttempts.week, week)),
  });

  if (rows.length === 0) return { average: null, studentsAttempted: 0 };

  const bestByStudent = new Map<string, number>();
  for (const row of rows) {
    const current = bestByStudent.get(row.studentId) ?? -Infinity;
    if (row.score > current) bestByStudent.set(row.studentId, row.score);
  }

  const bestScores = [...bestByStudent.values()];
  const rawAverage = bestScores.reduce((sum, s) => sum + s, 0) / bestScores.length;
  const rounded = Math.min(MAX_SCORE, Math.max(0, Math.round(rawAverage)));

  return { average: rounded, studentsAttempted: bestByStudent.size };
}

export type StudentQuizBreakdown = { studentId: string; studentName: string; attempts: QuizAttempt[] };

/**
 * Per-student attempt history for a team's quiz week, for the instructor
 * team-detail page. Grouped by teamIdAtAttempt (historical membership), so
 * a student who has since moved teams still appears under the team they
 * were actually on when they took it.
 */
export async function getTeamQuizBreakdown(teamId: string, week: number): Promise<StudentQuizBreakdown[]> {
  const rows = await db
    .select({
      studentId: quizAttempts.studentId,
      studentName: students.name,
      score: quizAttempts.score,
      maxScore: quizAttempts.maxScore,
      answers: quizAttempts.answers,
      completedAt: quizAttempts.completedAt,
    })
    .from(quizAttempts)
    .innerJoin(students, eq(quizAttempts.studentId, students.id))
    .where(and(eq(quizAttempts.teamIdAtAttempt, teamId), eq(quizAttempts.week, week)))
    .orderBy(asc(quizAttempts.completedAt));

  const byStudent = new Map<string, StudentQuizBreakdown>();
  for (const row of rows) {
    const entry = byStudent.get(row.studentId) ?? {
      studentId: row.studentId,
      studentName: row.studentName,
      attempts: [],
    };
    entry.attempts.push({
      score: row.score,
      maxScore: row.maxScore,
      answers: JSON.parse(row.answers) as QuizAnswers,
      completedAt: row.completedAt,
    });
    byStudent.set(row.studentId, entry);
  }

  return [...byStudent.values()];
}
