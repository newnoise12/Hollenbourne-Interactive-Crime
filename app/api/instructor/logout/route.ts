import { NextRequest, NextResponse } from "next/server";
import { destroyInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await destroyInstructorSession(sessionId);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(INSTRUCTOR_SESSION_COOKIE_NAME);
  return res;
}
