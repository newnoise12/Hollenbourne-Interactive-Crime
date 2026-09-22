import { db } from "@/db/client";
import { evidencePins, evidenceConnections, evidenceCitations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getEvidenceItem, type EvidenceItem } from "./evidence-catalog";

export class BoardError extends Error {}

export type BoardPin = { id: string; x: number; y: number; note: string | null; evidence: EvidenceItem };
export type BoardConnection = { id: string; fromPinId: string; toPinId: string; label: string };
export type Board = { pins: BoardPin[]; connections: BoardConnection[] };

/** A team's corkboard — every pin (with its live catalog content) and every connection between two of them. */
export async function getBoard(teamId: string): Promise<Board> {
  const [pinRows, connectionRows] = await Promise.all([
    db.query.evidencePins.findMany({ where: eq(evidencePins.teamId, teamId) }),
    db.query.evidenceConnections.findMany({ where: eq(evidenceConnections.teamId, teamId) }),
  ]);

  const pins: BoardPin[] = [];
  for (const row of pinRows) {
    const evidence = getEvidenceItem(row.exhibitId);
    if (!evidence) continue; // catalog entry removed/renamed since this was pinned — skip rather than crash
    pins.push({ id: row.id, x: row.x, y: row.y, note: row.note, evidence });
  }

  const connections = connectionRows.map((row) => ({
    id: row.id,
    fromPinId: row.fromPinId,
    toPinId: row.toPinId,
    label: row.label,
  }));

  return { pins, connections };
}

/**
 * Pins an exhibit to the team's corkboard. Requires the exhibit to already
 * be cited — the corkboard is for connecting evidence a team has already
 * engaged with through the citation exercise, not a shortcut around it.
 * Re-pinning an already-pinned exhibit just moves it to the new position
 * (team_pin_exhibit_idx makes this an upsert).
 */
export async function pinEvidence(teamId: string, exhibitId: string, x: number, y: number): Promise<Board> {
  const item = getEvidenceItem(exhibitId);
  if (!item) throw new BoardError("Unknown exhibit.");

  const cited = await db.query.evidenceCitations.findFirst({
    where: and(eq(evidenceCitations.teamId, teamId), eq(evidenceCitations.exhibitId, exhibitId)),
  });
  if (!cited) throw new BoardError("Cite this exhibit in the case log before pinning it to the corkboard.");

  await db
    .insert(evidencePins)
    .values({ teamId, exhibitId, x: Math.round(x), y: Math.round(y) })
    .onConflictDoUpdate({
      target: [evidencePins.teamId, evidencePins.exhibitId],
      set: { x: Math.round(x), y: Math.round(y) },
    });

  return getBoard(teamId);
}

async function getOwnedPin(teamId: string, pinId: string) {
  const pin = await db.query.evidencePins.findFirst({ where: and(eq(evidencePins.id, pinId), eq(evidencePins.teamId, teamId)) });
  if (!pin) throw new BoardError("Pin not found.");
  return pin;
}

export async function movePin(teamId: string, pinId: string, x: number, y: number): Promise<Board> {
  await getOwnedPin(teamId, pinId);
  await db.update(evidencePins).set({ x: Math.round(x), y: Math.round(y) }).where(eq(evidencePins.id, pinId));
  return getBoard(teamId);
}

export async function setPinNote(teamId: string, pinId: string, note: string): Promise<Board> {
  await getOwnedPin(teamId, pinId);
  await db.update(evidencePins).set({ note: note.trim() || null }).where(eq(evidencePins.id, pinId));
  return getBoard(teamId);
}

export async function unpinEvidence(teamId: string, pinId: string): Promise<Board> {
  await getOwnedPin(teamId, pinId);
  await db.delete(evidencePins).where(eq(evidencePins.id, pinId));
  return getBoard(teamId);
}

export async function connectPins(teamId: string, fromPinId: string, toPinId: string, label: string): Promise<Board> {
  if (fromPinId === toPinId) throw new BoardError("Can't connect a card to itself.");
  const trimmed = label.trim();
  if (!trimmed) throw new BoardError("A connection needs a label.");
  await getOwnedPin(teamId, fromPinId);
  await getOwnedPin(teamId, toPinId);

  await db.insert(evidenceConnections).values({ teamId, fromPinId, toPinId, label: trimmed });
  return getBoard(teamId);
}

export async function deleteConnection(teamId: string, connectionId: string): Promise<Board> {
  const connection = await db.query.evidenceConnections.findFirst({
    where: and(eq(evidenceConnections.id, connectionId), eq(evidenceConnections.teamId, teamId)),
  });
  if (!connection) throw new BoardError("Connection not found.");
  await db.delete(evidenceConnections).where(eq(evidenceConnections.id, connectionId));
  return getBoard(teamId);
}
