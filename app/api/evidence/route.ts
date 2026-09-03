import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { citeExhibit, EvidenceError } from "@/lib/evidence";

export async function POST(req: NextRequest) {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { exhibitId?: string; text?: string; title?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { exhibitId, text, title } = body;
  if (typeof exhibitId !== "string" || typeof text !== "string") {
    return NextResponse.json({ error: "exhibitId and text are required." }, { status: 400 });
  }

  try {
    const citation = await citeExhibit(team.id, exhibitId, text, typeof title === "string" ? title : null);
    return NextResponse.json({ citation });
  } catch (e) {
    if (e instanceof EvidenceError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("Unexpected error in /api/evidence:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
