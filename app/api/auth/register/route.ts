import { NextRequest, NextResponse } from "next/server";
import { createTeam, createSession, AuthError } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export async function POST(req: NextRequest) {
  let body: { name?: string; passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, passcode } = body;
  if (typeof name !== "string" || typeof passcode !== "string") {
    return NextResponse.json({ error: "Team name and passcode are required." }, { status: 400 });
  }

  try {
    const team = await createTeam(name, passcode);
    const session = await createSession(team.id);

    const res = NextResponse.json({ team: { id: team.id, name: team.name } });
    res.cookies.set(SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return res;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/auth/register:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
