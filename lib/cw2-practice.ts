import { db } from "@/db/client";
import { cw2MockDrafts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CW2_ITEMS } from "./cw2-items";

export class Cw2Error extends Error {}

// ---------------------------------------------------------------------
// Feedback shapes — the JSON the model is asked for (see
// Reference/case-content/technical-briefs/hollenbourne-claude-code-cw2-feedback-brief.md).
// The fixed formative-only disclaimer is deliberately NOT part of these: it's
// hardcoded (FORMATIVE_DISCLAIMER, lib/cw2-items.ts), never model output.
// ---------------------------------------------------------------------

export type CheckStatus = "correct" | "flawed" | "missing";

export type Reasoning = {
  status: "sound" | "gap_found";
  sufficiency_statement: string; // plain verdict — never blended with the prompt below (Principle 2)
  socratic_prompt: string; // an open question toward the gap — never supplies the answer (Principle 1)
};

export type Multiplicity = { status: "present" | "absent"; note: string };
export type EpistemicFraming = { status: "well_framed" | "could_be_sharper"; note: string };

export type DataTypeFeedback = {
  checkpoint_type: "data_type";
  citation: { parenthetical: CheckStatus; narrative: CheckStatus; bibliographic: CheckStatus; note: string };
  description_accuracy: { status: CheckStatus; note: string };
  plausibility_or_reasoning: Reasoning;
  multiplicity: Multiplicity;
  epistemic_framing: EpistemicFraming;
};

export type SynthesisFeedback = {
  checkpoint_type: "synthesis";
  relationship: { status: "connection_found" | "tension_found" | "not_engaged"; note: string };
  plausibility_or_reasoning: Reasoning;
  multiplicity: Multiplicity;
  epistemic_framing: EpistemicFraming;
};

// ---------------------------------------------------------------------
// Draft shapes
// ---------------------------------------------------------------------

export type ItemInput = {
  parenthetical: string;
  narrative: string;
  reference: string;
  description: string;
  interpretation: string;
};

export type ItemResponse = ItemInput & { feedback: DataTypeFeedback | null };

export type SynthesisInput = { relationship: string; argument: string };

export type Cw2Draft = {
  selectedItemIds: string[];
  responses: Record<string, ItemResponse>;
  synthesis: SynthesisInput | null;
  synthesisFeedback: SynthesisFeedback | null;
  checksUsedToday: number;
};

const EMPTY_DRAFT: Cw2Draft = { selectedItemIds: [], responses: {}, synthesis: null, synthesisFeedback: null, checksUsedToday: 0 };

function londonDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

// Rows written before the v2 feedback brief carry an older shape (a single
// "citation" field, no description, feedback without checkpoint_type). Read
// them forgivingly instead of crashing: keep what the student typed, and drop
// feedback that predates the current shape so it just gets re-checked.
function normaliseResponse(raw: Record<string, unknown>): ItemResponse {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const fb = raw.feedback as Partial<DataTypeFeedback> | null | undefined;
  return {
    parenthetical: str(raw.parenthetical) || str(raw.citation),
    narrative: str(raw.narrative),
    reference: str(raw.reference),
    description: str(raw.description),
    interpretation: str(raw.interpretation),
    feedback: fb && fb.checkpoint_type === "data_type" && fb.plausibility_or_reasoning ? (fb as DataTypeFeedback) : null,
  };
}

function parseSynthesis(raw: string | null): SynthesisInput | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.relationship === "string" && typeof parsed.argument === "string") {
      return { relationship: parsed.relationship, argument: parsed.argument };
    }
  } catch {
    // legacy plain-text synthesis — fall through
  }
  return { relationship: "", argument: raw };
}

function rowToDraft(row: typeof cw2MockDrafts.$inferSelect): Cw2Draft {
  const rawResponses = JSON.parse(row.responses) as Record<string, Record<string, unknown>>;
  const responses: Record<string, ItemResponse> = {};
  for (const [id, raw] of Object.entries(rawResponses)) responses[id] = normaliseResponse(raw);

  const fb = row.synthesisFeedback ? (JSON.parse(row.synthesisFeedback) as Partial<SynthesisFeedback>) : null;
  const synthesisFeedback = fb && fb.checkpoint_type === "synthesis" && fb.plausibility_or_reasoning ? (fb as SynthesisFeedback) : null;

  return {
    selectedItemIds: row.selectedItemIds ? (JSON.parse(row.selectedItemIds) as string[]) : [],
    responses,
    synthesis: parseSynthesis(row.synthesis),
    synthesisFeedback,
    checksUsedToday: row.checksDate === londonDate() ? row.checksToday : 0,
  };
}

/** A student's Mock CW2 practice progress. Empty defaults if they haven't started yet — never null. */
export async function getDraft(studentId: string): Promise<Cw2Draft> {
  const row = await db.query.cw2MockDrafts.findFirst({ where: eq(cw2MockDrafts.studentId, studentId) });
  return row ? rowToDraft(row) : EMPTY_DRAFT;
}

async function upsert(
  studentId: string,
  patch: Partial<{ selectedItemIds: string; responses: string; synthesis: string | null; synthesisFeedback: string | null; checksToday: number; checksDate: string }>
): Promise<Cw2Draft> {
  const [row] = await db
    .insert(cw2MockDrafts)
    .values({ studentId, responses: "{}", ...patch })
    .onConflictDoUpdate({ target: cw2MockDrafts.studentId, set: { ...patch, updatedAt: new Date() } })
    .returning();
  return rowToDraft(row);
}

/**
 * Records which 3 of the 4 data types a student is working through. Must be
 * exactly 3 distinct known items including the statistical one (the real
 * assignment's rule: choose two or more, at least one statistical). Existing
 * responses for a deselected item are kept, not deleted, so switching back
 * loses nothing.
 */
export async function saveSelection(studentId: string, itemIds: string[]): Promise<Cw2Draft> {
  const valid = new Set<string>(CW2_ITEMS.map((i) => i.id));
  if (itemIds.length !== 3 || new Set(itemIds).size !== 3 || itemIds.some((id) => !valid.has(id))) {
    throw new Cw2Error("Choose exactly 3 of the 4 data types.");
  }
  if (!itemIds.includes("statistical")) {
    throw new Cw2Error("At least one of your data types must be the statistical one, as in the real assignment.");
  }
  // Synthesis feedback was written about the previous three sources, so it
  // no longer applies if the set changes. The student's synthesis text is
  // kept, but has to be re-checked.
  const previous = (await getDraft(studentId)).selectedItemIds;
  const changed = previous.length !== 3 || itemIds.some((id) => !previous.includes(id));
  return upsert(studentId, { selectedItemIds: JSON.stringify(itemIds), ...(changed ? { synthesisFeedback: null } : {}) });
}

/** Saves one data type's inputs plus its checkpoint feedback, and counts the check against today's cap. Freely resubmittable. */
export async function saveItemResponse(studentId: string, itemId: string, input: ItemInput, feedback: DataTypeFeedback): Promise<Cw2Draft> {
  if (!CW2_ITEMS.some((i) => i.id === itemId)) throw new Cw2Error("Unknown data type.");
  const draft = await getDraft(studentId);
  const responses = { ...draft.responses, [itemId]: { ...input, feedback } };
  return upsert(studentId, {
    responses: JSON.stringify(responses),
    checksToday: draft.checksUsedToday + 1,
    checksDate: londonDate(),
  });
}

/** Saves the synthesis plus its feedback. The API route enforces that every data type already has feedback. */
export async function saveSynthesis(studentId: string, input: SynthesisInput, feedback: SynthesisFeedback): Promise<Cw2Draft> {
  const draft = await getDraft(studentId);
  return upsert(studentId, {
    synthesis: JSON.stringify(input),
    synthesisFeedback: JSON.stringify(feedback),
    checksToday: draft.checksUsedToday + 1,
    checksDate: londonDate(),
  });
}
