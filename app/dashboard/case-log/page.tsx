import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getCitationsForTeam } from "@/lib/evidence";
import { getBoard } from "@/lib/board";
import { EVIDENCE } from "@/lib/evidence-catalog";
import EvidenceBoard from "./EvidenceBoard";

export default async function CaseLogPage() {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);

  if (!team) {
    redirect("/login");
  }

  const [citations, board] = await Promise.all([getCitationsForTeam(team.id), getBoard(team.id)]);

  return <EvidenceBoard evidence={EVIDENCE} initialCitations={citations} initialBoard={board} />;
}
