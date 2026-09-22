import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getBoard, pinEvidence, BoardError } from "@/lib/board";

export async function GET() {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const board = await getBoard(team.id);
  return NextResponse.json(board);
}

export async function POST(req: NextRequest) {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { exhibitId?: string; x?: number; y?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { exhibitId, x, y } = body;
  if (typeof exhibitId !== "string" || typeof x !== "number" || typeof y !== "number") {
    return NextResponse.json({ error: "exhibitId, x and y are required." }, { status: 400 });
  }

  try {
    const board = await pinEvidence(team.id, exhibitId, x, y);
    return NextResponse.json(board);
  } catch (e) {
    if (e instanceof BoardError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/board:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
