import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getStudentById } from "@/lib/students";
import { getReferenceTask } from "@/lib/reference-tasks";
import { callClaudeForJsonWithRetry, GradingError } from "@/lib/anthropic-grading";
import { ReferencePracticeError, saveCheck, submitTask } from "@/lib/reference-practice";

// Week 3 Stage 2's AI-graded practice feedback — see
// Reference/case-content/technical-briefs/hollenbourne-claude-code-referencing-brief.md.
// Still unscored (never touches trust bonus or quizAttempts), but now
// persisted per student (lib/reference-practice.ts) so work and feedback
// survive a reload, and a task can be marked "submitted" as a clear
// completion step distinct from checking/rechecking.

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

const REFERENCE_MAX_TOKENS = 4096;

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
  return `You are checking a student's attempt at a Harvard-style reference against the correct version, for a UK criminology module. The module follows London South Bank University's (LSBU) Harvard guide (https://library.lsbu.ac.uk/harvard), so grade against that format specifically rather than other Harvard variants — for example, LSBU book references have no place of publication.

Students type in a plain text box with no formatting tools. They were told to mark anything that should be in italics with *asterisks*; also accept _underscores_. If a student hasn't marked italics at all, don't mark the element flawed for that alone — but do mark it flawed if they've put italics (or quotation marks) on the wrong element, e.g. italicising an article title instead of the journal title.

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

  const studentId = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  const student = studentId ? await getStudentById(studentId) : null;
  if (!student || student.teamId !== team.id) {
    return NextResponse.json({ error: "Select who you are first." }, { status: 400 });
  }

  let body: { action?: string; taskId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { taskId } = body;
  if (!taskId || !getReferenceTask(taskId)) {
    return NextResponse.json({ error: "Unknown task." }, { status: 400 });
  }

  if (body.action === "submit") {
    try {
      const draft = await submitTask(student.id, taskId);
      return NextResponse.json({ draft });
    } catch (e) {
      if (e instanceof ReferencePracticeError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
  }

  // Default action: "check".
  const { text } = body;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "A non-empty text is required." }, { status: 400 });
  }
  const task = getReferenceTask(taskId)!;
  const prompt = buildPrompt(task.facts, task.correctReference, text, task.gradingNote);

  // One retry on failure, per the technical brief — this is a low-volume,
  // asynchronous practice tool, not something that needs a queue.
  try {
    // 4096, not the 1024 this used to ask for: the reasoning plus the JSON ran
    // past 1024 on weaker answers (the ones students resubmit most) and came
    // back cut off. Output is only billed as used. Four attempts because
    // these calls are quick and a busy API is worth waiting out.
    const result = await callClaudeForJsonWithRetry(prompt, isValidGradingResult, REFERENCE_MAX_TOKENS, undefined, 4);
    const draft = await saveCheck(student.id, taskId, text, result);
    return NextResponse.json({ draft });
  } catch (e) {
    if (e instanceof GradingError && e.busy) {
      return NextResponse.json(
        { error: "The feedback service is busy right now — wait a few seconds and press check again. Your answer is still in the box." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Couldn't get feedback right now — please try again." }, { status: 502 });
  }
}
