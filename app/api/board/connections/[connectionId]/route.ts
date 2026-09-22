import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { deleteConnection, BoardError } from "@/lib/board";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ connectionId: string }> }) {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { connectionId } = await params;

  try {
    const board = await deleteConnection(team.id, connectionId);
    return NextResponse.json(board);
  } catch (e) {
    if (e instanceof BoardError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/board/connections/[connectionId]:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
