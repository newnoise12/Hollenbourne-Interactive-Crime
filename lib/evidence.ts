import { db } from "@/db/client";
import { evidenceCitations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEvidenceItem } from "./evidence-catalog";
import { checkFreeText } from "./citation-validation";

export class EvidenceError extends Error {}

export type CitationMap = Record<string, { text: string; title: string | null }>;

/** Reads every citation a team has made, keyed by exhibit id. */
export async function getCitationsForTeam(teamId: string): Promise<CitationMap> {
  const rows = await db.query.evidenceCitations.findMany({
    where: eq(evidenceCitations.teamId, teamId),
  });

  const map: CitationMap = {};
  for (const row of rows) {
    map[row.exhibitId] = { text: row.citationText, title: row.titleSpan };
  }
  return map;
}

/**
 * Validates and records a citation for an exhibit. Re-validates server-side
 * (the client already validated for live feedback, but never trust that
 * alone) and upserts against the team_exhibit_idx unique index so a resubmit
 * corrects the citation instead of erroring.
 */
export async function citeExhibit(teamId: string, exhibitId: string, text: string, titleSpan: string | null) {
  const item = getEvidenceItem(exhibitId);
  if (!item) throw new EvidenceError("Unknown exhibit.");
  if (item.locked) throw new EvidenceError("This exhibit is locked.");

  const error = checkFreeText(text, item);
  if (error) throw new EvidenceError(error);

  const [citation] = await db
    .insert(evidenceCitations)
    .values({ teamId, exhibitId, citationText: text.trim(), titleSpan })
    .onConflictDoUpdate({
      target: [evidenceCitations.teamId, evidenceCitations.exhibitId],
      set: { citationText: text.trim(), titleSpan },
    })
    .returning();

  return citation;
}
