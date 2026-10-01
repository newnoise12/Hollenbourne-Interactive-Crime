import { db } from "@/db/client";
import { referencePracticeDrafts } from "@/db/schema";
import { eq } from "drizzle-orm";

export class ReferencePracticeError extends Error {}

// Feedback's internal shape is owned by the API route/component (the grading
// JSON shape) — this layer just stores and returns whatever it's given,
// opaque JSON, same as cw2MockDrafts does for its own feedback blobs.
export type TaskResponse = { text: string; feedback: unknown; submitted: boolean };
export type ReferencePracticeDraft = Record<string, TaskResponse>;

const EMPTY_DRAFT: ReferencePracticeDraft = {};

function normaliseResponse(raw: Record<string, unknown>): TaskResponse {
  return {
    text: typeof raw.text === "string" ? raw.text : "",
    feedback: raw.feedback ?? null,
    submitted: raw.submitted === true,
  };
}

function rowToDraft(row: typeof referencePracticeDrafts.$inferSelect): ReferencePracticeDraft {
  const raw = JSON.parse(row.responses) as Record<string, Record<string, unknown>>;
  const out: ReferencePracticeDraft = {};
  for (const [id, r] of Object.entries(raw)) out[id] = normaliseResponse(r);
  return out;
}

/** A student's referencing-practice progress. Empty if they haven't checked anything yet — never null. */
export async function getDraft(studentId: string): Promise<ReferencePracticeDraft> {
  const row = await db.query.referencePracticeDrafts.findFirst({ where: eq(referencePracticeDrafts.studentId, studentId) });
  return row ? rowToDraft(row) : EMPTY_DRAFT;
}

async function upsert(studentId: string, responses: ReferencePracticeDraft): Promise<ReferencePracticeDraft> {
  const json = JSON.stringify(responses);
  const [row] = await db
    .insert(referencePracticeDrafts)
    .values({ studentId, responses: json })
    .onConflictDoUpdate({ target: referencePracticeDrafts.studentId, set: { responses: json, updatedAt: new Date() } })
    .returning();
  return rowToDraft(row);
}

/**
 * Saves a task's checked text + feedback — called every time a student hits
 * "check my reference", not just on submit, so work and feedback survive a
 * reload. A re-check with different text drops any previous submitted mark
 * (still revising); re-checking the exact text that was already submitted
 * keeps it submitted.
 */
export async function saveCheck(studentId: string, taskId: string, text: string, feedback: unknown): Promise<ReferencePracticeDraft> {
  const draft = await getDraft(studentId);
  const previous = draft[taskId];
  const stillSubmitted = !!previous?.submitted && previous.text === text;
  return upsert(studentId, { ...draft, [taskId]: { text, feedback, submitted: stillSubmitted } });
}

/**
 * Marks a task as the student's submitted answer. Doesn't re-grade — the
 * text and feedback already on file from the last check are what gets
 * marked, so this is instant and needs no AI call. Freely un-submittable by
 * checking again with revised text.
 */
export async function submitTask(studentId: string, taskId: string): Promise<ReferencePracticeDraft> {
  const draft = await getDraft(studentId);
  const existing = draft[taskId];
  if (!existing || !existing.text.trim() || !existing.feedback) {
    throw new ReferencePracticeError("Check your reference before submitting it.");
  }
  return upsert(studentId, { ...draft, [taskId]: { ...existing, submitted: true } });
}
