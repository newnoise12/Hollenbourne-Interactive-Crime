import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { connectPins, BoardError } from "@/lib/board";

export async function POST(req: NextRequest) {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { fromPinId?: string; toPinId?: string; label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { fromPinId, toPinId, label } = body;
  if (typeof fromPinId !== "string" || typeof toPinId !== "string" || typeof label !== "string") {
    return NextResponse.json({ error: "fromPinId, toPinId and label are required." }, { status: 400 });
  }

  try {
    const board = await connectPins(team.id, fromPinId, toPinId, label);
    return NextResponse.json(board);
  } catch (e) {
    if (e instanceof BoardError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/board/connections:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
