import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getReferenceTask } from "@/lib/reference-tasks";
import { callClaudeForJsonWithRetry } from "@/lib/anthropic-grading";

// Week 3 Stage 2's AI-graded practice feedback — see
// Reference/case-content/technical-briefs/hollenbourne-claude-code-referencing-brief.md.
// Unscored, not persisted: this only ever returns feedback for the current
// submission, never writes to the database.

type ElementStatus = "correct" | "flawed" | "missing" | "not_applicable";
type ElementFeedback = { status: ElementStatus; note: string };
type GradingResult = {
  elements: {
    author: ElementFeedback;
    year: ElementFeedback;
    title: ElementFeedback;
    publication_details: ElementFeedback;
    access_details: ElementFeedback;
  };
  overall: "correct" | "mostly_correct" | "needs_work";
  summary: string;
};

const ELEMENT_KEYS = ["author", "year", "title", "publication_details", "access_details"] as const;
const STATUSES: ElementStatus[] = ["correct", "flawed", "missing", "not_applicable"];
const OVERALLS = ["correct", "mostly_correct", "needs_work"];

function isValidGradingResult(value: unknown): value is GradingResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.elements || typeof v.elements !== "object") return false;
  const elements = v.elements as Record<string, unknown>;
  for (const key of ELEMENT_KEYS) {
    const el = elements[key];
    if (!el || typeof el !== "object") return false;
    const e = el as Record<string, unknown>;
    if (typeof e.note !== "string" || !STATUSES.includes(e.status as ElementStatus)) return false;
  }
  if (!OVERALLS.includes(v.overall as string)) return false;
  if (typeof v.summary !== "string") return false;
  return true;
}

function buildPrompt(facts: string, correctReference: string, studentText: string, gradingNote?: string): string {
  return `You are checking a student's attempt at a Harvard-style reference against the correct version, for a UK criminology module.

Raw source facts:
${facts}

Correct reference:
${correctReference}
${gradingNote ? `\nSpecial grading note for this item: ${gradingNote}\n` : ""}
Student's submitted reference:
${studentText}

Assess the student's submission against the five Harvard reference elements (author, year, title, publication details, access details — mark access details as "not_applicable" if this source type doesn't need them, e.g. a print book).

Be lenient on inconsequential formatting variation (spacing, "and" vs "&", trailing punctuation, minor capitalisation that doesn't change meaning). Be strict on structurally meaningful errors: missing elements, wrong italicisation, authors in the wrong order or incomplete, incorrect date format, missing "Available at"/"Accessed" for online sources.

Return ONLY a JSON object with this exact shape, no other text, no markdown code fences:
{"elements":{"author":{"status":"correct|flawed|missing","note":"string"},"year":{"status":"correct|flawed|missing","note":"string"},"title":{"status":"correct|flawed|missing","note":"string"},"publication_details":{"status":"correct|flawed|missing","note":"string"},"access_details":{"status":"correct|flawed|missing|not_applicable","note":"string"}},"overall":"correct|mostly_correct|needs_work","summary":"one or two sentence overall comment"}`;
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (!team) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body: { taskId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { taskId, text } = body;
  if (!taskId || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "taskId and a non-empty text are required." }, { status: 400 });
  }

  const task = getReferenceTask(taskId);
  if (!task) {
    return NextResponse.json({ error: "Unknown task." }, { status: 400 });
  }

  const prompt = buildPrompt(task.facts, task.correctReference, text, task.gradingNote);

  // One retry on failure, per the technical brief — this is a low-volume,
  // asynchronous practice tool, not something that needs a queue.
  try {
    const result = await callClaudeForJsonWithRetry(prompt, isValidGradingResult);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "Couldn't get feedback right now — please try again." }, { status: 502 });
  }
}
