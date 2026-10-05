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
  getQuizDef,
  scoreMcqQuiz,
  scoreMultiselectQuiz,
  isPerfectAttempt,
} from "./quiz-catalog";

export class QuizError extends Error {}

export type QuizAnswers = { stage1Order: string[]; stage2Order: string[] };

// The shape submitGenericQuizAttempt (below) stores for every Weeks 4-6
// quiz. Exported so callers that read across multiple quiz weeks at once
// (getTeamQuizBreakdown) can narrow QuizAttempt.answers correctly by
// checking which quiz produced a given row.
export type GenericStoredAnswers = { raw: number[][] | string[]; correct: number; total: number };

// The Week 2 ranking quiz's own attempt shape — guaranteed by
// getQuizAttempts/submitQuizAttempt's quizId filter below, so callers
// working with those two functions specifically can rely on `answers`
// always being QuizAnswers, no narrowing needed.
export type RankQuizAttempt = {
  score: number;
  maxScore: number;
  answers: QuizAnswers;
  completedAt: Date;
};

export type QuizAttempt = {
  score: number;
  maxScore: number;
  // QuizAnswers for the Week 2 ranking quiz; GenericStoredAnswers for any
  // other quiz — getTeamQuizBreakdown (the only place this general type is
  // used) pools rows across quizzes sharing a week, so its callers must
  // narrow by week/quizId before reading this.
  answers: QuizAnswers | GenericStoredAnswers;
  completedAt: Date;
};

/** Returns every attempt one student has made at the Week 2 quiz, oldest first. Empty if none yet. */
export async function getQuizAttempts(studentId: string): Promise<RankQuizAttempt[]> {
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
): Promise<RankQuizAttempt> {
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
      // Rows here can come from any quiz sharing this week (e.g. Week 6's
      // argument pair) — narrow by week/quizId before reading this field.
      answers: JSON.parse(row.answers) as QuizAnswers | GenericStoredAnswers,
      completedAt: row.completedAt,
    });
    byStudent.set(row.studentId, entry);
  }

  return [...byStudent.values()];
}

// =====================================================================
// Generic path for the Weeks 4-6 mcq/multiselect quizzes (quiz-catalog.ts's
// QUIZ_DEFS). Unlike the Week 2 functions above, these are parameterized by
// quizId rather than hardcoded to one quiz — every quiz in QUIZ_DEFS shares
// this same storage shape in quizAttempts: `score`/`maxScore` stay on the
// same 0-3 trust-bonus scale as Week 2 (not the raw question count), so
// getTeamQuizAverage above works unchanged for these weeks too, purely by
// filtering on `week` — which is also why two quizzes sharing a week (the
// Week 6 argument pair) pool together into one average, each student's
// best score across either one counting.
// =====================================================================

export type GenericQuizAnswers = number[][] | string[];

export type GenericQuizAttempt = {
  score: number; // 0-3, same scale as the stored trust bonus
  maxScore: number;
  correct: number; // raw correct-question count (mcq) or points (multiselect) — for feedback display, not the trust bonus itself
  total: number; // raw question count (mcq) or genuine-flaw count (multiselect)
  answers: GenericQuizAnswers;
  completedAt: Date;
};

/** Every attempt one student has made at a given Weeks 4-6 quiz, oldest first. */
export async function getGenericQuizAttempts(studentId: string, quizId: string): Promise<GenericQuizAttempt[]> {
  const rows = await db.query.quizAttempts.findMany({
    where: and(eq(quizAttempts.studentId, studentId), eq(quizAttempts.quizId, quizId)),
    orderBy: asc(quizAttempts.completedAt),
  });

  return rows.map((row) => {
    const stored = JSON.parse(row.answers) as GenericStoredAnswers;
    return {
      score: row.score,
      maxScore: row.maxScore,
      correct: stored.correct,
      total: stored.total,
      answers: stored.raw,
      completedAt: row.completedAt,
    };
  });
}

/** Scores and records one student's attempt at a Weeks 4-6 quiz (up to MAX_ATTEMPTS, same cap as Week 2). */
export async function submitGenericQuizAttempt(
  studentId: string,
  teamIdAtAttempt: string,
  quizId: string,
  rawAnswers: GenericQuizAnswers
): Promise<GenericQuizAttempt> {
  const quiz = getQuizDef(quizId);
  if (!quiz) throw new QuizError("Unknown quiz.");

  const existing = await getGenericQuizAttempts(studentId, quizId);
  if (existing.length >= MAX_ATTEMPTS) {
    throw new QuizError(`This quiz has already been attempted ${MAX_ATTEMPTS} times — no attempts left.`);
  }
  if (existing.some(isPerfectAttempt)) {
    throw new QuizError("You've already got every answer right — this quiz is complete.");
  }

  let score: number;
  let correct: number;
  let total: number;

  if (quiz.kind === "mcq") {
    if (!Array.isArray(rawAnswers) || rawAnswers.some((stage) => !Array.isArray(stage))) {
      throw new QuizError("Invalid answers submitted.");
    }
    const result = scoreMcqQuiz(quiz, rawAnswers as number[][]);
    score = result.bonus;
    correct = result.correct;
    total = result.total;
  } else {
    if (!Array.isArray(rawAnswers) || rawAnswers.some((id) => typeof id !== "string")) {
      throw new QuizError("Invalid answers submitted.");
    }
    const result = scoreMultiselectQuiz(quiz, rawAnswers as string[]);
    score = result.points;
    correct = result.points;
    total = result.max;
  }

  const stored: GenericStoredAnswers = { raw: rawAnswers, correct, total };

  const [row] = await db
    .insert(quizAttempts)
    .values({
      studentId,
      teamIdAtAttempt,
      quizId: quiz.id,
      week: quiz.week,
      score,
      maxScore: MAX_SCORE,
      answers: JSON.stringify(stored),
    })
    .returning();

  return { score: row.score, maxScore: row.maxScore, correct, total, answers: rawAnswers, completedAt: row.completedAt };
}
