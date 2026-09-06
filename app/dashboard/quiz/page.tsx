import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getStudentById, getStudentsForTeam } from "@/lib/students";
import { getQuizAttempts } from "@/lib/quiz";
import { STAGE_1_ITEMS, STAGE_2_ITEMS } from "@/lib/quiz-catalog";
import TrustQuiz from "./TrustQuiz";
import WhoAreYou from "./WhoAreYou";

export default async function QuizPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);

  if (!team) {
    redirect("/login");
  }

  // Re-validate the student against the *currently logged-in* team, not
  // just "does this student id exist" — otherwise a stale cookie from a
  // previous team on a shared computer would misattribute a quiz attempt.
  const studentId = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  const student = studentId ? await getStudentById(studentId) : null;
  const validStudent = student && student.teamId === team.id ? student : null;

  if (!validStudent) {
    const roster = await getStudentsForTeam(team.id);
    return <WhoAreYou students={roster} />;
  }

  const attempts = await getQuizAttempts(validStudent.id);

  return (
    <TrustQuiz
      stage1Items={STAGE_1_ITEMS}
      stage2Items={STAGE_2_ITEMS}
      initialAttempts={attempts}
      studentName={validStudent.name}
    />
  );
}
