import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { setCurrentWeek } from "@/lib/module-settings";

export async function POST(req: NextRequest) {
  const sessionId = (await cookies()).get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (!(await isValidInstructorSession(sessionId))) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { week?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { week } = body;
  if (typeof week !== "number" || !Number.isFinite(week)) {
    return NextResponse.json({ error: "week is required." }, { status: 400 });
  }

  const currentWeek = await setCurrentWeek(week);
  return NextResponse.json({ ok: true, currentWeek });
}
