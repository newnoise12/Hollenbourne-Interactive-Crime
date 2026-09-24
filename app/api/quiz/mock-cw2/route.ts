import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getStudentById } from "@/lib/students";
import { getCw2Item, SYNTHESIS_GUIDANCE } from "@/lib/cw2-sources";
import { callClaudeForJsonWithRetry } from "@/lib/anthropic-grading";
import { Cw2Error, getDraft, saveSelection, saveItemResponse, saveSynthesis, type ItemFeedback, type SynthesisFeedback } from "@/lib/cw2-practice";

// The Mock CW2 practice tool's single action route — selecting 3 of 4
// items, grading + saving one item's citation/reference/interpretation,
// and grading + saving the final synthesis. Unscored throughout: no
// trust bonus, nothing in quizAttempts — see lib/cw2-practice.ts.

const ELEMENT_STATUSES = ["correct", "flawed", "missing"] as const;
const INTERPRETATION_STATUSES = ["strong", "developing", "needs_work"] as const;
const TENSION_STATUSES = ["yes", "partially", "no"] as const;

function isValidItemFeedback(value: unknown): value is ItemFeedback {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.citation || typeof v.citation !== "object") return false;
  const c = v.citation as Record<string, unknown>;
  for (const key of ["inText", "reference"]) {
    const el = c[key];
    if (!el || typeof el !== "object") return false;
    const e = el as Record<string, unknown>;
    if (typeof e.note !== "string" || !ELEMENT_STATUSES.includes(e.status as (typeof ELEMENT_STATUSES)[number])) return false;
  }
  if (!v.interpretation || typeof v.interpretation !== "object") return false;
  const interp = v.interpretation as Record<string, unknown>;
  if (typeof interp.note !== "string" || !INTERPRETATION_STATUSES.includes(interp.status as (typeof INTERPRETATION_STATUSES)[number])) return false;
  if (typeof v.summary !== "string") return false;
  return true;
}

function isValidSynthesisFeedback(value: unknown): value is SynthesisFeedback {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.engagesWithTension || typeof v.engagesWithTension !== "object") return false;
  const tension = v.engagesWithTension as Record<string, unknown>;
  if (typeof tension.note !== "string" || !TENSION_STATUSES.includes(tension.status as (typeof TENSION_STATUSES)[number])) return false;
  if (!v.buildsArgument || typeof v.buildsArgument !== "object") return false;
  const arg = v.buildsArgument as Record<string, unknown>;
  if (typeof arg.note !== "string" || !INTERPRETATION_STATUSES.includes(arg.status as (typeof INTERPRETATION_STATUSES)[number])) return false;
  if (typeof v.summary !== "string") return false;
  return true;
}

function buildItemPrompt(
  content: string,
  correctCitation: { inText: string; reference: string },
  interpretationGuidance: string,
  student: { citation: string; reference: string; interpretation: string }
): string {
  return `You are giving a UK criminology student formative feedback on their practice with a source they've been asked to cite and interpret, as part of a scaffolded exercise leading up to a written assignment.

Source content the student was given:
${content}

Correct in-text citation: ${correctCitation.inText}
Correct full reference: ${correctCitation.reference}

What a strong interpretation should touch on (for your grading only, not shown to the student): ${interpretationGuidance}

Student's submitted in-text citation: ${student.citation}
Student's submitted full reference: ${student.reference}
Student's submitted interpretation: ${student.interpretation}

Assess the in-text citation and full reference each as correct/flawed/missing (lenient on inconsequential formatting variation, strict on structurally meaningful errors — same standard as checking a Harvard reference). Assess the interpretation as strong/developing/needs_work based on whether it genuinely engages with what the source shows and connects it to a broader trend, not just restates the numbers or the headline.

Return ONLY a JSON object with this exact shape, no other text, no markdown code fences:
{"citation":{"inText":{"status":"correct|flawed|missing","note":"string"},"reference":{"status":"correct|flawed|missing","note":"string"}},"interpretation":{"status":"strong|developing|needs_work","note":"string"},"summary":"one or two sentence overall comment"}`;
}

function buildSynthesisPrompt(text: string): string {
  return `You are giving a UK criminology student formative feedback on a short synthesis discussion, written as practice for a real assignment. The student was asked to discuss how three data sources they'd already examined individually interact — how they support or complicate each other's apparent trends — and to build an argument about the broader picture.

What a strong synthesis should engage with (for your grading only, not shown to the student): ${SYNTHESIS_GUIDANCE}

Student's submitted synthesis:
${text}

Assess whether the discussion genuinely engages with tension or complication between the sources (not just points where they happen to agree) as yes/partially/no, and whether it builds a coherent argument about the broader picture (not just a summary of each source in turn) as strong/developing/needs_work.

Return ONLY a JSON object with this exact shape, no other text, no markdown code fences:
{"engagesWithTension":{"status":"yes|partially|no","note":"string"},"buildsArgument":{"status":"strong|developing|needs_work","note":"string"},"summary":"one or two sentence overall comment"}`;
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

  let body: { action?: string; itemIds?: string[]; itemId?: string; citation?: string; reference?: string; interpretation?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.action === "select") {
    if (!Array.isArray(body.itemIds)) {
      return NextResponse.json({ error: "itemIds is required." }, { status: 400 });
    }
    try {
      const draft = await saveSelection(student.id, body.itemIds);
      return NextResponse.json({ draft });
    } catch (e) {
      if (e instanceof Cw2Error) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
  }

  if (body.action === "item") {
    const { itemId, citation, reference, interpretation } = body;
    if (!itemId || typeof citation !== "string" || typeof reference !== "string" || typeof interpretation !== "string") {
      return NextResponse.json({ error: "itemId, citation, reference, and interpretation are required." }, { status: 400 });
    }
    if (!citation.trim() || !reference.trim() || !interpretation.trim()) {
      return NextResponse.json({ error: "All three fields must be filled in." }, { status: 400 });
    }
    const item = getCw2Item(itemId);
    if (!item) {
      return NextResponse.json({ error: "Unknown item." }, { status: 400 });
    }

    const prompt = buildItemPrompt(item.content, item.correctCitation, item.interpretationGuidance, { citation, reference, interpretation });
    try {
      const feedback = await callClaudeForJsonWithRetry(prompt, isValidItemFeedback, 1536);
      const draft = await saveItemResponse(student.id, itemId, { citation, reference, interpretation }, feedback);
      return NextResponse.json({ draft });
    } catch {
      return NextResponse.json({ error: "Couldn't get feedback right now — please try again." }, { status: 502 });
    }
  }

  if (body.action === "synthesis") {
    const { text } = body;
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text is required." }, { status: 400 });
    }

    const current = await getDraft(student.id);
    const allItemsDone = current.selectedItemIds.length === 3 && current.selectedItemIds.every((id) => current.responses[id]?.feedback);
    if (!allItemsDone) {
      return NextResponse.json({ error: "Finish all 3 items before writing the synthesis." }, { status: 400 });
    }

    const prompt = buildSynthesisPrompt(text);
    try {
      const feedback = await callClaudeForJsonWithRetry(prompt, isValidSynthesisFeedback, 2048);
      const draft = await saveSynthesis(student.id, text, feedback);
      return NextResponse.json({ draft });
    } catch {
      return NextResponse.json({ error: "Couldn't get feedback right now — please try again." }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
