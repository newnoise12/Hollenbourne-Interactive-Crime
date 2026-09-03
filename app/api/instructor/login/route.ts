import { NextRequest, NextResponse } from "next/server";
import { verifyInstructorPasscode, createInstructorSession, InstructorAuthError } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export async function POST(req: NextRequest) {
  let body: { passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { passcode } = body;
  if (typeof passcode !== "string") {
    return NextResponse.json({ error: "Passcode is required." }, { status: 400 });
  }

  try {
    await verifyInstructorPasscode(passcode);
    const session = await createInstructorSession();

    const res = NextResponse.json({ ok: true });
    res.cookies.set(INSTRUCTOR_SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return res;
  } catch (e) {
    if (e instanceof InstructorAuthError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    console.error("Unexpected error in /api/instructor/login:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
