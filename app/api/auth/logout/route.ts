import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await destroySession(sessionId);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  // A new team logging in on this browser shouldn't inherit whichever
  // student was last identified for the previous team.
  res.cookies.delete(STUDENT_COOKIE_NAME);
  return res;
}
