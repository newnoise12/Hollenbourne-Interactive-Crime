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
export const MAX_ATTEMPTS = 3;

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

// =====================================================================
// Weeks 4-6 trust activities — mcq/multiselect quizzes recovered from a
// standalone prototype build (see CLAUDE.md's "Repo location" section) and
// ported here. Unlike Week 2's bespoke ranking quiz above, these share one
// generic scoring + attempt-storage path (lib/quiz.ts's
// submitGenericQuizAttempt/getGenericQuizAttempts) rather than dedicated
// functions each.
// =====================================================================

export type McqQuestion = {
  q: string;
  options: string[];
  correct: number; // index into options
  explain: string;
  // A short passage shown immediately before this question, distinct from
  // the stage's own intro — for a mid-stage reveal (e.g. a confound
  // explained only once the "tempting" earlier questions are answered) or
  // a source text the question is directly about.
  context?: string;
};

export type McqStage = {
  label?: string;
  intro?: string;
  image?: string; // path under public/, e.g. "/quiz-charts/chart-x.png"
  questions: McqQuestion[];
};

export type McqQuizDef = {
  id: string;
  kind: "mcq";
  week: number;
  title: string;
  intro?: string;
  // Maps total-correct-across-all-stages to a 0-3 trust bonus. The highest
  // threshold whose minCorrect the score meets or exceeds wins.
  bonusThresholds: [minCorrect: number, bonus: number][];
  stages: McqStage[];
};

export type MultiselectOption = { id: string; label: string; correct: boolean };

export type MultiselectQuizDef = {
  id: string;
  kind: "multiselect";
  week: number;
  title: string;
  intro?: string;
  passage?: string; // the argument/extract being diagnosed
  prompt: string;
  options: MultiselectOption[];
};

export type QuizDef = McqQuizDef | MultiselectQuizDef;

export const PACE_QUIZ: McqQuizDef = {
  id: "pace",
  kind: "mcq",
  week: 5,
  title: "PACE Quiz",
  intro: "A knowledge-check on the Police and Criminal Evidence Act 1984 — core provisions only. Multiple choice, one correct answer each.",
  bonusThresholds: [
    [0, 0],
    [2, 1],
    [4, 2],
    [6, 3],
  ],
  stages: [
    {
      questions: [
        {
          q: "Under PACE, what standard must police meet to lawfully arrest someone without a warrant?",
          options: [
            "Proof beyond reasonable doubt that they committed the offence",
            "A balance of probabilities that they committed the offence",
            "Reasonable grounds to suspect they committed the offence, and that arrest is necessary",
            "Reasonable grounds to suspect an offence was committed, regardless of necessity",
          ],
          correct: 2,
          explain:
            "Arrest under PACE s.24 requires both reasonable grounds to suspect (a genuinely low bar) and that arrest is necessary for one of a set of specific reasons — it isn't enough to just suspect someone; the arrest itself has to be justified as necessary.",
        },
        {
          q: "How long can police normally detain a suspect without charge before they must charge or release them?",
          options: ["12 hours", "24 hours", "48 hours", "72 hours"],
          correct: 1,
          explain:
            "The standard limit is 24 hours from the “relevant time.” This can be extended to 36 hours with authorisation from a superintendent (for indictable offences only), and up to a maximum of 96 hours with a magistrates' court warrant.",
        },
        {
          q: "When is a person entitled to free legal advice from a solicitor under PACE?",
          options: [
            "Only if they are formally charged",
            "Only if they specifically ask for a duty solicitor by name",
            "At any time they are detained or interviewed under caution",
            "Only during the first 24 hours of detention",
          ],
          correct: 2,
          explain:
            "The right to free, independent legal advice (PACE s.58) applies any time someone is detained or being interviewed under caution — not just after charge, and regardless of whether they know a solicitor's name.",
        },
        {
          q: "What is the correct standard caution wording?",
          options: [
            "“You have the right to remain silent. Anything you say can be used against you in court.”",
            "“You do not have to say anything. But it may harm your defence if you do not mention when questioned something which you later rely on in court. Anything you do say may be given in evidence.”",
            "“You are required to answer all questions truthfully or face further charges.”",
            "“You may remain silent until a solicitor arrives, after which you must answer all questions.”",
          ],
          correct: 1,
          explain:
            "Option A is the American Miranda warning, a common mix-up — the England and Wales caution is different in an important way: staying silent can still count against you later if you rely on something in court you didn't mention at interview. This is the exact wording used throughout the Hollenbourne interview transcripts.",
        },
        {
          q: "What must police have to lawfully stop and search someone under PACE?",
          options: [
            "Reasonable suspicion connected to specific, objective factors — never someone's personal characteristics alone",
            "Any suspicion at all, however vague",
            "A specific tip-off from a named informant",
            "Written authorisation from a senior officer for every individual search",
          ],
          correct: 0,
          explain:
            "PACE Code A explicitly states reasonable suspicion can never be based on personal factors like race, age, or appearance alone — it must rest on objective factors (behaviour, information received, matching a specific description).",
        },
        {
          q: "A suspect is invited to a “voluntary interview under caution” rather than arrested. What does this actually mean for them?",
          options: [
            "Nothing — it carries identical legal weight to being arrested",
            "They are free to leave at any time and cannot be made to stay, even though the caution still applies",
            "They are not entitled to a solicitor because they haven't been arrested",
            "Anything they say cannot be used in court since they weren't arrested",
          ],
          correct: 1,
          explain:
            "Voluntary means free to leave, full stop — a real, meaningful legal distinction, not just a softer tone of voice. Everything else about the caution (the right to legal advice, the adverse-inference risk) still applies exactly as it would under arrest. This is exactly Martin Burgess's interim interview — voluntary, under caution, but genuinely free to leave.",
        },
      ],
    },
  ],
};

export const DARK_FIGURE_QUIZ: McqQuizDef = {
  id: "dark-figure",
  kind: "mcq",
  week: 4,
  title: "Dark Figure of Crime Quiz",
  intro: "Tests data interpretation directly, using real ONS statistics for Stages 1–2 and illustrative Hollenbourne data for Stage 3.",
  bonusThresholds: [
    [0, 0],
    [4, 1],
    [7, 2],
    [9, 3],
  ],
  stages: [
    {
      label: "Stage 1 — reading a single chart",
      image: "/quiz-charts/chart-reporting-rates.png",
      intro:
        "England and Wales measures crime two main ways. Police recorded crime counts offences that come to police attention. The Crime Survey for England and Wales (CSEW) asks a large, representative sample of people directly about their experiences, whether or not they ever reported them — so it can tell us what share of crimes actually get reported in the first place (Figure 1).",
      questions: [
        {
          q: "According to Figure 1, approximately what percentage of fraud incidents are reported to the police?",
          options: ["60%", "42%", "12%", "90%"],
          correct: 2,
          explain:
            "A direct read from the chart — worth including even though it's simple, since rushed readers sometimes misread the chart itself even while getting the harder reasoning questions right.",
        },
        {
          q: "Figure 1 shows burglary reported far more often than fraud. What's the most likely reason for the difference?",
          options: [
            "Burglary is a more serious crime than fraud, so victims care more",
            "Burglary victims usually need a police crime reference number to claim on home insurance, giving a practical reason to report that fraud victims often don't have",
            "Fraud is a newer type of crime that police don't take seriously yet",
            "There is no real difference — the gap is just random variation in the data",
          ],
          correct: 1,
          explain:
            "This is the actual explanatory mechanism ONS itself gives — not that burglary is inherently more “reportable,” but that insurance creates a direct practical incentive fraud typically doesn't.",
        },
        {
          q: "The “All CSEW-comparable crime” bar shows an average of 42%. Why might it be misleading to treat this single average as representative of “crime” in general?",
          options: [
            "It isn't misleading — 42% is a perfectly accurate figure for all crime",
            "The average hides real variation — some crime types are reported far more, others far less, and a single number flattens that difference",
            "Averages are never useful in criminology",
            "The CSEW doesn't actually calculate averages",
          ],
          correct: 1,
          explain:
            "A single summary statistic can be technically accurate and still obscure the more important pattern underneath it — exactly the nuance CW2's data-interpretation criterion rewards.",
        },
      ],
    },
    {
      label: "Stage 2 — reading a chart over time",
      image: "/quiz-charts/chart-recording-rate-over-time.png",
      intro:
        "The gap between recorded and actual crime isn't fixed — it can shrink or grow as police recording practices change, separately from whether true crime has changed. Figure 2 shows this for violence offences.",
      questions: [
        {
          q: "According to Figure 2, how did the police recording rate for violence offences change between 2014 and 2021?",
          options: ["It fell from 90% to 67%", "It stayed roughly the same", "It rose from 67% to 90%", "The chart doesn't show a time comparison"],
          correct: 2,
          explain: "A direct read — recording rates improved substantially over this period.",
        },
        {
          q: "Recorded violence offences rose substantially between 2014 and 2021. What would a careful analyst say about that rise?",
          options: [
            "It proves violent crime in England and Wales nearly doubled in that period",
            "Some — potentially a large share — of the apparent rise reflects police recording more of the violence that was already happening, not necessarily more violence occurring",
            "It proves the CSEW is unreliable and should be ignored",
            "It has no connection to recording practices at all — the rise is entirely real",
          ],
          correct: 1,
          explain:
            "The single hardest and most important reasoning skill here: a rise in recorded crime is not automatically the same claim as a rise in actual crime, without swinging just as far wrong by claiming the whole rise is fake.",
        },
        {
          q: "Someone claims: “This chart proves the CSEW itself is an unreliable measure of crime, since the police figures kept changing under it.” What's the flaw in that claim?",
          options: [
            "There's no flaw — the claim is correct",
            "The chart shows the police recording rate changing, not the CSEW's own methodology — the CSEW is specifically designed to be unaffected by police recording practices, which is exactly why it can be used to measure the recording rate in the first place",
            "The CSEW only started in 2014, so the comparison is meaningless",
            "Recording rates and survey reliability are the same thing",
          ],
          correct: 1,
          explain:
            "A plausible-sounding but backwards misreading — the CSEW being stable is precisely what makes it useful for catching police recording changes, not evidence that it's the unreliable one.",
        },
      ],
    },
    {
      label: "Stage 3 — bringing it home to Hollenbourne",
      image: "/quiz-charts/chart-hollenbourne-crime-trend.png",
      intro:
        "Figures 1 and 2 use real national statistics. Figure 3 is different — illustrative data built for this module, consistent with the Hollenbourne case-study material. It is not real crime data; treat it like Figures 1 and 2 for practising the skill, but don't cite it as an actual statistic.",
      questions: [
        {
          q: "According to Figure 3, in which year is the gap between the two lines at its narrowest?",
          options: ["2018", "2020", "2022", "2025"],
          correct: 3,
          explain: "A direct read — by 2025 the two lines sit closer together than at any other point, even though estimated crime is still clearly above recorded crime.",
        },
        {
          q: "Both lines dip sharply in 2020. What's the most likely explanation?",
          options: [
            "Crime genuinely became far less common everywhere that year for no particular reason",
            "2020 covers the Covid-19 lockdown period, when reduced day-to-day movement and opportunity plausibly reduced many routine crime types",
            "The police stopped recording crime altogether that year",
            "This is a data error and should be ignored",
          ],
          correct: 1,
          explain: "This matches a real, well-documented pattern seen nationally during the pandemic — the illustrative data is deliberately built to mirror a genuine effect.",
        },
        {
          q: "Between 2022 and 2025, the recorded-crime line stays roughly flat while the estimated-crime line falls. Using the same reasoning as Figure 2, what's a plausible explanation that does not assume actual crime is rising?",
          options: [
            "There is no possible explanation other than crime getting worse",
            "Recording practices may have continued improving even as true crime fell, meaning police are now capturing a larger share of a shrinking total — two genuine changes happening at once, partly offsetting each other in the recorded figures",
            "The chart must be wrong, since both lines should always move together",
            "Recorded crime and estimated crime measure exactly the same thing, so this pattern is impossible",
          ],
          correct: 1,
          explain: "The same reasoning skill as Q5 (Figure 2), now applied to a new chart — deliberately repeated so students transfer the skill rather than just recall the answer.",
        },
        {
          q: "The case-study material elsewhere in this module notes that 2025 “breaks the improving narrative” for one high-profile type of crime, even though Figure 3 shows overall estimated crime continuing to fall that year. What does this illustrate about the relationship between data and public perception?",
          options: [
            "The case-study material must be factually wrong, since the chart shows improvement",
            "A single serious, high-profile case can dominate how safe a place feels or is reported to be, even while the broader statistical picture is genuinely improving — the two things can both be true at once",
            "Aggregate crime data is always more trustworthy than any individual case",
            "Individual cases should never be discussed if aggregate data shows improvement",
          ],
          correct: 1,
          explain:
            "The hardest question in the set, deliberately placed last — it connects to Week 8's material on crime representation, resisting the two easy wrong answers (dismiss the data, or dismiss the case) in favour of holding both as genuinely true at once.",
        },
      ],
    },
  ],
};

export const ARGUMENT_REGENERATION_QUIZ: MultiselectQuizDef = {
  id: "argument-regeneration",
  kind: "multiselect",
  week: 6,
  title: "Diagnose the Argument: Council Regeneration Funding",
  intro:
    "Should Hollenbourne council continue investing in Featherton's development, or redirect funds toward regenerating Critchley and Boresfield? Presented as something a (fictional) councillor has written in a local consultation document, arguing for continued Featherton investment:",
  passage:
    "“Featherton is clearly working. Property values are up, new families are moving into the estate every month, and the Piazza is thriving with new shops opening all the time. Local government should back what's succeeding, not what's failing. Critchley and Boresfield have had years of council attention and investment, and nothing has changed there — the same problems, the same decline. If money hasn't fixed those estates by now, more of it won't either. We should keep investing where investment is clearly paying off, not throw good money after bad.”",
  prompt: "Which of these are genuine flaws in the argument above? Select all that apply.",
  options: [
    { id: "r1", correct: true, label: "It measures “success” only by property values and new arrivals, without asking who benefits or who might be priced out or left behind" },
    { id: "r2", correct: true, label: "“Nothing has changed” is treated as proof that investment doesn't work, without checking how much was actually spent, for how long, or how it compares to what Featherton received" },
    { id: "r3", correct: true, label: "“Throw good money after bad” carries strong emotional weight but provides no actual evidence for the claim it's attached to" },
    { id: "r4", correct: false, label: "The argument doesn't include exact pound figures" },
    { id: "r5", correct: false, label: "The argument was written by a councillor rather than an independent expert" },
  ],
};

export const ARGUMENT_POLICING_QUIZ: MultiselectQuizDef = {
  id: "argument-policing",
  kind: "multiselect",
  week: 6,
  title: "Diagnose the Argument: Force Structure",
  intro:
    "Should Hollenbourne keep a dedicated local police presence, or be folded into a wider regional Essex force? Presented as an extract from a (fictional) regional policing efficiency review, arguing for merging Hollenbourne into a larger regional force:",
  passage:
    "“Crime is crime, wherever it happens. A merged regional force gives officers access to better resources, better technology, and colleagues who've handled a wider range of cases. Small local forces are simply inefficient — duplicating specialist capabilities like forensics or armed response across dozens of small local units wastes taxpayer money that could be spent on frontline policing instead. One larger force means one set of overheads, not fifty. The case for merging is really a case for basic efficiency.”",
  prompt: "Which of these are genuine flaws in the argument above? Select all that apply.",
  options: [
    { id: "p1", correct: true, label: "“Crime is crime, wherever it happens” quietly dismisses the value of local knowledge and community relationships without addressing the point at all" },
    { id: "p2", correct: true, label: "Treats efficiency as an automatic, unqualified good, without acknowledging anything that might be lost in the process" },
    { id: "p3", correct: true, label: "Omits response times, community trust, and local accountability entirely, discussing only cost — a one-sided selection of evidence" },
    { id: "p4", correct: false, label: "The argument mentions saving taxpayer money" },
    { id: "p5", correct: false, label: "The argument comes from a “regional policing efficiency review”" },
  ],
};

export const CPS_QUIZ: McqQuizDef = {
  id: "cps",
  kind: "mcq",
  week: 7,
  title: "CPS Quiz",
  intro:
    "The Full Code Test's evidential stage is the real-world version of the “strong case vs. thin case” distinction the endgame already runs on. Facts checked against the CPS's own Code for Crown Prosecutors.",
  bonusThresholds: [
    [0, 0],
    [2, 1],
    [3, 2],
    [5, 3],
  ],
  stages: [
    {
      questions: [
        {
          q: "What are the two stages of the CPS's “Full Code Test,” used to decide whether to charge a suspect?",
          options: [
            "The arrest stage and the trial stage",
            "The evidential stage and the public interest stage",
            "The reasonable suspicion stage and the beyond reasonable doubt stage",
            "The police stage and the court stage",
          ],
          correct: 1,
          explain:
            "Every charging decision — whether made by the CPS or, for many offences, by the police directly — is meant to apply both stages in order: evidential first, then public interest.",
        },
        {
          q: "What does “a realistic prospect of conviction” actually mean, in the CPS's own definition?",
          options: [
            "The same as the standard a jury applies — being sure of guilt",
            "A more likely than not standard: an objective, properly-directed jury or magistrates' court would be more likely than not to convict",
            "Any evidence that could plausibly support a conviction, however unlikely",
            "Certainty that the suspect is guilty",
          ],
          correct: 1,
          explain:
            "A genuinely important distinction, and a common mix-up: the CPS's own charging threshold is lower than the standard a criminal court applies at trial. A prosecutor doesn't need to be sure of guilt to charge — only that conviction is more likely than not. The court itself still has to be sure beyond reasonable doubt to actually convict.",
        },
        {
          q: "If a case does not pass the evidential stage, what happens?",
          options: [
            "It can still proceed if the offence is serious enough",
            "It must not proceed, regardless of how serious or high-profile the case is",
            "It automatically moves to the Threshold Test instead",
            "The police can override the decision and charge anyway",
          ],
          correct: 1,
          explain:
            "The Code is explicit and absolute on this point — evidential insufficiency ends the case there, with no seriousness-based exception. A genuinely shocking crime with weak evidence still doesn't get charged.",
        },
        {
          q: "Once the evidential stage is passed, what's the default position at the public interest stage?",
          options: [
            "Prosecution will usually go ahead unless public interest factors against it clearly outweigh those in favour",
            "Prosecution only goes ahead if the victim specifically requests it",
            "The public interest stage exists mainly to stop prosecutions in low-level cases",
            "Public interest is considered before the evidential stage, not after",
          ],
          correct: 0,
          explain:
            "Passing the evidential stage is necessary but not sufficient — but the default, once it's passed, leans toward prosecuting. Public interest factors (offence seriousness, culpability, harm to the victim, and others) have to clearly outweigh that default to stop a case that already has enough evidence behind it.",
        },
        {
          q: "What is the Threshold Test, and when is it used?",
          options: [
            "It's used in every case, as an easier alternative to the Full Code Test",
            "It's a rare exception, used only when a suspect poses a substantial bail risk and not all evidence is available yet — allowing a charge on reasonable suspicion, with the expectation the Full Code Test will be met later as more evidence comes in",
            "It's the test applied by the court, not by police or the CPS",
            "It replaced the Full Code Test in recent years",
          ],
          correct: 1,
          explain:
            "A real but narrow exception — it exists specifically to avoid releasing a genuinely dangerous suspect back onto bail before an investigation is complete, not as a general shortcut around the evidential stage.",
        },
      ],
    },
  ],
};

export const PRISONS_QUIZ: McqQuizDef = {
  id: "prisons",
  kind: "mcq",
  week: 8,
  title: "Reoffending and Sentencing Quiz",
  intro:
    "Three parts, three different skills: resisting a tempting but wrong causal conclusion (a real selection-effects trap), reading a chart's construction rather than just its data, and referencing practice — including correctly refusing to cite a source that was never real.",
  bonusThresholds: [
    [0, 0],
    [4, 1],
    [7, 2],
    [9, 3],
  ],
  stages: [
    {
      label: "Part 1 — reoffending by sentence type",
      image: "/quiz-charts/chart-reoffending-by-sentence.png",
      questions: [
        {
          q: "According to Figure 1, what is the one-year proven reoffending rate for those given a court order (community or suspended sentence)?",
          options: ["62%", "34%", "47%", "4%"],
          correct: 1,
          explain: "A direct read from the chart.",
        },
        {
          q: "Based only on Figure 1, which of these is the most defensible conclusion?",
          options: [
            "Court orders cause a lower reoffending rate than short custodial sentences",
            "People given court orders reoffend less often than people given short custodial sentences, but the chart alone doesn't tell us why",
            "Short custodial sentences have no effect on reoffending at all",
            "The two groups are not really comparable, so this chart is worthless",
          ],
          correct: 1,
          explain:
            "The honest reading — the chart shows a real, large gap in outcomes, but a bar chart comparing two group averages can't by itself tell you why that gap exists. Both the causal claim and the “worthless” dismissal go too far in opposite directions.",
        },
        {
          q: "Given this, what's the most accurate way to describe what Figure 1 actually demonstrates?",
          context:
            "Courts don't hand out community orders and short custodial sentences at random. People sentenced to custody are, on average, more likely to have prior convictions, active drug or alcohol problems, or unemployment — the same factors independently linked to reoffending regardless of sentence type. The Ministry of Justice has run its own analysis on exactly this question: using a matched comparison group (people with similar offending history, drug use, and employment status, split across sentence types), the actual difference in reoffending attributable to sentence type was around 4 percentage points — not the 28-point gap Figure 1 shows.",
          options: [
            "Figure 1 is wrong and should be ignored",
            "Figure 1 shows a real difference in outcomes, but most of that gap likely reflects who ends up with each sentence type, not the sentence itself — the matched analysis suggests the sentence's own effect is much smaller (~4 points), though still real and in the same direction",
            "The matched analysis proves sentence type makes no difference at all",
            "Since experts disagree, no conclusion can be drawn either way",
          ],
          correct: 1,
          explain:
            "Neither dismissing the raw chart as meaningless nor taking it at face value is correct. The matched analysis doesn't erase the raw finding — it explains how much of it is real sentence effect versus pre-existing group differences, and there's still a genuine, if much smaller, effect in the same direction.",
        },
      ],
    },
    {
      label: "Part 2 — reading a chart's construction",
      image: "/quiz-charts/chart-dual-axis-illustrative.png",
      intro:
        "Figure 2 is a constructed illustration, not a real combined MOJ/ONS publication — built specifically to demonstrate a common chart-construction issue: two different variables, each on its own independently-scaled axis, shown on the same chart.",
      questions: [
        {
          q: "Look carefully at the two axis scales in Figure 2, not just the line shapes. What do you notice?",
          options: [
            "Both axes use the same scale, so the comparison is fair",
            "The crime estimate axis covers a much narrower proportional range relative to how much the actual value changes (nearly halving) than the prison population axis does (changing by under 10%) — yet both lines are drawn to look similarly steep",
            "The chart proves prison population and crime are unrelated",
            "Nothing unusual — this is a standard, safe way to compare two variables",
          ],
          correct: 1,
          explain:
            "Crime (right axis) falls from 9.5 to 4.6 million — roughly halved — while prison population (left axis) only falls from 85,000 to 79,000 — under 10%. Because each axis is scaled to fill the same vertical space, both lines look like they're declining at a similar rate. Reading the line shapes alone, without checking what each axis represents, would badly mislead you about the true scale of change in each variable.",
        },
        {
          q: "What's the safest general approach when you encounter a chart with two independently-scaled y-axes?",
          options: [
            "Trust the visual impression — if two lines look similar, they probably are",
            "Ignore the chart entirely — dual-axis charts are always wrong",
            "Check both axis labels and ranges specifically before drawing any conclusion about how the two variables relate, since axis scaling is a choice that can create a misleading visual impression even with genuine data",
            "Only look at the left axis, since it's usually the more important one",
          ],
          correct: 2,
          explain:
            "Dual-axis charts aren't inherently dishonest — sometimes they're a genuinely useful way to show two related time series together — but the axis scaling is always a choice, and a different choice could tell a visually different story from the same real numbers. The habit worth building is checking the axes before trusting the shape.",
        },
      ],
    },
    {
      label: "Part 3 — referencing these sources",
      questions: [
        {
          q: "Which of these is a genuine, immediate observation about Source 3 that a chart couldn't show as directly?",
          context:
            "Source 3 — a government bulletin, presented as text: “In the 12 months to December 2025, there were 394 deaths in prison custody in England and Wales, an increase of 15% on the previous 12-month period. Of these, 79 were self-inflicted, a decrease of 12% on the previous year's total. Over the same period, the self-harm rate stood at 859 incidents per 1,000 prisoners, a fall of 3.6% year-on-year, while the assault rate rose by 6% to 364 assaults per 1,000 prisoners.” (Adapted from: Ministry of Justice/HM Prison and Probation Service, Safety in Custody Statistics, England and Wales: Deaths in Prison Custody to December 2025, Self-harm and Assaults to September 2025, published 29 January 2026.)",
          options: [
            "It contains four different statistics in a single paragraph, each with its own comparison point and direction of change, without needing four separate visual elements",
            "It proves prisons are becoming less safe overall",
            "It's less trustworthy than a chart because it doesn't have an image",
            "It can't contain real government statistics, since it's written as prose",
          ],
          correct: 0,
          explain:
            "Text and charts aren't ranked by trustworthiness, they're just different formats suited to different amounts and kinds of information — a genuinely mixed picture (some measures up, some down) is often easier to hold precisely in a short paragraph than in a single chart trying to show four trends at once.",
        },
        {
          q: "Which of the following is the correctly formatted Harvard reference for Source 3?",
          options: [
            "Gov.uk (2026) Prison Safety Report. Available online.",
            "Ministry of Justice and HM Prison and Probation Service (2026) Safety in Custody Statistics, England and Wales: Deaths in Prison Custody to December 2025, Self-harm and Assaults to September 2025. Available at: [URL] (Accessed: [date]).",
            "HMPPS Safety in Custody Statistics, seen online, 2026.",
            "Ministry of Justice (no date) Safety in Custody.",
          ],
          correct: 1,
          explain:
            "“Gov.uk” is the website, not the publishing body, and “Available online” isn't a usable locator. The third option is missing almost every required element. The fourth drops the actual publication date and the full title. The correct answer has all five things a Harvard web reference needs: correct organisational author, year, full italicised title, “Available at” with a real URL, and an access date.",
        },
        {
          q: "Figure 2 (the prison population/crime dual-axis chart from Part 2) is explicitly labelled as illustrative, not a genuine combined publication. If you were writing an assignment and wanted to reference where Figure 2 came from, what should you do?",
          options: [
            "Reference it the same way as Figure 1 and Source 3, since it's a chart with real-looking numbers on it",
            "Don't cite it as an external source at all — since it isn't one, the honest thing is to label it as your own illustrative construction (or your tutor's, if given to you that way), not attribute it to a body that never published it",
            "Attribute it to the Ministry of Justice, since the chart is about prisons",
            "Leave the source unclear, since it doesn't really matter for a chart",
          ],
          correct: 1,
          explain:
            "Citation mechanics are useless if applied to the wrong judgement. Getting the Harvard format perfect for a source that was never real is worse than getting a real source's format slightly wrong — the first mistake is invisible to the exact skill this quiz is teaching, and the second is exactly what practice is for.",
        },
      ],
    },
  ],
};

// Week 3's referencing quiz. Stage 1 (below) is these 4 MCQ questions,
// scored the same generic way as every other mcq quiz. Stage 2 (the 3
// free-text "write your own" tasks) is deliberately NOT here — it's
// unscored by design (per its own source doc) and lives instead as a
// separate, ungraded, AI-feedback practice widget: see
// lib/reference-tasks.ts and app/dashboard/quiz/ReferencingPractice.tsx.
export const WEEK3_REFERENCING_QUIZ: McqQuizDef = {
  id: "week3-referencing",
  kind: "mcq",
  week: 3,
  title: "Referencing Quiz",
  intro:
    "The foundational skill everything else in the module assumes — a Harvard reference needs five things: author, year, title, publication details, and (for anything online) access details. Multiple choice, one correct answer each.",
  bonusThresholds: [
    [0, 0],
    [2, 1],
    [3, 2],
    [4, 3],
  ],
  stages: [
    {
      questions: [
        {
          q: "The source: an article by Robinson, K., Ahmed, S. and Clarke, T., published in 2019 in the International Journal of Offender Therapy and Comparative Criminology, volume 63, issue 4, pages 512–530. Which is the correctly formatted Harvard reference?",
          options: [
            "Robinson, K. (2019) International Journal of Offender Therapy and Comparative Criminology, 63(4), pp.512–530.",
            "Robinson, K., Ahmed, S. and Clarke, T. (2019) Article title here. International Journal of Offender Therapy and Comparative Criminology, 63(4), pp.512–530.",
            "Robinson et al., 2019, Journal of Offender Therapy.",
            "K. Robinson, S. Ahmed and T. Clarke wrote an article in 2019 about offender therapy.",
          ],
          correct: 1,
          explain:
            "All three authors (not just the first, in the reference list — \"et al.\" is for in-text citations only), the year, the article title (not italicised — the journal name is italicised instead, since the journal is the standalone work here), volume and issue in brackets, and the page range. Option A drops two authors and the article title. Option C is an in-text citation style, not a reference list entry, and abbreviates the journal name incorrectly. Option D isn't a reference at all.",
        },
        {
          q: "The source: a book by Newburn, T., titled \"Criminology,\" 3rd edition, published in 2017 by Routledge, in Abingdon. Which is the correctly formatted Harvard reference?",
          options: [
            "Newburn, T. (2017) Criminology. 3rd edn. Abingdon: Routledge.",
            "T. Newburn, Criminology, Routledge, 2017.",
            "Newburn (2017) Criminology.",
            "Newburn, T. (2017) \"Criminology.\" Routledge.",
          ],
          correct: 0,
          explain:
            "Author, year, italicised title, edition (when not the first), place of publication, publisher. Option B has the elements in the wrong order and format entirely. Option C drops the edition, place, and publisher. Option D wrongly puts the title in quotation marks instead of italics — that convention is for article or chapter titles, not standalone books.",
        },
        {
          q: "The source: \"The Code for Crown Prosecutors,\" published by the Crown Prosecution Service, most recently reviewed in 2024, found at a government web address. Which is the correctly formatted Harvard reference?",
          options: [
            "CPS (2024) Code for Crown Prosecutors. Available online.",
            "Crown Prosecution Service (2024) The Code for Crown Prosecutors. Available at: [URL] (Accessed: [date]).",
            "The Code for Crown Prosecutors, CPS website, seen 2024.",
            "Crown Prosecution Service, no date, Code for Crown Prosecutors.",
          ],
          correct: 1,
          explain:
            "Full organisational name (not the acronym), year, full and accurate title, and the \"Available at\" / \"Accessed\" structure every online source needs — a reader needs both the URL and the date you accessed it, since government web content can change or move.",
        },
        {
          q: "The source: an internal police memorandum, written by DS H. Ferris, dated 2 June 2025, addressed to the Divisional Commander and the Hollenbourne Case Review Panel. It doesn't fit neatly into \"book,\" \"article,\" or \"report\" — it's an internal document you've been given access to as part of the case materials, not something publicly published. Which approach is most defensible?",
          options: [
            "Don't reference it at all, since it was never formally published anywhere",
            "Treat it as a personal communication / internal document: author, year, a description of what it is, and where you accessed it (e.g. the case materials for this module) — being honest about what kind of source it actually is, rather than forcing it into a format built for something else",
            "Reference it exactly like a journal article, since it has an author and a date",
            "Reference it as if it were a CPS publication, since it's about a legal case",
          ],
          correct: 1,
          explain:
            "This is the actual skill this question is testing: recognising when a source doesn't fit a standard category, and adapting the referencing principles (who, when, what, where you got it) honestly rather than forcing it into the wrong template. A source doesn't need a perfect category to be properly referenced — it needs its origin stated clearly enough that a reader understands exactly what it is and isn't.",
        },
      ],
    },
  ],
};

export const QUIZ_DEFS: QuizDef[] = [
  WEEK3_REFERENCING_QUIZ,
  PACE_QUIZ,
  DARK_FIGURE_QUIZ,
  ARGUMENT_REGENERATION_QUIZ,
  ARGUMENT_POLICING_QUIZ,
  CPS_QUIZ,
  PRISONS_QUIZ,
];

export function getQuizDef(id: string): QuizDef | undefined {
  return QUIZ_DEFS.find((q) => q.id === id);
}

/** Every week with a live, quiz-derived trust bonus — Week 2 plus every QUIZ_DEFS week, deduped and sorted. */
export const ALL_QUIZ_WEEKS: number[] = Array.from(new Set([QUIZ_WEEK, ...QUIZ_DEFS.map((q) => q.week)])).sort((a, b) => a - b);

function bonusFromThresholds(thresholds: [number, number][], correct: number): number {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (correct >= thresholds[i][0]) return thresholds[i][1];
  }
  return 0;
}

export function scoreMcqQuiz(quiz: McqQuizDef, answers: number[][]): { correct: number; total: number; bonus: number } {
  let correct = 0;
  let total = 0;
  quiz.stages.forEach((stage, si) => {
    stage.questions.forEach((q, qi) => {
      total++;
      if (answers[si]?.[qi] === q.correct) correct++;
    });
  });
  return { correct, total, bonus: bonusFromThresholds(quiz.bonusThresholds, correct) };
}

/**
 * Net-correct scoring: a pick that's actually a flaw scores +1, a pick
 * that isn't costs -1, floored at 0 and capped at the number of genuine
 * flaws — so guessing every option nets nothing, matching the source
 * design (Reference/case-content/mechanics/hollenbourne-action-economy.md's
 * sibling unlock-tree doc). The result sits directly on the 0-3 trust-bonus
 * scale since both quizzes have exactly 3 genuine flaws.
 */
export function scoreMultiselectQuiz(quiz: MultiselectQuizDef, selected: string[]): { points: number; max: number } {
  const selectedSet = new Set(selected);
  const correctCount = quiz.options.filter((o) => o.correct).length;
  let netCorrect = 0;
  let wrongPicked = 0;
  for (const o of quiz.options) {
    const picked = selectedSet.has(o.id);
    if (picked && o.correct) netCorrect++;
    if (picked && !o.correct) wrongPicked++;
  }
  const points = Math.max(0, Math.min(correctCount, netCorrect - wrongPicked));
  return { points, max: correctCount };
}
