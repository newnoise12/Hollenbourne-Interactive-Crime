import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getStudentById } from "@/lib/students";
import { submitQuizAttempt, submitGenericQuizAttempt, QuizError, type GenericQuizAnswers } from "@/lib/quiz";
import { QUIZ_ID } from "@/lib/quiz-catalog";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const studentId = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  const student = studentId ? await getStudentById(studentId) : null;
  if (!student || student.teamId !== team.id) {
    return NextResponse.json({ error: "Select who you are first." }, { status: 400 });
  }

  let body: { quizId?: string; stage1Order?: string[]; stage2Order?: string[]; answers?: GenericQuizAnswers };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // No quizId (or the Week 2 quiz's own id) keeps the original, unchanged
  // contract: stage1Order/stage2Order in, a RankQuizAttempt out. Any other
  // quizId is a Weeks 4-6 quiz (quiz-catalog.ts's QUIZ_DEFS) and goes
  // through the generic mcq/multiselect path instead.
  if (!body.quizId || body.quizId === QUIZ_ID) {
    const { stage1Order, stage2Order } = body;
    if (!Array.isArray(stage1Order) || !Array.isArray(stage2Order)) {
      return NextResponse.json({ error: "stage1Order and stage2Order are required." }, { status: 400 });
    }

    try {
      const attempt = await submitQuizAttempt(student.id, team.id, stage1Order, stage2Order);
      return NextResponse.json({ attempt });
    } catch (e) {
      if (e instanceof QuizError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      console.error("Unexpected error in /api/quiz:", e);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  if (!Array.isArray(body.answers)) {
    return NextResponse.json({ error: "answers is required." }, { status: 400 });
  }

  try {
    const attempt = await submitGenericQuizAttempt(student.id, team.id, body.quizId, body.answers);
    return NextResponse.json({ attempt });
  } catch (e) {
    if (e instanceof QuizError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/quiz:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
