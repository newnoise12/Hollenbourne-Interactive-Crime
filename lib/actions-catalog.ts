// Static case content for the investigation action economy — ported from
// reference/action-economy.jsx. Not stored in the database; team progress
// against this catalog lives in weekActionState + actionLog (db/schema.ts).

export type ActionCategory = "interview" | "forensic" | "documentary" | "visual" | "witness";

export type ActionItem = {
  id: string;
  category: ActionCategory;
  label: string;
  description: string;
  cost: number;
  outcome: string;
};

export const CATEGORY_META: Record<ActionCategory, { label: string; color: string }> = {
  interview: { label: "Interview", color: "#712B13" },
  forensic: { label: "Forensic", color: "#8B3226" },
  documentary: { label: "Documentary", color: "#644421" },
  visual: { label: "Visual", color: "#085041" },
  witness: { label: "Witness", color: "#3C3489" },
};

export const BASELINE_ACTIONS = 2;
export const MAX_TRUST_BONUS = 3;
export const MAX_WEEK = 11;

export const ACTIONS: ActionItem[] = [
  {
    id: "reint-wooley",
    category: "interview",
    label: "Re-interview Nigel Wooley",
    description: "Already flagged in the original investigation. Press on his account of the evening.",
    cost: 1,
    outcome: "He repeats his account of being home. Phone data still places him there — but he doesn't mention the dog, or the car park.",
  },
  {
    id: "reint-swayne",
    category: "interview",
    label: "Re-interview Colin Swayne",
    description: "Known to police already. Follow up on his movements around Porterhouse's death.",
    cost: 1,
    outcome: "Swayne grows agitated when asked about county lines, but offers nothing new about the night Porterhouse died.",
  },
  {
    id: "reint-haddad",
    category: "interview",
    label: "Re-interview Khalid Haddad",
    description: "Cleared of suspicion early on. Reopening this line goes against the existing file.",
    cost: 2,
    outcome: "Haddad mentions, almost in passing, a dark 4x4 idling near the woods some months back. Nobody asked him about it before.",
  },
  {
    id: "reint-burgess",
    category: "interview",
    label: "Re-interview Martin Burgess",
    description: "Never treated as a suspect. Pursuing him means working outside where the investigation has already looked.",
    cost: 2,
    outcome: "Burgess is polite, professional, and entirely unbothered. He confirms two boiler jobs near Boresfield that week — nothing more.",
  },
  {
    id: "forensic-dna",
    category: "forensic",
    label: "Retest DNA — Wooley scene",
    description: "Establish whether recovered DNA can be dated to the day of her death.",
    cost: 2,
    outcome: "The lab confirms the DNA is present but cannot date it — consistent with historic contact, not necessarily the day itself.",
  },
  {
    id: "forensic-vehicle",
    category: "forensic",
    label: "Run a vehicle check — dark 4x4",
    description: "Cross-reference DVLA records against sightings near the woodland car park.",
    cost: 2,
    outcome: "DVLA records return a vehicle registered to an elderly woman in Dartford — no obvious link to anyone on file.",
  },
  {
    id: "cctv-marsh",
    category: "visual",
    label: "Chase CCTV — Hollen Marsh car park",
    description: "Pull available footage from the period around Mason's death.",
    cost: 1,
    outcome: "Footage from the car park is partial. A dark 4x4 is visible arriving and leaving within the estimated window.",
  },
  {
    id: "phone-data",
    category: "documentary",
    label: "Pull phone data",
    description: "Request historic cell tower records for a named individual.",
    cost: 1,
    outcome: "Location data places the requested individual in the area — consistent with routine movement, not proof of anything.",
  },
  {
    id: "doc-memo",
    category: "documentary",
    label: "Pull the case-prioritisation memo",
    description: "Request the internal paperwork behind the original investigation's resourcing decisions.",
    cost: 2,
    outcome: "The memo shows Mason's case was deprioritised within a week, before any vehicle check was ever requested.",
  },
  {
    id: "canvas",
    category: "witness",
    label: "Witness canvas — Boresfield / Featherton",
    description: "Door-to-door follow-up for anyone who saw something unreported at the time.",
    cost: 1,
    outcome: "A resident recalls 'a big bloke in a puffer coat' near the tenements — vague, but consistent with earlier descriptions.",
  },
];

export function getActionItem(id: string): ActionItem | undefined {
  return ACTIONS.find((a) => a.id === id);
}
