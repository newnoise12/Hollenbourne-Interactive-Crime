// Static case content for the evidence board — ported from reference/evidence-board.jsx.
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
    meta: { author: "Kent Police", year: 2024, title: "Annual crime report", place: "Maidstone", publisher: "Kent Police" },
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
];

export function getEvidenceItem(id: string): EvidenceItem | undefined {
  return EVIDENCE.find((e) => e.id === id);
}
