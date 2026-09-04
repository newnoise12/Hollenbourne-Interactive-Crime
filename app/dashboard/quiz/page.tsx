import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getQuizAttempts } from "@/lib/quiz";
import { STAGE_1_ITEMS, STAGE_2_ITEMS } from "@/lib/quiz-catalog";
import TrustQuiz from "./TrustQuiz";

export default async function QuizPage() {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);

  if (!team) {
    redirect("/login");
  }

  const attempts = await getQuizAttempts(team.id);

  return <TrustQuiz stage1Items={STAGE_1_ITEMS} stage2Items={STAGE_2_ITEMS} initialAttempts={attempts} />;
}
