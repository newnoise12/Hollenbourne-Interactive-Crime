import { db } from "@/db/client";
import { cw2MockDrafts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CW2_ITEMS } from "./cw2-sources";

export class Cw2Error extends Error {}

export type ElementFeedback = { status: "correct" | "flawed" | "missing"; note: string };

export type ItemFeedback = {
  citation: { inText: ElementFeedback; reference: ElementFeedback };
  interpretation: { status: "strong" | "developing" | "needs_work"; note: string };
  summary: string;
};

export type SynthesisFeedback = {
  engagesWithTension: { status: "yes" | "partially" | "no"; note: string };
  buildsArgument: { status: "strong" | "developing" | "needs_work"; note: string };
  summary: string;
};

export type ItemResponse = {
  citation: string;
  reference: string;
  interpretation: string;
  feedback: ItemFeedback | null;
};

export type Cw2Draft = {
  selectedItemIds: string[];
  responses: Record<string, ItemResponse>;
  synthesis: string | null;
  synthesisFeedback: SynthesisFeedback | null;
};

const EMPTY_DRAFT: Cw2Draft = { selectedItemIds: [], responses: {}, synthesis: null, synthesisFeedback: null };

function rowToDraft(row: typeof cw2MockDrafts.$inferSelect): Cw2Draft {
  return {
    selectedItemIds: row.selectedItemIds ? (JSON.parse(row.selectedItemIds) as string[]) : [],
    responses: JSON.parse(row.responses) as Record<string, ItemResponse>,
    synthesis: row.synthesis,
    synthesisFeedback: row.synthesisFeedback ? (JSON.parse(row.synthesisFeedback) as SynthesisFeedback) : null,
  };
}

/** A student's Mock CW2 practice progress. Empty defaults if they haven't started yet — never null, so callers don't need to handle a missing-row case separately. */
export async function getDraft(studentId: string): Promise<Cw2Draft> {
  const row = await db.query.cw2MockDrafts.findFirst({ where: eq(cw2MockDrafts.studentId, studentId) });
  return row ? rowToDraft(row) : EMPTY_DRAFT;
}

async function upsert(studentId: string, patch: Partial<{ selectedItemIds: string | null; responses: string; synthesis: string | null; synthesisFeedback: string | null }>): Promise<Cw2Draft> {
  const [row] = await db
    .insert(cw2MockDrafts)
    .values({ studentId, responses: "{}", ...patch })
    .onConflictDoUpdate({ target: cw2MockDrafts.studentId, set: { ...patch, updatedAt: new Date() } })
    .returning();
  return rowToDraft(row);
}

/** Records which 3 of the 4 items a student is working through. Existing responses for deselected items are kept, not deleted, so switching back loses nothing. */
export async function saveSelection(studentId: string, itemIds: string[]): Promise<Cw2Draft> {
  const validIds = new Set(CW2_ITEMS.map((i) => i.id));
  if (itemIds.length !== 3 || itemIds.some((id) => !validIds.has(id as never)) || new Set(itemIds).size !== 3) {
    throw new Cw2Error("Choose exactly 3 of the 4 items.");
  }
  return upsert(studentId, { selectedItemIds: JSON.stringify(itemIds) });
}

/** Saves one item's citation/reference/interpretation plus its AI feedback. Freely resubmittable — each call overwrites the previous response for this item. */
export async function saveItemResponse(
  studentId: string,
  itemId: string,
  input: { citation: string; reference: string; interpretation: string },
  feedback: ItemFeedback
): Promise<Cw2Draft> {
  const draft = await getDraft(studentId);
  const responses = { ...draft.responses, [itemId]: { ...input, feedback } };
  return upsert(studentId, { responses: JSON.stringify(responses) });
}

/** Saves the final synthesis plus its AI feedback. The API route enforces that all 3 selected items already have feedback before calling this. */
export async function saveSynthesis(studentId: string, text: string, feedback: SynthesisFeedback): Promise<Cw2Draft> {
  return upsert(studentId, { synthesis: text, synthesisFeedback: JSON.stringify(feedback) });
}
