import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getAllWeekState, getActionLog } from "@/lib/actions";
import { getTeamQuizAverage } from "@/lib/quiz";
import { ACTIONS } from "@/lib/actions-catalog";
import { ALL_QUIZ_WEEKS } from "@/lib/quiz-catalog";
import ActionEconomy from "./ActionEconomy";

export default async function ActionsPage() {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);

  if (!team) {
    redirect("/login");
  }

  const [weekState, log, quizzesByWeek] = await Promise.all([
    getAllWeekState(team.id),
    getActionLog(team.id),
    Promise.all(ALL_QUIZ_WEEKS.map((week) => getTeamQuizAverage(team.id, week))),
  ]);

  const quizStudentsAttemptedByWeek = Object.fromEntries(
    ALL_QUIZ_WEEKS.map((week, i) => [week, quizzesByWeek[i].studentsAttempted])
  );

  return (
    <ActionEconomy
      actions={ACTIONS}
      initialWeekState={weekState}
      initialLog={log}
      quizStudentsAttemptedByWeek={quizStudentsAttemptedByWeek}
    />
  );
}
