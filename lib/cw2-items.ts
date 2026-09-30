// Student-facing content for the Mock CW2 practice form — safe to import
// from client components. Everything that would give away an answer (correct
// citations, what a strong reading involves, the feedback prompt) lives in
// lib/cw2-grading.ts, which must never be imported client-side.
//
// Structure follows Reference/case-content/technical-briefs/hollenbourne-mock-cw2-pack.md
// (the step-by-step form): three data types in a fixed sequence, each with
// citation (both in-text forms + full reference), description and
// interpretation fields, then a synthesis step.

export const MOCK_CW2_WEEK = 11;

// Hardcoded, never AI-generated (feedback brief v2, "non-negotiable").
export const FORMATIVE_DISCLAIMER = "This is formative feedback only and does not indicate or predict your final grade.";

// AI checks per student per (London) day — see cw2_mock_drafts.checks_today.
export const DAILY_CHECK_CAP = 15;

export type Cw2ItemId = "statistical" | "image" | "textual" | "documentary";

export type Cw2Item = {
  id: Cw2ItemId;
  kind: string; // "Statistical data"
  sourceLine: string; // the reference-style line naming the source
  content: string; // the extract the student reads
  image?: string; // public/-relative path: the statistical item's chart, or the visual item's image
  citationExamples: { parenthetical: string; narrative: string };
  descriptionPrompt: string;
  interpretationPrompt: string;
};

const INTERPRETATION_PROMPT =
  "There's usually more than one plausible explanation — give at least one, and consider whether a different one could also fit this same data.";

export const CW2_ITEMS: Cw2Item[] = [
  {
    id: "statistical",
    kind: "Statistical data",
    sourceLine:
      "Sentencing Academy (2026) Intent to Supply (Class A Drug). Data from Ministry of Justice, Criminal Justice Statistics Quarterly: December 2025.",
    content:
      "Convictions for intent to supply a Class A drug have almost doubled over the last ten years, from under 6,000 in 2015 to over 10,500 in 2025. Of these convictions, 70% resulted in a term of immediate imprisonment, and a further 26% resulted in a Suspended Sentence Order.\n\nThe same sentencing outcomes are also shown as a chart, below.",
    // A chart is a way of representing statistical data, so it belongs here
    // rather than being a separate "visual" option (visual data = an image).
    image: "/quiz-charts/chart-mock-cw2-sentencing-outcomes.png",
    citationExamples: {
      parenthetical: "...convictions have nearly doubled (Sentencing Academy, 2026).",
      narrative: "Sentencing Academy (2026) reports that convictions have nearly doubled.",
    },
    descriptionPrompt:
      "Describe what the source actually shows — in the figures and in the chart — on its own terms, including anything it doesn't or can't tell you. Write in full sentences — this is the same register the real 1000-word discussion needs, not itemised notes.",
    interpretationPrompt: INTERPRETATION_PROMPT,
  },
  {
    id: "image",
    kind: "Visual data",
    sourceLine:
      "London South Bank University (2026) Young person on a station platform [AI-generated image]. Created for the module Becoming a Criminologist (CRM_4_BCR).",
    content: "An AI-generated image created for this module. It is an illustration, not a record of a real event or a real person.",
    image: "/cw2-images/station-platform.webp",
    citationExamples: {
      parenthetical: "...young people at risk are often pictured alone with a phone (London South Bank University, 2026).",
      narrative: "London South Bank University (2026) presents a young person waiting alone on a station platform.",
    },
    descriptionPrompt:
      "Describe what the image shows, on its own terms — who and what is depicted, how it is composed, and any text visible in it. Then say what it can and cannot tell you. Write in full sentences, not itemised notes.",
    interpretationPrompt:
      "What is the image inviting a viewer to think, and how does that connect to the wider social world? There's usually more than one plausible reading — give at least one, and consider whether a different one could also fit what is actually shown.",
  },
  {
    id: "textual",
    kind: "Textual data",
    sourceLine: "Merseyside Police (2026) Three Wirral men jailed for County Lines drug supply.",
    content:
      "Three men have been jailed and four women sentenced for their part in a conspiracy to supply drugs that exploited children. After guilty pleas at earlier hearings, three men and three women were sentenced at Liverpool Crown Court. Kieron Platt, 23, was sentenced to nine years for conspiracy to supply Class A, B and C drugs and conspiracy to blackmail. Dylan Hamlet, 23, received five years. Ben Smith, 22, received 28 months' custody. Abigail Pengelly, 30, Chloe Mitchell, 19, and Millie Piercy, 21, all received suspended sentences with community service or rehabilitation requirements.\n\nThe investigation began after a 16-year-old boy exploited by the group was arrested; telecoms analysis identified Platt as the person who had involved him in the drugs line. A senior officer commented that the sentencing \"shows that crime does not pay — it lands you in jail.\"",
    citationExamples: {
      parenthetical: "...the sentencing was framed as a deterrent (Merseyside Police, 2026).",
      narrative: "Merseyside Police (2026) describe the sentencing as a demonstration that crime does not pay.",
    },
    descriptionPrompt:
      "This is a constructed text, not a neutral record — who's named as offender, who's described as exploited, what the closing quote is doing, what's left out. Full sentences, not notes.",
    interpretationPrompt: INTERPRETATION_PROMPT,
  },
  {
    id: "documentary",
    kind: "Documentary data",
    sourceLine: "Home Office (2025) Evaluation of the County Lines Programme (updated) (January 2020 to January 2025).",
    content:
      "This evaluation assesses the impact of the government's County Lines Programme funding. It reports that county lines-flagged National Referral Mechanism (NRM) safeguarding referrals are tracked as a distinct outcome measure alongside law enforcement activity (drug and weapon possession offences) and acquisitive crime. Notably, the evaluation found no statistically significant impact of the Programme on acquisitive crime in either its 2024 or updated 2025 assessment, despite earlier evaluations reporting a reduction in offences in exporting areas.",
    citationExamples: {
      parenthetical: "...no significant impact on acquisitive crime was found (Home Office, 2025).",
      narrative: "Home Office (2025) found no statistically significant impact on acquisitive crime.",
    },
    descriptionPrompt:
      "Unlike a news source, this isn't about rhetorical construction — it's an analytical policy document. Extract its stated purpose and key claims: what does it conclude, and does it give evidence for those conclusions, or mostly assert them? Full sentences.",
    interpretationPrompt: INTERPRETATION_PROMPT,
  },
];

export function getCw2Item(id: string): Cw2Item | undefined {
  return CW2_ITEMS.find((item) => item.id === id);
}

export const SYNTHESIS_PROMPTS = {
  intro: "Now that you've worked through your three data types, step back and look across all three together.",
  relationship:
    "How do your sources relate to each other? They might reinforce each other, sit in genuine tension, or only partly overlap. A clearly-explained mismatch is just as strong an answer as a clean connection — the goal is accurately characterising the relationship between them, not forcing one that isn't really there.",
  argument:
    "What's your argument about the broader picture? State your position clearly, showing the reasoning that connects your evidence to your conclusion — not just the conclusion itself — and consider the strongest alternative reading your own evidence could also support.",
  note: "This should be a genuinely new reflection, not a restatement of what you already wrote in the \"broader social world\" boxes above — the value here is in looking across your own earlier answers together and noticing something only visible from that wider vantage point.",
};
