// Static case content for the evidence board — ported from reference/evidence-board.jsx,
// then deepened from the baseline material catalogued in
// Reference/case-content/mechanics/hollenbourne-evidence-overview.md's Category 1
// ("free from day one, Week 9" unless noted) and Category 2 (time-released).
// Not stored in the database; team progress against this catalog lives in
// the evidenceCitations table (db/schema.ts).

export type CiteType = "report" | "unpublished";
export type EvidenceType = "statistical" | "visual" | "interview" | "documentary";

export type EvidenceItem = {
  id: string;
  exhibit: string;
  type: EvidenceType;
  title: string;
  snippet: string;
  locked: boolean;
  unlocksWeek?: number;
  assisted?: boolean;
  citeType?: CiteType;
  meta?: {
    author: string;
    year: number;
    title: string;
    place?: string;
    publisher?: string;
  };
  hint?: string;
};

export const TYPE_META: Record<EvidenceType, { label: string; color: string }> = {
  statistical: { label: "Statistical", color: "#3C3489" },
  visual: { label: "Visual", color: "#085041" },
  interview: { label: "Interview", color: "#712B13" },
  documentary: { label: "Documentary", color: "#644421" },
};

export const EVIDENCE: EvidenceItem[] = [
  {
    id: "ex01",
    exhibit: "EX.01",
    type: "statistical",
    title: "Boresfield incident stats, 2015–2025",
    snippet: "Recorded violent incidents by year, with a dip across 2020–21.",
    locked: false,
    assisted: true,
    citeType: "report",
    meta: { author: "Hollenbourne Police", year: 2024, title: "Annual crime report", place: "Hollenbourne", publisher: "Hollenbourne Police" },
  },
  {
    id: "ex02",
    exhibit: "EX.02",
    type: "visual",
    title: "CCTV still — woodland car park",
    snippet: "Dark 4x4 parked near the tree line around the time of Mason's death.",
    locked: false,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police", year: 2019, title: "CCTV log: woodland car park, 8 October 2019" },
  },
  {
    id: "ex03",
    exhibit: "EX.03",
    type: "interview",
    title: "Neighbour account, Wooley case",
    snippet: "Heavy-set man in a dark puffer jacket, seen entering and leaving the property.",
    locked: false,
    assisted: false,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police", year: 2022, title: "Interview transcript: neighbour statement, Wooley case" },
    hint: "This is unpublished material, like EX.02 — the same force logged it. Open the document to see its details.",
  },
  {
    id: "ex04",
    exhibit: "EX.04",
    type: "documentary",
    title: "Internal force memo",
    snippet: "Case prioritisation notes.",
    locked: true,
    unlocksWeek: 8,
  },
  {
    id: "ex05",
    exhibit: "EX.05",
    type: "documentary",
    title: "AI-drafted report vs. transcript",
    snippet: "Comparison worksheet.",
    locked: true,
    unlocksWeek: 5,
  },
  {
    id: "ex06",
    exhibit: "EX.06",
    type: "interview",
    title: "Court transcript excerpt",
    snippet: "Earlier, unrelated case.",
    locked: true,
    unlocksWeek: 9,
  },

  // -----------------------------------------------------------------
  // Baseline case-file material, all four cases — Reference/case-content's
  // evidence overview, Category 1. Free once its week arrives; nothing here
  // is gated behind a costed action, only behind time.
  // -----------------------------------------------------------------
  {
    id: "ex07",
    exhibit: "EX.07",
    type: "documentary",
    title: "Ferris's opening memo",
    snippet: "DS Ferris sets out, informally, why she thinks four deaths across six years deserve a joined-up look — mixing sound instinct with real error.",
    locked: true,
    unlocksWeek: 9,
    assisted: true,
    citeType: "unpublished",
    meta: {
      author: "H. Ferris",
      year: 2025,
      title: "Internal memorandum: possible connections between recent deaths — Mason, Wooley, Porterhouse, Butt",
    },
  },
  {
    id: "ex08",
    exhibit: "EX.08",
    type: "documentary",
    title: "Victim biography — Geoff Mason",
    snippet: "Widower, retired Critchley cement-plant worker, walked the marsh daily since his wife's death — the habit that put him there at all.",
    locked: true,
    unlocksWeek: 3,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police (Family Liaison)", year: 2025, title: "Victim biography: Geoff Mason" },
  },
  {
    id: "ex09",
    exhibit: "EX.09",
    type: "documentary",
    title: "Victim biography — Susan Wooley",
    snippet: "Teaching assistant, church and food-bank volunteer, moved to Hollenbourne alone after her first marriage ended — well-regarded by neighbours and former students alike.",
    locked: true,
    unlocksWeek: 3,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police (Family Liaison)", year: 2025, title: "Victim biography: Susan Wooley" },
  },
  {
    id: "ex10",
    exhibit: "EX.10",
    type: "documentary",
    title: "Victim biography — Carl Porterhouse",
    snippet: "Deliberately thin: known at the Robin Hood pub, a back injury ended his manual work, financially precarious in his final years.",
    locked: true,
    unlocksWeek: 3,
    assisted: false,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police (Family Liaison)", year: 2025, title: "Victim biography: Carl Porterhouse" },
    hint: "This is unpublished material, like EX.03 and EX.07 — the same force compiled it. Open the document to see its details.",
  },
  {
    id: "ex11",
    exhibit: "EX.11",
    type: "documentary",
    title: "Victim biography — Sara Butt",
    snippet: "British-Pakistani, lifelong Hollenbourne resident, dental student working part-time to help support her parents — the only one of the four who never lived anywhere else.",
    locked: true,
    unlocksWeek: 3,
    assisted: false,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police (Family Liaison)", year: 2025, title: "Victim biography: Sara Butt" },
    hint: "This is unpublished material, like EX.03 and EX.07 — the same force compiled it. Open the document to see its details.",
  },
  {
    id: "ex12",
    exhibit: "EX.12",
    type: "documentary",
    title: "Sara Butt — missing person report",
    snippet: "Filed high-risk from the outset: her last message home was \"back in 10.\" She never arrived.",
    locked: true,
    unlocksWeek: 9,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "R. Ahmed", year: 2025, title: "Missing person report and risk assessment: Sara Butt" },
  },
  {
    id: "ex13",
    exhibit: "EX.13",
    type: "visual",
    title: "Hollenbourne town map",
    snippet: "The marsh, the estates, and the routes between them, laid out end to end.",
    locked: false,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Case Review Panel", year: 2025, title: "Hollenbourne town map" },
  },
  {
    id: "ex14",
    exhibit: "EX.14",
    type: "visual",
    title: "Boresfield street map",
    snippet: "Every named house on the estate marked against the streets that connect them.",
    locked: false,
    assisted: false,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Case Review Panel", year: 2025, title: "Boresfield street map" },
    hint: "This is unpublished material, like EX.13 — the same panel produced it. Open the document to see its details.",
  },
  {
    id: "ex15",
    exhibit: "EX.15",
    type: "statistical",
    title: "Hollenbourne homicide rate, 2018–2025",
    snippet: "Twenty-four murders in eight years, unevenly spread — none of the four ever the standout case in its own year.",
    locked: false,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police", year: 2025, title: "Homicide rate summary, 2018–2025" },
  },
  {
    id: "ex16",
    exhibit: "EX.16",
    type: "documentary",
    title: "Policy file & canvass summary — Geoff Mason",
    snippet: "Fast-tracked for three weeks, then scaled back to a core team once no clear line of enquiry emerged — a traffic-camera canvass of the approach roads was never authorised at all.",
    locked: true,
    unlocksWeek: 9,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "A. Prentice", year: 2019, title: "SIO policy file: Geoff Mason" },
  },
  {
    id: "ex17",
    exhibit: "EX.17",
    type: "documentary",
    title: "Policy file & canvass summary — Susan Wooley",
    snippet: "Investigative resource prioritised toward Nigel Wooley from the first evening; a tradesperson's attendance on a neighbouring street that afternoon is logged only as unused disclosure material.",
    locked: true,
    unlocksWeek: 9,
    assisted: false,
    citeType: "unpublished",
    meta: { author: "S. Whitmore", year: 2022, title: "SIO policy file: Susan Wooley" },
    hint: "This is unpublished material, like EX.16 — the same force logged it. Open the document to see its details.",
  },
  {
    id: "ex18",
    exhibit: "EX.18",
    type: "documentary",
    title: "Policy file & canvass summary — Carl Porterhouse",
    snippet: "County lines set as the investigative frame within two hours; Swayne and Haddad both arrested, both released for insufficient evidence three weeks later.",
    locked: true,
    unlocksWeek: 9,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "M. Doyle", year: 2023, title: "SIO policy file: Carl Porterhouse" },
  },
  {
    id: "ex19",
    exhibit: "EX.19",
    type: "documentary",
    title: "Policy file & canvass summary — Sara Butt",
    snippet: "The only one of the four kept at full Major Incident resourcing rather than scaled back — but the canvass scope was deliberately limited to the immediate route home, excluding the wider approach routes into the area.",
    locked: true,
    unlocksWeek: 9,
    assisted: false,
    citeType: "unpublished",
    meta: { author: "R. Callahan", year: 2025, title: "SIO policy file: Sara Butt" },
    hint: "This is unpublished material, like EX.16 — the same force logged it. Open the document to see its details.",
  },
];

export function getEvidenceItem(id: string): EvidenceItem | undefined {
  return EVIDENCE.find((e) => e.id === id);
}
