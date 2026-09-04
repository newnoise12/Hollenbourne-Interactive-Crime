import { db } from "@/db/client";
import { quizAttempts } from "@/db/schema";
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
import { setTrustBonus } from "./actions";

export class QuizError extends Error {}

export type QuizAnswers = { stage1Order: string[]; stage2Order: string[] };

export type QuizAttempt = {
  score: number;
  maxScore: number;
  answers: QuizAnswers;
  completedAt: Date;
};

/** Returns every attempt a team has made at the Week 2 quiz, oldest first. Empty if none yet. */
export async function getQuizAttempts(teamId: string): Promise<QuizAttempt[]> {
  const rows = await db.query.quizAttempts.findMany({
    where: and(eq(quizAttempts.teamId, teamId), eq(quizAttempts.quizId, QUIZ_ID)),
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
 * Scores and records one attempt at the Week 2 quiz (up to MAX_ATTEMPTS per
 * team), then grants the *best* score across all attempts so far as that
 * week's trust bonus — this quiz *is* the "institutional insight task" the
 * action economy's trust bonus refers to. A later, worse attempt never
 * lowers a trust bonus already earned by a better one.
 */
export async function submitQuizAttempt(teamId: string, stage1Order: string[], stage2Order: string[]): Promise<QuizAttempt> {
  const existing = await getQuizAttempts(teamId);
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
      teamId,
      quizId: QUIZ_ID,
      week: QUIZ_WEEK,
      score,
      maxScore: MAX_SCORE,
      answers: JSON.stringify(answers),
    })
    .returning();

  const bestScore = Math.max(score, ...existing.map((a) => a.score));
  await setTrustBonus(teamId, QUIZ_WEEK, bestScore);

  return { score: row.score, maxScore: row.maxScore, answers, completedAt: row.completedAt };
}
