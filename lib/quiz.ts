import { db } from "@/db/client";
import { quizAttempts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { QUIZ_ID, QUIZ_WEEK, MAX_SCORE, STAGE_1_ITEMS, STAGE_2_ITEMS, scoreAttempt, isValidOrder } from "./quiz-catalog";
import { setTrustBonus } from "./actions";

export class QuizError extends Error {}

export type QuizAnswers = { stage1Order: string[]; stage2Order: string[] };

export type QuizAttempt = {
  score: number;
  maxScore: number;
  answers: QuizAnswers;
  completedAt: Date;
};

/** Returns a team's attempt at the Week 2 quiz, or null if they haven't taken it. */
export async function getQuizAttempt(teamId: string): Promise<QuizAttempt | null> {
  const row = await db.query.quizAttempts.findFirst({
    where: and(eq(quizAttempts.teamId, teamId), eq(quizAttempts.quizId, QUIZ_ID)),
  });
  if (!row) return null;

  return {
    score: row.score,
    maxScore: row.maxScore,
    answers: JSON.parse(row.answers) as QuizAnswers,
    completedAt: row.completedAt,
  };
}

/**
 * Scores and records a team's one and only attempt at the Week 2 quiz, then
 * grants the resulting score (0-3) as that week's trust bonus — this quiz
 * *is* the "institutional insight task" the action economy's trust bonus
 * refers to. Rejects a second attempt: this is a one-shot task, not a
 * retry-until-correct one, since the score directly grants a game resource.
 */
export async function submitQuizAttempt(teamId: string, stage1Order: string[], stage2Order: string[]): Promise<QuizAttempt> {
  const existing = await getQuizAttempt(teamId);
  if (existing) throw new QuizError("This quiz has already been completed.");

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

  await setTrustBonus(teamId, QUIZ_WEEK, score);

  return { score: row.score, maxScore: row.maxScore, answers, completedAt: row.completedAt };
}
