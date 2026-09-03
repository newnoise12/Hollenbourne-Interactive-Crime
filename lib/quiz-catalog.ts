// Static content for the Week 2 trust activity — ported from
// Reference/week2-trustworthiness-quiz (1).md. Not stored in the database;
// team attempts live in the quizAttempts table.
//
// Mechanic: students click items within a stage in the order they'd rank
// them, most to least trustworthy (first click = rank 1). Stage 1 (3 items)
// is anchored by a real academic source; Stage 2 (5 items) by a real
// government source — the two never compete directly against each other.
//
// Scoring, mapped onto the existing 0-3 trust-bonus scale:
// - Stage 1 correct = 1 point. Strict order: all 3 items must match
//   their correctRank exactly.
// - Stage 2 correct = 2 points. Band tolerance: item 2A must be ranked
//   1st and 2E must be ranked 5th, but 2B/2C/2D may appear in any order
//   among themselves and still count.
// - No partial credit within a stage — each stage is all-or-nothing.

export type QuizItem = {
  id: string;
  stage: 1 | 2;
  correctRank: number; // 1-based position within its stage
  sourceType: string; // short label chip, e.g. "Academic article"
  kicker?: string; // byline / handle / posted-by line
  heading?: string; // headline or citation, if the item has one
  body: string; // paragraphs joined by \n\n
  trustMarkers: string; // feedback revealed after scoring
};

export const QUIZ_ID = "week2-trustworthiness";
export const QUIZ_WEEK = 2;
export const QUIZ_TITLE = "Week 2 Trust Activity: Ranking Sources by Trustworthiness";
export const MAX_SCORE = 3;

export const STAGE_1_ITEMS: QuizItem[] = [
  {
    id: "1A",
    stage: 1,
    correctRank: 1,
    sourceType: "Academic article",
    heading:
      "Robinson, G., McLean, R., & Densley, J. (2019) 'Working county lines: child criminal exploitation and illicit drug dealing in Glasgow and Merseyside', International Journal of Offender Therapy and Comparative Criminology, 63(5), pp. 694–711.",
    body: "One of the foundational academic pieces in county lines research. Presents qualitative findings from interviews with practitioners working on serious organised crime, and with people involved in street gangs and drug supply, in Glasgow and Merseyside. Peer-reviewed, named authors with clear academic affiliations, methodology stated, full reference list.",
    trustMarkers:
      "Peer-reviewed, named authors with clear academic affiliations, a stated methodology, and a full reference list — the benchmark this stage is anchored against.",
  },
  {
    id: "1B",
    stage: 1,
    correctRank: 2,
    sourceType: "Local news article",
    kicker: "UK Crime Watch Today, Staff Reporter",
    heading: "COUNTY LINES CHAOS: Gangs 'Taking Over' Britain's Streets, Residents Say",
    body: "Fears are growing that county lines gangs are running out of control in towns across the country, with locals saying they feel unsafe walking the streets after dark.\n\n\"It's got so much worse the last couple of years,\" said one local shopkeeper, who did not want to be named. \"You see them hanging round the estate, and everyone knows what's going on, but nobody does anything.\"\n\nInsiders claim the number of lines operating nationally has \"exploded\" in recent years, though exact figures are difficult to come by. A concerned parent, who asked not to be identified, said she now walks her children to school a different way to avoid a group she believes are involved.\n\nPolice were approached for comment.",
    trustMarkers:
      "No named reporter (the byline is a role, not a person), every source is anonymous, no data cited despite claims of an \"explosion,\" no named report or study referenced, and \"police were approached for comment\" implies no substantive response was actually obtained.",
  },
  {
    id: "1C",
    stage: 1,
    correctRank: 3,
    sourceType: "Social media post",
    kicker: "@localwatch_essex · 14h",
    body: 'COUNTY LINES GANGS ARE RECRUITING AT THE SCHOOL GATES near me!!! wake up people this is happening RIGHT NOW and nobody is talking about it 😡\n47 likes · 12 reposts\n\n↳ @quietobserver22 replying: source? genuinely asking, this is a big claim\n↳ @localwatch_essex replying: just what I\'ve heard around, everyone knows it\'s true\n\n3 replies',
    trustMarkers:
      "Anonymous/pseudonymous account, no evidence offered even when directly asked, \"everyone knows it's true\" as the only justification, and engagement metrics (likes/reposts) don't indicate accuracy.",
  },
];

export const STAGE_2_ITEMS: QuizItem[] = [
  {
    id: "2A",
    stage: 2,
    correctRank: 1,
    sourceType: "Government source",
    heading: "Home Office (2026) County Lines Programme data and County Lines Programme overview. Available at: gov.uk.",
    body: "Official data on Programme Taskforce and Surge Fund enforcement activity (line closures, arrests, safeguarding referrals), alongside the Programme's own overview of what county lines are and how the funding works. Published under the Open Government Licence, Crown copyright, with defined data sources and explicit caveats about what the figures do and don't measure.",
    trustMarkers:
      "Published under the Open Government Licence, Crown copyright, with defined data sources and explicit caveats about what the figures do and don't measure — the benchmark this stage is anchored against.",
  },
  {
    id: "2B",
    stage: 2,
    correctRank: 2,
    sourceType: "Local news article",
    kicker: "Dana Whitmore, Regional Correspondent",
    heading: "Shock New Figures Reveal Scale of County Lines Crisis",
    body: 'New figures reportedly show a sharp rise in county lines activity across the region, according to a recently released report.\n\nA police spokesperson said the force was "taking the issue extremely seriously" and continuing to invest in tackling exploitation. The report is said to highlight particular concern around children being drawn into the trade at a younger age than previously recorded.\n\nThe force did not respond to a request for the specific figures referenced in the report by the time of publication.',
    trustMarkers:
      "A named reporter this time (more credible-looking on the surface), but \"a recently released report\" and \"reportedly show\" never name or link the actual source, the quote is genuine-sounding but generic and doesn't confirm any of the claimed figures, and the one specific request for the underlying data goes unanswered. Deliberately better-presented than 1B, to test whether you can look past surface professionalism to the same underlying sourcing gap.",
  },
  {
    id: "2C",
    stage: 2,
    correctRank: 3,
    sourceType: "Study/revision website",
    kicker: "Social Science Facts — County Lines: Key Facts | Criminology & Sociology Revision — Last updated: March 2026",
    body: "County lines is a term used to describe how gangs and organised crime groups move drugs from cities into smaller towns, often using children or vulnerable people to do so. This is a growing issue in the UK and has been linked to increased violence and exploitation of young people.\n\nKey facts:\n• County lines gangs use dedicated phone lines to organise drug sales\n• Children as young as 12 have been recruited into county lines operations\n• The practice is closely linked to knife crime and gang violence\n• Vulnerable adults' homes are sometimes used to store drugs, known as \"cuckooing\"\n\nThis is an important topic for A-Level and undergraduate Criminology students to understand as part of wider debates around youth justice and exploitation.",
    trustMarkers:
      "No named author, no references or citations for any individual claim, no visible editorial or review process — just a \"last updated\" date. Deliberately the trickiest item in the set: the content is broadly accurate (nothing here is actually false), but that's exactly the point worth drawing out — accurate-sounding content and a trustworthy, verifiable source are two different things, and this page fails as the latter regardless of the former. Could you cite this page in an assignment? Why not, even if everything on it happens to be true?",
  },
  {
    id: "2D",
    stage: 2,
    correctRank: 4,
    sourceType: "Opinion blog post",
    kicker: 'Posted on Substack by "Concerned Citizen Blog"',
    heading: "Why Nobody Is Taking This Seriously (My Thoughts)",
    body: "I've lived round here my whole life and I can tell you, this county lines thing is way bigger than anyone in charge wants to admit. I know a family whose son got mixed up in it and it destroyed them. That's not a statistic, that's real life, and I think people need to stop hiding behind reports and numbers and start listening to people like me who actually see it happening.",
    trustMarkers:
      "Self-published, explicitly framed as opinion (\"my thoughts\"), a single anecdote generalised to a sweeping claim, and an explicit dismissal of \"reports and numbers\" in favour of personal testimony — personal accounts have real value, but as a supplement to evidence, not a substitute for it. Ranked above the AI item below despite its weak evidentiary basis because it is at least a fixed, attributable text with a real (if pseudonymous) person accountable for it.",
  },
  {
    id: "2E",
    stage: 2,
    correctRank: 5,
    sourceType: "AI-generated summary",
    kicker: '[AI-generated summary — no source attached] — Prompt: "Tell me about county lines in the UK"',
    body: 'County lines refers to a form of organised criminal activity where drug supply networks are extended from urban areas into smaller towns and rural areas, primarily involving the trafficking and exploitation of vulnerable individuals, particularly children and young people, to facilitate the movement and sale of illegal drugs. The term originates from the dedicated mobile phone "lines" used by organised crime groups to coordinate sales activity across these networks. County lines operations are widely recognised as involving significant harm, including violence, sexual exploitation, and coercion of those recruited, and represent a growing area of concern for law enforcement, safeguarding professionals, and policymakers across the UK. Recent estimates suggest that thousands of children are affected annually, and the phenomenon has prompted a range of policy responses, including dedicated funding programmes and cross-agency initiatives aimed at disruption and safeguarding.',
    trustMarkers:
      "Fluent, comprehensive-sounding, and broadly consistent with the real material elsewhere in this pack — which is precisely the danger. There is no named author, no editorial process, no fixed or stable version to check against, and \"recent estimates suggest\" cites nothing at all. Most importantly: a fabricated detail would read with exactly the same confident tone as an accurate one, and nothing in the text itself gives a reader any way to tell the difference. It fails the most basic requirement of a usable source — a fixed, attributable, checkable text — even more completely than the opinion blog above it. Direct primary sources (2A) and even flawed journalism (2B) can be checked, corrected, or traced back to a person; this cannot. This is why an AI-generated summary should never substitute for reading the actual source it's drawing on.",
  },
];

export function scoreAttempt(stage1Order: string[], stage2Order: string[]): number {
  const stage1Correct = STAGE_1_ITEMS.every((item) => stage1Order[item.correctRank - 1] === item.id);

  const anchor2A = STAGE_2_ITEMS.find((i) => i.id === "2A")!;
  const anchor2E = STAGE_2_ITEMS.find((i) => i.id === "2E")!;
  const stage2Correct =
    stage2Order[anchor2A.correctRank - 1] === anchor2A.id && stage2Order[anchor2E.correctRank - 1] === anchor2E.id;

  return (stage1Correct ? 1 : 0) + (stage2Correct ? 2 : 0);
}

export function isValidOrder(order: string[], items: QuizItem[]): boolean {
  if (order.length !== items.length) return false;
  const ids = new Set(items.map((i) => i.id));
  const seen = new Set<string>();
  for (const id of order) {
    if (!ids.has(id) || seen.has(id)) return false;
    seen.add(id);
  }
  return true;
}
