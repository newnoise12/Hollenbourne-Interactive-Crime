// Display constants and types for the investigation actions — everything the
// BROWSER may import. It deliberately contains no case content (no outcomes,
// descriptions or prerequisites): those live in actions-catalog.ts, which only
// server code may import, so a team can't read an action it hasn't unlocked out of
// the JavaScript bundle. Server code can keep importing these names from
// actions-catalog.ts, which re-exports them.

export type ActionCategory = "interview" | "forensic" | "documentary" | "visual" | "witness";

// The four cases under review, plus "general" for material that belongs to no
// single victim. Lives here (not in evidence-catalog.ts) because an action is
// the one place its case is defined; the evidence catalog derives from it.
export type CaseName = "mason" | "wooley" | "porterhouse" | "butt" | "general";

// The six ways the evidence page groups its "By evidence type" view. Separate
// from evidence-catalog.ts's four-value EvidenceType (statistical / visual /
// interview / documentary), which still drives card colours and the corkboard.
export type EvidenceGroup = "interviews" | "forensics" | "cameras" | "phone" | "records" | "maps";

export const EVIDENCE_GROUP_META: Record<EvidenceGroup, { label: string }> = {
  interviews: { label: "Interviews & statements" },
  forensics: { label: "Forensics & searches" },
  cameras: { label: "Cameras & vehicles" },
  phone: { label: "Phone & location data" },
  records: { label: "Records & files" },
  maps: { label: "Maps & background" },
};

export const EVIDENCE_GROUP_ORDER: EvidenceGroup[] = ["interviews", "forensics", "cameras", "phone", "records", "maps"];

export const CATEGORY_META: Record<ActionCategory, { label: string; color: string }> = {
  interview: { label: "Interview", color: "#712B13" },
  forensic: { label: "Forensic", color: "#8B3226" },
  documentary: { label: "Documentary", color: "#644421" },
  visual: { label: "Visual", color: "#085041" },
  witness: { label: "Witness", color: "#3C3489" },
};

export const MAX_TRUST_BONUS = 3;
export const MAX_WEEK = 11;
