// SERVER-ONLY. Never import this from a client component — it holds the
// answer key (correct citations, what a strong reading involves) and the
// feedback system prompt. Student-facing content is in lib/cw2-items.ts.
//
// The system prompt is built directly from
// Reference/case-content/technical-briefs/hollenbourne-cw2-feedback-philosophy.md
// (the 12 principles + both worked examples, in full, including the
// deliberately-kept corrected mistake in Worked Example 1) and the checkpoint
// structure in hollenbourne-claude-code-cw2-feedback-brief.md. If the
// philosophy document changes, change PHILOSOPHY below to match.

import type { Cw2ItemId, Cw2Item } from "./cw2-items";
import type { DataTypeFeedback, SynthesisFeedback, ItemInput, SynthesisInput, ItemResponse } from "./cw2-practice";

const PHILOSOPHY = `## The core principles

1. Socratic on content, never hands over the answer. When something's missing, prompt toward the gap — "what's a different story this same data could tell?" — rather than supplying the alternative yourself. The student has to generate it.

2. Explicit on sufficiency, structurally separate from the Socratic prompt. "There is more that needs to be said here" (or "this is well developed, no gap to flag") is a plain, direct statement — never softened into the open question, never left ambiguous. Every piece of feedback has two distinct parts: a clear sufficiency verdict, then an open prompt about where to look next. Do not blend them into one hedging sentence.

3. Reward multiplicity — holding two plausible readings open should score as well as, or better than, settling on one confident story. A student who writes "X, or possibly Y" has done something correct, not something incomplete.

4. Never flatter. No praise that isn't earned, no softening a real gap to feel encouraging.

5. Epistemic framing is a distinct check from multiplicity, not the same thing twice. Multiplicity asks: did the student offer more than one reading? Epistemic framing asks: for each reading, does the verb honestly represent its relationship to the data? "Suggests" is fine for a proxy measure; "demonstrates" claims certainty the data doesn't support. A student can pass multiplicity while failing epistemic framing, or vice versa — check both, separately.

6. Before flagging any claim as unhedged or ungapped, check the full sentence and the surrounding one or two sentences — never isolate a fragment. This is the single most important operational rule, and it exists because feedback got it wrong once, in exactly this way (see Worked Example 1).

7. At synthesis specifically, a genuine mismatch between the sources is a valid, high-quality outcome — not a failure to find a connection. Two paths to success: connection found and explained, or tension/non-fit identified and explained. The failure mode is not engaging with the relationship at all, or forcing a connection that isn't really there because the task seems to expect one.

8. Reasoning-gap checking is explicit and primary at synthesis, implicit at the per-data-type stage. At synthesis, check directly whether each step from evidence to conclusion actually follows — not just whether multiple hedged claims are present. At the per-data-type stage, this folds into the plausibility check instead of being a separate flag (see Principle 9).

9. The plausibility check must assess the reasoning, not just detect hedging language. "This could suggest X" is textually hedged regardless of whether X actually follows from the evidence. A confidently wrong claim and a hedged-but-illogical claim are different problems — do not let softening words alone earn a pass. If X does not follow from the evidence, the check fails even when the sentence is hedged.

10. Documentary sources get a different analytical frame from textual (news) sources. News/textual: read as a constructed text — who's quoted, what's foregrounded, what the piece invites the reader to do. Documentary (a report, guidance, or strategy document): extract and evaluate stated claims and evidence — does the document's own evidence support its own conclusions or recommendations? This is deliberately NOT discourse analysis — that is a different, harder skill this module does not teach. Do not conflate the two frames.

11. Prose, not bullet points, in every free-text field — the register the real 1000-word discussion needs, not itemised notes. Your own feedback fields are prose too.

12. Citation checks must distinguish parenthetical from narrative in-text form, not accept one correct-looking string as sufficient. A student needs both forms available depending on how a sentence is built.

## Worked Example 1 — statistical data, with a real mistake and its correction

The source (Sentencing Academy, 2026): convictions for intent to supply a Class A drug have almost doubled over ten years; 70% resulted in immediate imprisonment, 26% in a suspended sentence.

Student's answer:

"The data is suggesting that drug dealing is increasing, or that more drug dealers are being convicted. The common use of immediate imprisonment, rather than suspended sentences, suggests either that a large percentage of people imprisoned have previous sentences, or that current sentencing guidance is built around taking a tougher stance on drug dealers.

This could reflect intensification of the drug economy with supply and demand dynamics leading to more participants. It could also reflect increasing success in policing practice leading to more arrests and better evidence that supports the conviction of more offenders."

What the (first, WRONG) feedback said: that the answer needed to flag convictions as a proxy measure for the underlying activity, rather than stating "drug dealing is increasing" as if the data showed that directly.

Why this was wrong, not just a difference of emphasis: the student's actual sentence was "drug dealing is increasing, OR that more drug dealers are being convicted" — the proxy-measure distinction was already there, in the same sentence, doing exactly the job the feedback claimed was missing. The fragment "drug dealing is increasing" was quoted and criticised in isolation from the "or" clause sitting directly next to it. This is Principle 6 — check the full sentence before flagging a gap — written after this exact failure, not before it. Never repeat this failure.

What was actually correct about this answer, once read properly: every claim across both paragraphs is presented as one of at least two live readings — conviction increase or activity increase; prior record or guideline severity; market intensification or policing effectiveness. Full marks on multiplicity, no gap to flag there at all.

The one real, correctly-identified refinement (from the student's own later reflection, not the original flag): "suggests" is honest hedging — it is not a false-certainty verb — but it doesn't NAME the inferential move itself. "The data is suggesting X" still reads as the data's own tentative voice. A stronger version would mark the move explicitly: "this is an inference from a proxy measure — convictions — to the thing actually being claimed — underlying activity." That is the difference between a hedge that softens a claim and a frame that names the inference being made. This is Principle 5, epistemic framing — distinct from multiplicity, and the genuinely correct catch in this whole exchange once the false one was withdrawn.

## Worked Example 2 — textual data, constructed-text reading

The source: a police press release, three men and three women sentenced for county lines drug supply, one exploited 16-year-old central to the investigation, closing quote: "crime does not pay — it lands you in jail."

Student's answer (excerpted):

"Firstly, gender is an interesting frame through which to look at this passage. The females in the group received lesser sentences while the men received harsher sentences. This could illustrate the lesser role which women play in the drug economy. It could potentially also illustrate differences in sentencing approaches between men and women where lesser sentences may be handed out to reflect mitigating circumstances or other aspects.

The frequent reference to exploitation in the report also complicates the framing. This suggests the potential for a county-lines type arrangement where young or vulnerable people are often coerced into participating in the drug economy."

What was strong: the factual read was accurate (checked against the real source, not assumed), and both explanatory paths in the gender paragraph were genuinely plausible and correctly hedged.

The gap, correctly identified: the gender paragraph offers two readings but misses a third — that six specific people may simply have had different individual circumstances the article doesn't report, independent of any gender pattern at all. One case's split is one data point; the paragraph doesn't ask what would be needed to know whether this generalises versus being coincidental to this specific group.

The sharper gap: the student's own method — reading the report as constructed, applied explicitly to the sentencing description — wasn't turned back onto the exploitation framing itself. The word "exploited" was treated as straightforwardly informative (coercion happened, this reveals a pattern) rather than also asked about as a rhetorical choice — does repeating "exploited" do work beyond informing, such as making the sentencing read as more legitimate to the reader by drawing a clean line between villains and victim? The paragraph doesn't need to land on an answer, but right now it's not clear which move it's making. Note how this gap is raised: as a question toward a move the student hasn't made, not as an answer supplied.

A precision note, not a reasoning gap: "frequent reference" — the source uses the term twice, about one person. Worth checking whether "frequent" is the intended word.`;

export const CW2_SYSTEM_PROMPT = `You are the feedback engine for a formative practice exercise in a UK university criminology module (Becoming a Criminologist). Students practise the real coursework task — reading data sources, citing them, interpreting them, and relating them — and you give checkpoint feedback on their draft answers.

Formative only. You never grade, score, rank, or predict a mark, and you never say anything that reads as a grade-equivalent verdict. The app shows its own fixed disclaimer; never write one yourself.

Your feedback is built against the philosophy below. It is a set of specific, sometimes counter-intuitive judgement calls, each reached by testing draft feedback against real student answers and correcting it where it was wrong. Follow it precisely, including the worked examples — they are calibration, not decoration. The failure shown in Worked Example 1 (isolating a fragment and missing the hedge sitting right beside it) is the failure you are most likely to repeat: read the whole sentence and its neighbours before flagging anything.

${PHILOSOPHY}

## How to use the grader-only notes you are given

Each request includes "what a strong reading involves" and correct citation forms. These are for your eyes only. Use them to judge the student's answer; NEVER reveal or paraphrase them as the answer. When the student has missed something, ask an open question that points toward the gap (Principle 1) — do not state the missing reading.

## Output

Return ONLY the JSON object requested in the user message: no other text, no markdown code fences. Every string you write is plain prose in full sentences (no bullet points, no lists). Address the student directly in the second person. Be specific to what they actually wrote — quote or point to their own words, never generic. Keep each field to what is needed; the sufficiency_statement is a short plain verdict, and the socratic_prompt is one open question or two at most.`;

// ---------------------------------------------------------------------
// Answer keys (per data type)
// ---------------------------------------------------------------------

type Grading = {
  frame: string;
  correctCitation: { parenthetical: string; narrative: string; reference: string };
  citationNote: string;
  strongReading: string;
};

const ACCESS_DATE_NOTE =
  "The access date in the reference may be any plausible real date the student chooses — grade the structure (Available at / Accessed), not the specific date. In-text answers may be a bare citation or a full sentence containing it: assess the citation component (author, year, punctuation, placement), not the quality of the sentence's claim.";

export const CW2_GRADING: Record<Cw2ItemId, Grading> = {
  statistical: {
    frame:
      "STATISTICAL data. Frame: what the numbers measure versus what they are being used to claim — proxy measures, what the source can and cannot tell you, and more than one live explanation. The extract comes with a chart of the same figures; a chart is a way of representing statistical data, so it is part of this item, not a separate kind of source.",
    correctCitation: {
      parenthetical: "(Sentencing Academy, 2026)",
      narrative: "Sentencing Academy (2026) reports that ...",
      reference:
        "Sentencing Academy (2026) Intent to Supply (Class A Drug). Available at: https://www.sentencingacademy.org.uk/sentencinghub/snapshot/intent-to-supply-class-a-drug/ (Accessed: 24 September 2026).",
    },
    citationNote: ACCESS_DATE_NOTE,
    strongReading:
      "Description: accurately reports the near-doubling of convictions (under 6,000 in 2015 to over 10,500 in 2025), the 70% immediate imprisonment and 26% suspended sentence figures, and recognises what the figures do not show (they count convictions, not underlying activity, and say nothing about causes, offence seriousness, or reoffending). Interpretation: convictions are a proxy measure, so a rise could reflect more activity, more enforcement or better evidence, and/or harsher guidance; the sentencing split invites more than one reading (prior records vs guideline severity, etc.). Strongest answers also name the inferential move from proxy to claim (Principle 5) rather than only hedging with 'suggests'. The chart (grader-only description; the student was shown it, but do not assume they described it unless they say so): a bar chart titled 'Sentencing outcomes: intent to supply a Class A drug', y-axis 'Proportion of convictions' running 0 to 80, three bars — immediate custody 70%, suspended sentence order 26%, other disposal (community order, fine, etc.) 4% — with a footnote that the 4% 'other' figure is inferred from the remainder and not separately confirmed in the source. A student who engages with the chart may notice that footnote (a genuine observation about an inferred slice sitting alongside confirmed ones), that it shows proportions not counts, and that it has no time dimension (the ten-year rise is not visible). Reward such observations; do not penalise a student who works only from the written figures. Raise gaps as questions, never as supplied answers.",
  },
  image: {
    // NOTE: drafted — the philosophy document defines frames for statistical,
    // textual and documentary sources but none for an image. Check it against
    // the assessment brief.
    frame:
      "VISUAL data (an image). Frame: read it as a constructed image, not a neutral record — the subject, framing and composition, the text inside the image, and what the image invites a viewer to infer. This is an AI-generated illustration made for teaching, so it cannot be evidence of any real event or person; a strong answer treats it as a constructed image and recognises that it cannot show whether the person depicted is exploited.",
    correctCitation: {
      parenthetical: "(London South Bank University, 2026)",
      narrative: "London South Bank University (2026) presents ...",
      reference:
        "London South Bank University (2026) Young person on a station platform [AI-generated image]. Created for the module Becoming a Criminologist (CRM_4_BCR).",
    },
    citationNote:
      "There is no single correct string here — this is an AI-generated image created for the module, with no URL or named generating tool given to the student. Accept any reasonable, honestly labelled treatment, in the same spirit as the referencing brief's treatment of an internal memo: a responsible author (the university, the module, or a named AI tool if the student names one), the year 2026, a descriptive title, an '[AI-generated image]' style label, and an indication of where it came from (the module materials). Do NOT require a URL or an 'Accessed' date. Mark as flawed or missing: no year, no indication it is AI-generated or produced for the module, or presenting it as a real published photograph or crediting a real named photographer. In-text answers may be a bare citation or a sentence containing it: assess the citation component, not the sentence's claim.",
    strongReading:
      "What the image shows (grader-only; do not assume the student described it unless they say so): an evening, wet railway platform. A teenage boy in a grey hood, dark padded jacket and tracksuit trousers sits alone on a metal bench looking down at a phone; a takeaway coffee cup and a rail ticket are beside him, and a second phone is visible on or in his black sportswear-branded backpack. Behind him is a British Transport Police poster reading 'See it. Hear it. Report it. Could this be child exploitation?' with 'Speak to staff', 'Text 61016' and a phone number, and a silhouetted figure. A CCTV camera is on the pillar by him. A departures board shows London Euston, Birmingham New St and Manchester Piccadilly. Other passengers stand further along facing away; a train is arriving. Description: accurately reads these elements (especially the poster text and its physical placement directly beside the boy) and notes composition (he is in the foreground, alone, framed against the poster, while others stand apart). Interpretation: the image sets the boy right beside a poster asking whether what the viewer sees could be child exploitation, inviting them to read him as possibly at risk, and the surrounding cues (hood, phone, being alone, travel between cities, CCTV) supply the story. But none of it shows exploitation: the same cues describe an ordinary teenager, and there is no exploiter, no interaction and no evidence of anything. A strong answer holds more than one reading (a young person at risk; an ordinary teenager; an image constructed to prompt the viewer's own assumptions), names the limit of what an image like this can show, and — the sharper move — turns the constructed-image lens on its own reading: is the viewer reading the hood and phone as signs because the poster tells them to? Also relevant: it is an AI-generated illustration, so it depicts a stereotype rather than a real case. Raise gaps as questions, never as supplied answers.",
  },
  textual: {
    frame:
      "TEXTUAL (news-style) data. Frame: read as a constructed text — who is named as offender, who is described as exploited, what the closing quote is doing rhetorically, what is left out. Do not treat it as a neutral record.",
    correctCitation: {
      parenthetical: "(Merseyside Police, 2026)",
      narrative: "Merseyside Police (2026) describe ...",
      reference:
        "Merseyside Police (2026) Three Wirral men jailed for County Lines drug supply. Available at: https://www.merseyside.police.uk/news/merseyside/news/2026/april-2026/three-wirral-men-jailed-for-county-lines-drug-supply/ (Accessed: 24 September 2026).",
    },
    citationNote: ACCESS_DATE_NOTE,
    strongReading:
      "Description: accurately reads what the text says (nine years, five years, 28 months' custody for the men; suspended sentences with community service/rehabilitation for the women; a 16-year-old exploited by the group whose arrest began the investigation), and notices the framing — who is positioned as offender versus exploited (even though several of those sentenced are themselves young), what 'crime does not pay — it lands you in jail' is doing rhetorically, and what is absent (nothing about what happened to the 16-year-old afterwards). Precision matters: 'exploited' appears about one person; note if a student overstates how often or of whom. Interpretation: plausible, hedged readings of the sentencing pattern that include the possibility of individual circumstances the article does not report (a single case is one data point), and — the sharper move — turning the constructed-text lens back onto the exploitation framing itself (is repeating 'exploited' doing rhetorical work, e.g. drawing a clean line between villains and victim?). Raise gaps as questions, never as supplied answers.",
  },
  documentary: {
    frame:
      "DOCUMENTARY data (a policy/evaluation document). Frame: extract and evaluate the document's stated claims and evidence — does its own evidence support its own conclusions? This is deliberately NOT discourse analysis and NOT the constructed-text reading used for the news item (Principle 10). If the student analyses the document's rhetoric instead of its claims and evidence, that is a frame mismatch worth a question.",
    correctCitation: {
      parenthetical: "(Home Office, 2025)",
      narrative: "Home Office (2025) found ...",
      reference:
        "Home Office (2025) Evaluation of the County Lines Programme (updated) (January 2020 to January 2025). Available at: https://www.gov.uk/government/publications/evaluation-of-the-county-lines-programme/evaluation-of-the-county-lines-programme-updated-january-2020-to-january-2025 (Accessed: 24 September 2026).",
    },
    citationNote: ACCESS_DATE_NOTE,
    strongReading:
      "Description: accurately extracts the document's purpose (assessing the impact of County Lines Programme funding), that NRM safeguarding referrals are tracked as a distinct outcome measure alongside law enforcement activity and acquisitive crime, and its key finding — no statistically significant impact on acquisitive crime in the 2024 or updated 2025 assessment, despite earlier evaluations reporting a reduction in offences in exporting areas. Strong answers evaluate what evidence the document gives for its conclusions versus merely asserting them, and note what the extract cannot show. Interpretation: plausible, hedged explanations for the divergence between earlier and later evaluations and for a null finding on one outcome (e.g. measurement, displacement, time horizon), with more than one live reading, and honest verbs about what a null result does and does not demonstrate.",
  },
};

export const SYNTHESIS_GUIDANCE =
  "The student chose three of four sources: statistical (with a chart of the same figures), visual (an AI-generated image), textual, documentary (the statistical is always included). Judge the synthesis against the sources they actually chose. Useful observations, where those sources are present: the statistical item and the textual item's closing quote ('crime does not pay') both foreground custody as the dominant sentencing response, while the documentary item's more measured, evaluative finding (no significant impact on acquisitive crime) may sit comfortably alongside that or complicate it; the visual image and the press release are both constructed depictions of who is at risk and who is an offender, and the image is an AI-generated illustration rather than evidence of any real case. A strong synthesis characterises the actual relationship between the student's own three sources — a connection, a genuine tension, or a partial overlap are all valid — and builds an argument in which each step from evidence to conclusion follows. It must be a genuinely new reflection visible only from looking across the earlier answers, not a restatement of them. Do not require that a clean connection exists.";

// ---------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------

const REASONING_SHAPE = `"plausibility_or_reasoning":{"status":"sound|gap_found","sufficiency_statement":"string","socratic_prompt":"string"}`;
const MULTIPLICITY_SHAPE = `"multiplicity":{"status":"present|absent","note":"string"}`;
const EPISTEMIC_SHAPE = `"epistemic_framing":{"status":"well_framed|could_be_sharper","note":"string"}`;

export function buildDataTypePrompt(item: Cw2Item, input: ItemInput): string {
  const g = CW2_GRADING[item.id];
  return `CHECKPOINT: data_type — one completed data-type step (citation fields, description, and interpretation together, in one call).

${g.frame}

Source the student was given: ${item.sourceLine}
Extract shown to the student:
${item.content}

GRADER-ONLY — correct citation forms:
Parenthetical: ${g.correctCitation.parenthetical}
Narrative (source as grammatical subject): ${g.correctCitation.narrative}
Full reference: ${g.correctCitation.reference}
${g.citationNote}

GRADER-ONLY — what a strong reading involves (never reveal this; prompt toward gaps with questions):
${g.strongReading}

Question the student was asked for the description: ${item.descriptionPrompt}
Question the student was asked for the interpretation: ${item.interpretationPrompt}

STUDENT'S SUBMISSION
In-text citation, parenthetical form: ${input.parenthetical}
In-text citation, narrative form: ${input.narrative}
Full bibliographic reference: ${input.reference}
Description (what is this data saying): ${input.description}
Interpretation (what could explain this, and the wider social world): ${input.interpretation}

Assess:
1. citation — check the parenthetical and narrative forms SEPARATELY, plus the full reference (correct / flawed / missing each), with one short prose note covering what to fix. Lenient on inconsequential formatting variation; strict on structurally meaningful errors.
2. description_accuracy — is the source read correctly on its own terms (correct / flawed / missing), with a note.
3. plausibility_or_reasoning — assess whether the reasoning connecting evidence to claim actually holds (Principle 9), not whether hedging words are present. sufficiency_statement is a plain verdict (there is more to say here / this is well developed, no gap to flag), and socratic_prompt is a separate open question toward where to look next. Never blend them. Read full sentences and neighbours before flagging (Principle 6).
4. multiplicity — did the student hold more than one plausible reading open (present / absent)?
5. epistemic_framing — separately, does each reading's verb honestly represent its relationship to the data, and is the inferential move named where it matters (well_framed / could_be_sharper)?

Return ONLY this JSON object, no other text, no code fences:
{"checkpoint_type":"data_type","citation":{"parenthetical":"correct|flawed|missing","narrative":"correct|flawed|missing","bibliographic":"correct|flawed|missing","note":"string"},"description_accuracy":{"status":"correct|flawed|missing","note":"string"},${REASONING_SHAPE},${MULTIPLICITY_SHAPE},${EPISTEMIC_SHAPE}}`;
}

export function buildSynthesisPrompt(
  items: { item: Cw2Item; response: ItemResponse }[],
  input: SynthesisInput
): string {
  const earlier = items
    .map(
      ({ item, response }) =>
        `${item.kind} — ${item.sourceLine}\nStudent's description: ${response.description}\nStudent's interpretation: ${response.interpretation}`
    )
    .join("\n\n");

  return `CHECKPOINT: synthesis — fires once, after all three data-type steps are complete.

GRADER-ONLY — what a strong synthesis involves (never reveal this; prompt toward gaps with questions):
${SYNTHESIS_GUIDANCE}

The student's earlier answers on their three chosen sources (for context — the synthesis must not merely restate these):
${earlier}

Question 1 the student was asked: how do your sources relate to each other?
Student's answer: ${input.relationship}

Question 2 the student was asked: what's your argument about the broader picture?
Student's answer: ${input.argument}

Assess:
1. relationship — did the student accurately characterise the relationship between their sources? A connection found and explained, and a genuine tension or non-fit identified and explained, are BOTH valid passes (Principle 7); never require a clean connection. Status: connection_found, tension_found, or not_engaged (the failure: not engaging with the relationship, or forcing a connection that isn't there).
2. plausibility_or_reasoning — the explicit reasoning-gap check (Principle 8): does each step from evidence to the stated conclusion actually follow? status sound or gap_found. sufficiency_statement is a plain verdict; socratic_prompt is a separate open question toward where to look next. Never blend them, never supply the missing reasoning.
3. multiplicity — does the argument consider the strongest alternative reading its own evidence could support (present / absent)?
4. epistemic_framing — do the verbs honestly represent what the evidence can support (well_framed / could_be_sharper)?

Return ONLY this JSON object, no other text, no code fences:
{"checkpoint_type":"synthesis","relationship":{"status":"connection_found|tension_found|not_engaged","note":"string"},${REASONING_SHAPE},${MULTIPLICITY_SHAPE},${EPISTEMIC_SHAPE}}`;
}

// ---------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------

const TERNARY = ["correct", "flawed", "missing"];

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

function validReasoning(v: unknown): boolean {
  return (
    isObj(v) &&
    (v.status === "sound" || v.status === "gap_found") &&
    isStr(v.sufficiency_statement) &&
    isStr(v.socratic_prompt)
  );
}
function validMultiplicity(v: unknown): boolean {
  return isObj(v) && (v.status === "present" || v.status === "absent") && isStr(v.note);
}
function validEpistemic(v: unknown): boolean {
  return isObj(v) && (v.status === "well_framed" || v.status === "could_be_sharper") && isStr(v.note);
}

export function isValidDataTypeFeedback(value: unknown): value is DataTypeFeedback {
  if (!isObj(value) || value.checkpoint_type !== "data_type") return false;
  const c = value.citation;
  if (!isObj(c) || !isStr(c.note)) return false;
  for (const k of ["parenthetical", "narrative", "bibliographic"]) if (!TERNARY.includes(c[k] as string)) return false;
  const d = value.description_accuracy;
  if (!isObj(d) || !TERNARY.includes(d.status as string) || !isStr(d.note)) return false;
  return validReasoning(value.plausibility_or_reasoning) && validMultiplicity(value.multiplicity) && validEpistemic(value.epistemic_framing);
}

export function isValidSynthesisFeedback(value: unknown): value is SynthesisFeedback {
  if (!isObj(value) || value.checkpoint_type !== "synthesis") return false;
  const r = value.relationship;
  if (!isObj(r) || !["connection_found", "tension_found", "not_engaged"].includes(r.status as string) || !isStr(r.note)) return false;
  return validReasoning(value.plausibility_or_reasoning) && validMultiplicity(value.multiplicity) && validEpistemic(value.epistemic_framing);
}
