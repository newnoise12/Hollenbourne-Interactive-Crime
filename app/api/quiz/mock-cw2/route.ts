import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, STUDENT_COOKIE_NAME } from "@/lib/session-cookie";
import { getStudentById } from "@/lib/students";
import { DAILY_CHECK_CAP, getCw2Item } from "@/lib/cw2-items";
import {
  CW2_SYSTEM_PROMPT,
  buildDataTypePrompt,
  buildSynthesisPrompt,
  isValidDataTypeFeedback,
  isValidSynthesisFeedback,
} from "@/lib/cw2-grading";
import { callClaudeForJsonWithRetry } from "@/lib/anthropic-grading";
import { Cw2Error, getDraft, saveSelection, saveItemResponse, saveSynthesis } from "@/lib/cw2-practice";

// The Mock CW2 practice form's checkpoint route — one data-type step, or the
// synthesis. Formative only and unscored: no trust bonus, nothing in
// quizAttempts, and no instructor-facing view of it (the feedback brief:
// never seen by whoever marks the real submission). See lib/cw2-practice.ts.

// The system prompt (12 principles + two worked examples) is long and each
// response is a richer JSON object than the earlier feedback, and thinking
// tokens count against the budget — see the truncation bug noted in CLAUDE.md.
const ITEM_MAX_TOKENS = 3072;
const SYNTHESIS_MAX_TOKENS = 4096;

function nonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.action === "select") {
    if (!Array.isArray(body.itemIds) || !body.itemIds.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "itemIds is required." }, { status: 400 });
    }
    try {
      return NextResponse.json({ draft: await saveSelection(student.id, body.itemIds as string[]) });
    } catch (e) {
      if (e instanceof Cw2Error) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
  }

  const draft = await getDraft(student.id);
  if (draft.checksUsedToday >= DAILY_CHECK_CAP) {
    return NextResponse.json(
      { error: `You've used all ${DAILY_CHECK_CAP} feedback checks for today — your work is saved, so come back tomorrow.` },
      { status: 429 }
    );
  }

  if (body.action === "item") {
    const { itemId, parenthetical, narrative, reference, description, interpretation } = body;
    if (![itemId, parenthetical, narrative, reference, description, interpretation].every(nonEmpty)) {
      return NextResponse.json({ error: "Every field must be filled in." }, { status: 400 });
    }
    const item = getCw2Item(itemId as string);
    if (!item) {
      return NextResponse.json({ error: "Unknown data type." }, { status: 400 });
    }
    if (!draft.selectedItemIds.includes(item.id)) {
      return NextResponse.json({ error: "That data type isn't one of your three." }, { status: 400 });
    }

    const input = {
      parenthetical: parenthetical as string,
      narrative: narrative as string,
      reference: reference as string,
      description: description as string,
      interpretation: interpretation as string,
    };
    try {
      const feedback = await callClaudeForJsonWithRetry(buildDataTypePrompt(item, input), isValidDataTypeFeedback, ITEM_MAX_TOKENS, CW2_SYSTEM_PROMPT);
      const updated = await saveItemResponse(student.id, item.id, input, feedback);
      return NextResponse.json({ draft: updated });
    } catch (e) {
      if (e instanceof Cw2Error) return NextResponse.json({ error: e.message }, { status: 400 });
      return NextResponse.json({ error: "Couldn't get feedback right now — please try again." }, { status: 502 });
    }
  }

  if (body.action === "synthesis") {
    const { relationship, argument } = body;
    if (!nonEmpty(relationship) || !nonEmpty(argument)) {
      return NextResponse.json({ error: "Both synthesis answers must be filled in." }, { status: 400 });
    }

    const chosen = draft.selectedItemIds.map((id) => getCw2Item(id)).filter((i) => !!i);
    if (chosen.length !== 3 || !chosen.every((item) => draft.responses[item!.id]?.feedback)) {
      return NextResponse.json({ error: "Choose your three data types and finish all of them before the synthesis." }, { status: 400 });
    }

    const items = chosen.map((item) => ({ item: item!, response: draft.responses[item!.id] }));
    const input = { relationship, argument };
    try {
      const feedback = await callClaudeForJsonWithRetry(buildSynthesisPrompt(items, input), isValidSynthesisFeedback, SYNTHESIS_MAX_TOKENS, CW2_SYSTEM_PROMPT);
      const updated = await saveSynthesis(student.id, input, feedback);
      return NextResponse.json({ draft: updated });
    } catch {
      return NextResponse.json({ error: "Couldn't get feedback right now — please try again." }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
