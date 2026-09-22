import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { movePin, setPinNote, unpinEvidence, BoardError } from "@/lib/board";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pinId: string }> }) {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { pinId } = await params;

  let body: { x?: number; y?: number; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    if (typeof body.note === "string") {
      const board = await setPinNote(team.id, pinId, body.note);
      return NextResponse.json(board);
    }
    if (typeof body.x === "number" && typeof body.y === "number") {
      const board = await movePin(team.id, pinId, body.x, body.y);
      return NextResponse.json(board);
    }
    return NextResponse.json({ error: "Provide either {note} or {x, y}." }, { status: 400 });
  } catch (e) {
    if (e instanceof BoardError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/board/pins/[pinId]:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ pinId: string }> }) {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { pinId } = await params;

  try {
    const board = await unpinEvidence(team.id, pinId);
    return NextResponse.json(board);
  } catch (e) {
    if (e instanceof BoardError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/board/pins/[pinId]:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
