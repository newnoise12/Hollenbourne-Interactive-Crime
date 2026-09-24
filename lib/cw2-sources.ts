// The Mock CW2 practice pack's 4 data items — a scaffolded practice run of
// the real CW2 assignment. Content ported verbatim from
// Reference/case-content/quizzes/hollenbourne-mock-cw2-pack.md. Explicitly
// unassessed (per that doc): see lib/cw2-practice.ts for the persisted,
// ungraded-in-the-trust-bonus-sense practice draft this feeds.
//
// correctCitation and interpretationGuidance are server-only grading
// inputs — never sent to the client as a whole catalog (only looked up
// per-item-id inside the API route), so a student can't read the answer
// key out of the page source before attempting an item. Same precaution
// lib/reference-tasks.ts already uses for Week 3 Stage 2.

export const MOCK_CW2_WEEK = 11;

export type Cw2ItemId = "statistical" | "visual" | "textual" | "documentary";

export type Cw2Item = {
  id: Cw2ItemId;
  kind: string; // short label chip, e.g. "Statistical data"
  title: string;
  content: string; // the raw facts/prose shown to the student
  image?: string; // public/-relative path, for the visual item
  correctCitation: { inText: string; reference: string };
  interpretationGuidance: string; // what a strong interpretation should touch on
};

export const CW2_ITEMS: Cw2Item[] = [
  {
    id: "statistical",
    kind: "Statistical data",
    title: "1. Statistical data — Intent to Supply (Class A Drug)",
    content:
      "Sentencing Academy (2026) Intent to Supply (Class A Drug). Data calculated from Ministry of Justice, Criminal Justice Statistics Quarterly: December 2025.\n\nConvictions for intent to supply a Class A drug have almost doubled over the last ten years, from under 6,000 in 2015 to over 10,500 in 2025. Of these convictions, 70% resulted in a term of immediate imprisonment, and a further 26% resulted in a Suspended Sentence Order.",
    correctCitation: {
      inText: "(Sentencing Academy, 2026)",
      reference:
        "Sentencing Academy (2026) Intent to Supply (Class A Drug). Available at: https://www.sentencingacademy.org.uk/sentencinghub/snapshot/intent-to-supply-class-a-drug/ (Accessed: 24 September 2026).",
    },
    interpretationGuidance:
      "A strong interpretation notices both the near-doubling of convictions over ten years AND the heavy skew toward custodial outcomes (70% immediate imprisonment + 26% suspended = 96% of convictions resulting in some form of custodial sentence), and connects this to broader trends in drug enforcement or sentencing severity rather than just restating the numbers.",
  },
  {
    id: "visual",
    kind: "Visual data",
    title: "2. Visual data — sentencing outcomes chart",
    content:
      "This chart shows the same sentencing outcomes as the statistical item, presented visually. The \"other disposal\" figure (4%) is inferred from the remainder of the two confirmed figures — it isn't separately broken down in the original source, which is itself worth thinking about when interpreting the chart.",
    image: "/quiz-charts/chart-mock-cw2-sentencing-outcomes.png",
    correctCitation: {
      inText: "(Sentencing Academy, 2026)",
      reference:
        "Sentencing Academy (2026) Intent to Supply (Class A Drug). Available at: https://www.sentencingacademy.org.uk/sentencinghub/snapshot/intent-to-supply-class-a-drug/ (Accessed: 24 September 2026).",
    },
    interpretationGuidance:
      "A strong interpretation notices that this is the same underlying data as the statistical item, presented differently, and engages with the fact that the 'other disposal' (4%) slice is inferred, not directly reported — a genuine observation about how visualising data can smooth over a gap in the underlying source rather than just describing the chart's shape.",
  },
  {
    id: "textual",
    kind: "Textual data",
    title: "3. Textual data — police press release",
    content:
      "Three Wirral men jailed for County Lines drug supply\n\nThree men have been jailed and four women sentenced for their part in a conspiracy to supply drugs that exploited children.\n\nAfter guilty pleas at earlier hearings, three men and three women were sentenced at Liverpool Crown Court. Kieron Platt, 23, was sentenced to nine years in prison for conspiracy to supply Class A, B and C drugs as well as conspiracy to blackmail. Dylan Hamlet, 23, received five years for the same offences. Ben Smith, 22, received 28 months' custody. Abigail Pengelly, 30, received two years suspended for 18 months plus 240 hours' community service. Chloe Mitchell, 19, received 20 months suspended for 18 months plus 200 hours' community service. Millie Piercy, 21, received four months' custody suspended for 12 months plus a rehabilitation order.\n\nThe investigation began after a 16-year-old boy exploited by the group was arrested by officers; telecoms analysis subsequently identified Platt as the person who had involved him in a drugs line supplying cocaine, ketamine, cannabis and nitrous oxide. A senior officer commented that the sentencing \"shows that crime does not pay — it lands you in jail.\"\n\nRead it as a constructed text: notice who is named as an offender and who is described as exploited, even though several of those sentenced are themselves quite young; notice what the closing quote is doing rhetorically; notice what isn't discussed (what happened to the 16-year-old afterwards, for instance, isn't mentioned at all).",
    correctCitation: {
      inText: "(Merseyside Police, 2026)",
      reference:
        "Merseyside Police (2026) Three Wirral men jailed for County Lines drug supply. Available at: https://www.merseyside.police.uk/news/merseyside/news/2026/april-2026/three-wirral-men-jailed-for-county-lines-drug-supply/ (Accessed: 24 September 2026).",
    },
    interpretationGuidance:
      "A strong interpretation reads this as a constructed text rather than a neutral record: who gets named as an offender versus described as exploited despite several sentenced individuals being young themselves, what the closing 'crime does not pay' quote is doing rhetorically, and what is conspicuously absent (no mention of what happened to the exploited 16-year-old afterwards).",
  },
  {
    id: "documentary",
    kind: "Documentary data",
    title: "4. Documentary data — County Lines Programme evaluation",
    content:
      "Home Office (2025) Evaluation of the County Lines Programme (updated) (January 2020 to January 2025).\n\nThis evaluation assesses the impact of the government's County Lines Programme funding. It reports that county lines-flagged National Referral Mechanism (NRM) safeguarding referrals are tracked as a distinct outcome measure alongside law enforcement activity (drug and weapon possession offences) and acquisitive crime. Notably, the evaluation found no statistically significant impact of the Programme on acquisitive crime in either its 2024 or updated 2025 assessment, despite earlier evaluations reporting a reduction in offences in exporting areas.\n\nThis is a more technical, analytical document than the press release above — an evaluation written for policy audiences, weighing evidence about what the programme has and hasn't achieved, rather than reporting a single result.",
    correctCitation: {
      inText: "(Home Office, 2025)",
      reference:
        "Home Office (2025) Evaluation of the County Lines Programme (updated) (January 2020 to January 2025). Available at: https://www.gov.uk/government/publications/evaluation-of-the-county-lines-programme/evaluation-of-the-county-lines-programme-updated-january-2020-to-january-2025 (Accessed: 24 September 2026).",
    },
    interpretationGuidance:
      "A strong interpretation notices the more measured, evaluative tone compared to the press release, and specifically engages with the finding of no statistically significant impact on acquisitive crime despite earlier, more positive evaluations — a genuinely complicating data point for any simple 'the programme is working' narrative.",
  },
];

export function getCw2Item(id: string): Cw2Item | undefined {
  return CW2_ITEMS.find((item) => item.id === id);
}

// The pack's own closing paragraph — used only in the synthesis grading
// prompt, never shown to students, so it functions as guidance for what a
// strong synthesis should notice rather than a spoiler.
export const SYNTHESIS_GUIDANCE =
  "The pairing worth noticing across all four items: the statistical and visual items both emphasise custodial outcomes as the dominant sentencing response, while the textual item's own closing quote (\"crime does not pay\") reinforces that same framing rhetorically — worth considering whether the documentary item's more measured, evaluative tone sits comfortably alongside that, or complicates it (e.g. the finding of no significant impact on acquisitive crime cuts against a simple 'tough sentencing is working' narrative). A strong synthesis engages with at least one genuine point of tension or complication between the chosen items, not just points of agreement.";
