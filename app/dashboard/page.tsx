import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getAllWeekState, getActionLog, getTeamBaselineActions, getTeamReserve } from "@/lib/actions";
import { getQuizAttempts, getGenericQuizAttempts, getTeamQuizAverage } from "@/lib/quiz";
import { ACTIONS } from "@/lib/actions-catalog";
import { ALL_QUIZ_WEEKS, QUIZ_DEFS } from "@/lib/quiz-catalog";
import { getCitationsForTeam } from "@/lib/evidence";
import { getBoard } from "@/lib/board";
import { EVIDENCE } from "@/lib/evidence-catalog";
import { getStudentById, getStudentsForTeam } from "@/lib/students";
import DashboardShell from "./DashboardShell";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);

  if (!team) {
    redirect("/login");
  }

  const studentId = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  const student = studentId ? await getStudentById(studentId) : null;
  const validStudent = student && student.teamId === team.id ? student : null;

  const [
    weekState,
    log,
    baselineActions,
    reservePoints,
    quizzesByWeek,
    citations,
    board,
    roster,
    week2Attempts,
    genericAttemptsList,
  ] = await Promise.all([
    getAllWeekState(team.id),
    getActionLog(team.id),
    getTeamBaselineActions(team.id),
    getTeamReserve(team.id),
    Promise.all(ALL_QUIZ_WEEKS.map((week) => getTeamQuizAverage(team.id, week))),
    getCitationsForTeam(team.id),
    getBoard(team.id),
    getStudentsForTeam(team.id),
    validStudent ? getQuizAttempts(validStudent.id) : Promise.resolve([]),
    validStudent
      ? Promise.all(QUIZ_DEFS.map((q) => getGenericQuizAttempts(validStudent.id, q.id)))
      : Promise.resolve(QUIZ_DEFS.map(() => [])),
  ]);

  const quizStudentsAttemptedByWeek = Object.fromEntries(
    ALL_QUIZ_WEEKS.map((week, i) => [week, quizzesByWeek[i].studentsAttempted])
  );
  const genericAttempts = Object.fromEntries(QUIZ_DEFS.map((q, i) => [q.id, genericAttemptsList[i]]));

  return (
    <DashboardShell
      teamName={team.name}
      actions={ACTIONS}
      initialWeekState={weekState}
      initialLog={log}
      quizStudentsAttemptedByWeek={quizStudentsAttemptedByWeek}
      baselineActions={baselineActions}
      initialReservePoints={reservePoints}
      evidence={EVIDENCE}
      initialCitations={citations}
      initialBoard={board}
      validStudent={validStudent}
      roster={roster}
      week2Attempts={week2Attempts}
      genericAttempts={genericAttempts}
    />
  );
}
