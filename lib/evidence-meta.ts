// Types and display constants for exhibits — everything the BROWSER may import.
// No exhibit text or images are defined here (those live in evidence-catalog.ts,
// server-only), so a team can't read an exhibit it hasn't unlocked out of the
// JavaScript bundle. Server code can keep importing these names from
// evidence-catalog.ts, which re-exports them.

import type { CaseName, EvidenceGroup } from "./actions-meta";

export type EvidenceType = "statistical" | "visual" | "interview" | "documentary";

// The four cases under review, for the corkboard's "filing cabinet" grouping
// (Reference/case-content/hollenbourne-evidence-board-design.md) — plus
// "general" for force-wide/cross-case material that isn't any one victim's.
// Defined in actions-meta.ts (an action is where its case is set); re-exported
// so existing imports keep working.
export type { CaseName };

// Suspects worth colour-coding per the design brief's own palette (matching
// the cell-site exhibit filenames in Reference/case-content/visuals/). Most
// evidence items aren't about a specific suspect at all — the brief itself
// calls for neutral grey in that (common) case, so `suspect` stays optional
// rather than every item needing one.
export type Suspect = "burgess" | "nigel" | "swayne" | "haddad";

// The full document text, for the "read in full" reader — distinct from
// `snippet` (a one-line teaser). A multi-document exhibit (a policy file
// bundling its FLO log and canvass summary) is several sections, each with
// its own heading.
export type EvidenceBodySection = { heading?: string; paragraphs: string[] };

export type EvidenceItem = {
  id: string;
  exhibit: string;
  type: EvidenceType;
  case: CaseName;
  // Which of the evidence page's six "By evidence type" groups this files under.
  // For an action-derived exhibit this comes from the action itself.
  group: EvidenceGroup;
  suspect?: Suspect;
  title: string;
  snippet: string;
  // Time-gate: not selectable/readable until the module's current week
  // (lib/module-settings.ts) reaches this. Independent of unlockedByActionId
  // — an item can carry either, both, or neither (neither = free from day one).
  unlocksWeek?: number;
  // Action-gate: not selectable/readable until this action has a completed
  // actionLog entry for the team (same mechanic as actions' own
  // prerequisiteActionIds — checked against the permanent log, no week
  // restriction of its own).
  unlockedByActionId?: string;
  body?: EvidenceBodySection[];
  // Path under public/ — same pattern as quiz-catalog.ts's McqStage.image.
  // Only a handful of exhibits have a real image behind them (the two case
  // maps, and the five cell-site exhibits); most are text-only documents.
  image?: string;
  // One line shown under the image: what it is and when — taken from the
  // exhibit's own description, never from design notes about it.
  imageCaption?: string;
};

export const TYPE_META: Record<EvidenceType, { label: string; color: string }> = {
  statistical: { label: "Statistical", color: "#3C3489" },
  visual: { label: "Visual", color: "#085041" },
  interview: { label: "Interview", color: "#712B13" },
  documentary: { label: "Documentary", color: "#644421" },
};

export const CASE_META: Record<CaseName, { label: string }> = {
  mason: { label: "Geoff Mason" },
  wooley: { label: "Susan Wooley" },
  porterhouse: { label: "Carl Porterhouse" },
  butt: { label: "Sara Butt" },
  general: { label: "General / force-wide" },
};

// Reuses hexes already established elsewhere in the app (witness-category
// indigo for Nigel, reserve-gold for Swayne, visual-category teal for
// Haddad, the existing "inadmissible"/red for Burgess) rather than
// introducing a second palette.
export const SUSPECT_META: Record<Suspect, { label: string; color: string }> = {
  burgess: { label: "Burgess", color: "#8B3226" },
  nigel: { label: "Nigel Wooley", color: "#3C3489" },
  swayne: { label: "Swayne", color: "#93650F" },
  haddad: { label: "Haddad", color: "#085041" },
};

export const NEUTRAL_EVIDENCE_COLOR = "#8A8A80";

/** Colour for board/card display: suspect-specific colour where one applies, neutral grey otherwise. */
export function getEvidenceColor(item: Pick<EvidenceItem, "suspect">): string {
  return item.suspect ? SUSPECT_META[item.suspect].color : NEUTRAL_EVIDENCE_COLOR;
}

/**
 * An exhibit is unlocked once BOTH its week-gate (if any) and its
 * action-gate (if any) are satisfied — neither, either, or both may apply.
 * `completedActionIds` is the team's permanent actionLog, exactly the same
 * set `lib/actions.ts`'s prerequisite check already builds.
 */
export function isEvidenceUnlocked(
  item: Pick<EvidenceItem, "unlocksWeek" | "unlockedByActionId">,
  currentWeek: number,
  completedActionIds: ReadonlySet<string>
): boolean {
  const weekOk = !item.unlocksWeek || currentWeek >= item.unlocksWeek;
  const actionOk = !item.unlockedByActionId || completedActionIds.has(item.unlockedByActionId);
  return weekOk && actionOk;
}
