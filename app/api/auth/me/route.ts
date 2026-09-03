import { NextRequest, NextResponse } from "next/server";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);

  if (!team) {
    return NextResponse.json({ team: null }, { status: 200 });
  }
  return NextResponse.json({ team: { id: team.id, name: team.name } });
}
