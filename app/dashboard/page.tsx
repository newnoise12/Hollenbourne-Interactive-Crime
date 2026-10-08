import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getAllWeekState, getActionLog, getTeamBaselineActions, getTeamReserve } from "@/lib/actions";
import { getQuizAttempts, getGenericQuizAttempts, getTeamQuizAverage } from "@/lib/quiz";
import { ALL_QUIZ_WEEKS, QUIZ_DEFS } from "@/lib/quiz-catalog";
import { getBoard } from "@/lib/board";
import { buildTeamView } from "@/lib/team-view";
import { getCurrentWeek } from "@/lib/module-settings";
import { getStudentById, getStudentsForTeam } from "@/lib/students";
import { getDraft as getCw2Draft } from "@/lib/cw2-practice";
import { getDraft as getReferenceDraft } from "@/lib/reference-practice";
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
    currentWeek,
    weekState,
    log,
    baselineActions,
    reservePoints,
    quizzesByWeek,
    board,
    roster,
    week2Attempts,
    genericAttemptsList,
    cw2Draft,
    referenceDraft,
  ] = await Promise.all([
    getCurrentWeek(),
    getAllWeekState(team.id),
    getActionLog(team.id),
    getTeamBaselineActions(team.id),
    getTeamReserve(team.id),
    Promise.all(ALL_QUIZ_WEEKS.map((week) => getTeamQuizAverage(team.id, week))),
    getBoard(team.id),
    getStudentsForTeam(team.id),
    validStudent ? getQuizAttempts(validStudent.id) : Promise.resolve([]),
    validStudent
      ? Promise.all(QUIZ_DEFS.map((q) => getGenericQuizAttempts(validStudent.id, q.id)))
      : Promise.resolve(QUIZ_DEFS.map(() => [])),
    validStudent ? getCw2Draft(validStudent.id) : Promise.resolve(null),
    validStudent ? getReferenceDraft(validStudent.id) : Promise.resolve({}),
  ]);

  const quizStudentsAttemptedByWeek = Object.fromEntries(
    ALL_QUIZ_WEEKS.map((week, i) => [week, quizzesByWeek[i].studentsAttempted])
  );
  const genericAttempts = Object.fromEntries(QUIZ_DEFS.map((q, i) => [q.id, genericAttemptsList[i]]));

  // The only case content that leaves the server: this team's view of it (see lib/team-view.ts).
  const teamView = buildTeamView(new Set(log.map((entry) => entry.actionId)), currentWeek);

  return (
    <DashboardShell
      teamName={team.name}
      currentWeek={currentWeek}
      enquiries={teamView.enquiries}
      initialWeekState={weekState}
      initialLog={log}
      quizStudentsAttemptedByWeek={quizStudentsAttemptedByWeek}
      baselineActions={baselineActions}
      initialReservePoints={reservePoints}
      evidence={teamView.evidence}
      totalEvidence={teamView.totalEvidence}
      initialBoard={board}
      validStudent={validStudent}
      roster={roster}
      week2Attempts={week2Attempts}
      genericAttempts={genericAttempts}
      cw2Draft={cw2Draft}
      referenceDraft={referenceDraft}
    />
  );
}
