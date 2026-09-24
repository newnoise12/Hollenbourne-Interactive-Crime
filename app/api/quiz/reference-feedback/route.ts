import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getReferenceTask } from "@/lib/reference-tasks";

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

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

async function callAnthropic(prompt: string): Promise<GradingResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API returned ${res.status}`);
  }

  const data = await res.json();
  // A "thinking" block, when present, comes before the "text" block — find
  // the text block by type rather than assuming it's content[0].
  const content = Array.isArray(data?.content) ? data.content : [];
  const textBlock = content.find((block: { type?: string; text?: unknown }) => block?.type === "text");
  const text = textBlock?.text;
  if (typeof text !== "string") {
    throw new Error("Unexpected Anthropic response shape.");
  }

  const parsed = extractJson(text);
  if (!isValidGradingResult(parsed)) {
    throw new Error("Grading response did not match the expected shape.");
  }
  return parsed;
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
    const result = await callAnthropic(prompt);
    return NextResponse.json({ result });
  } catch (firstError) {
    try {
      const result = await callAnthropic(prompt);
      return NextResponse.json({ result });
    } catch (secondError) {
      console.error("Reference feedback grading failed twice:", firstError, secondError);
      return NextResponse.json({ error: "Couldn't get feedback right now — please try again." }, { status: 502 });
    }
  }
}
