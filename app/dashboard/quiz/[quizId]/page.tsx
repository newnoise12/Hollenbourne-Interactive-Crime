import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getStudentById, getStudentsForTeam } from "@/lib/students";
import { getGenericQuizAttempts } from "@/lib/quiz";
import { getQuizDef } from "@/lib/quiz-catalog";
import WhoAreYou from "../WhoAreYou";
import McqQuiz from "./McqQuiz";
import MultiselectQuiz from "./MultiselectQuiz";

export default async function GenericQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const quiz = getQuizDef(quizId);
  if (!quiz) {
    notFound();
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);

  if (!team) {
    redirect("/login");
  }

  // Same re-validation as the Week 2 quiz page — see that file's comment.
  const studentId = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  const student = studentId ? await getStudentById(studentId) : null;
  const validStudent = student && student.teamId === team.id ? student : null;

  if (!validStudent) {
    const roster = await getStudentsForTeam(team.id);
    return <WhoAreYou students={roster} />;
  }

  const attempts = await getGenericQuizAttempts(validStudent.id, quiz.id);

  if (quiz.kind === "mcq") {
    return <McqQuiz quiz={quiz} initialAttempts={attempts} studentName={validStudent.name} />;
  }
  return <MultiselectQuiz quiz={quiz} initialAttempts={attempts} studentName={validStudent.name} />;
}
