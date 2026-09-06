import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getStudentById, reassignStudentTeam } from "@/lib/students";

export async function POST(req: NextRequest) {
  const sessionId = (await cookies()).get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (!(await isValidInstructorSession(sessionId))) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { studentId?: string; newTeamId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { studentId, newTeamId } = body;
  if (typeof studentId !== "string" || typeof newTeamId !== "string") {
    return NextResponse.json({ error: "studentId and newTeamId are required." }, { status: 400 });
  }

  const student = await getStudentById(studentId);
  if (!student) {
    return NextResponse.json({ error: "Unknown student." }, { status: 404 });
  }

  await reassignStudentTeam(studentId, newTeamId);
  return NextResponse.json({ ok: true });
}
