import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getStudentById, getOrCreateStudent } from "@/lib/students";

export async function POST(req: NextRequest) {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { studentId?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { studentId, name } = body;

  let student;
  if (typeof studentId === "string") {
    const existing = await getStudentById(studentId);
    if (!existing || existing.teamId !== team.id) {
      return NextResponse.json({ error: "That student isn't on this team." }, { status: 400 });
    }
    student = existing;
  } else if (typeof name === "string" && name.trim().length > 0) {
    student = await getOrCreateStudent(team.id, name);
  } else {
    return NextResponse.json({ error: "Select a student or enter a name." }, { status: 400 });
  }

  const res = NextResponse.json({ student });
  res.cookies.set(STUDENT_COOKIE_NAME, student.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
