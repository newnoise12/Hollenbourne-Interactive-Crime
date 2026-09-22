import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { bankReservePoint, ActionsError } from "@/lib/actions";
import { MAX_WEEK } from "@/lib/actions-catalog";

export async function POST(req: NextRequest) {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { week?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { week } = body;
  if (typeof week !== "number" || week < 1 || week > MAX_WEEK) {
    return NextResponse.json({ error: "A valid week is required." }, { status: 400 });
  }

  try {
    const { weekState, reservePoints } = await bankReservePoint(team.id, week);
    return NextResponse.json({ weekState, reservePoints });
  } catch (e) {
    if (e instanceof ActionsError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/actions/bank:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
