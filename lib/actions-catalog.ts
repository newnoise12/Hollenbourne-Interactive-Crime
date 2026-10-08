// Static case content for the investigation action economy — ported from
// reference/action-economy.jsx, then deepened per the full spec in
// Reference/case-content/mechanics/hollenbourne-action-economy.md. Not
// stored in the database; team progress against this catalog lives in
// weekActionState + actionLog (db/schema.ts).
//
// SERVER-ONLY: never import this from a client component — it holds every action's
// result text. Browser code reads the per-team view built in lib/team-view.ts.

import type { ActionCategory, CaseName, EvidenceGroup } from "./actions-meta";

// Types and display constants live in actions-meta.ts (browser-safe); re-exported
// here so server code can keep importing everything from one place.
export type { ActionCategory, CaseName, EvidenceGroup } from "./actions-meta";
export { CATEGORY_META, EVIDENCE_GROUP_META, EVIDENCE_GROUP_ORDER, MAX_TRUST_BONUS, MAX_WEEK } from "./actions-meta";

// Which narrative chain an action belongs to, for the Investigation tab's
// grouping — recovered from the standalone artifact prototype (see
// CLAUDE.md's "Repo location"), which grouped its "Unlock Tree" this way
// with an explanatory note per group, rather than listing all ~45 actions
// flat. That framing (what's unlocked, and why a given chain costs what it
// does) is what a prior session's flat list was missing.
export type ActionThread =
  | "general"
  | "mason"
  | "toolmark"
  | "butt"
  | "endgame"
  | "haddad"
  | "records"
  | "anpr";

export type ActionItem = {
  id: string;
  category: ActionCategory;
  thread: ActionThread;
  // Which case this action belongs to, and which evidence-type group it files
  // under on the evidence page — both views and the Case Log derive from here.
  case: CaseName;
  group: EvidenceGroup;
  // A second (or third) case the action also bears on, shown as a small
  // "also relates to" tag. The action still appears once, under `case`.
  alsoRelatesTo?: CaseName[];
  label: string;
  // Short human-readable form used only in "requires: X" hints when this
  // action is referenced as another action's prerequisite. Falls back to
  // the full label if not set — only worth setting when label is long.
  shortLabel?: string;
  description: string;
  cost: number;
  outcome: string;
  // If set, every one of these other actions must already have a completed
  // actionLog entry for this team — any week, not just the current one (see
  // lib/actions.ts's takeAction). A generic, reusable mechanic: not tied to
  // any one chain of actions. All entries are required (AND, not OR).
  prerequisiteActionIds?: string[];
  // If set, this action can't be taken in a week earlier than this one —
  // e.g. the forensic pathology reports are withheld until Week 9 regardless
  // of points spent, and Sara Butt's follow-up report specifically until
  // Week 10, to preserve the "wait, that changes things" moment against
  // Ferris's memo. Independent of prerequisiteActionIds; both are checked.
  availableFromWeek?: number;
};

// Order here is the display order on the Investigation tab: open enquiries
// first, then the two chains that build toward naming a suspect, then the
// records work that only makes sense once someone's already a person of
// interest, ending on the endgame.
export const THREAD_META: Record<ActionThread, { label: string; note: string }> = {
  general: {
    label: "General enquiries",
    note: "Open from week one — routine institutional friction, no real investigative gating.",
  },
  mason: {
    label: "The Mason movements chain",
    note: "Two steps, triangulating a vehicle sighting against a registration check.",
  },
  toolmark: {
    label: "The tool-mark chain",
    note: "The most expensive single action available from week one — and the one that can actually name a suspect.",
  },
  butt: {
    label: "The Butt movements chain",
    note: "Three fragmented sightings — bus, high street, doorbell — building one route home on foot.",
  },
  haddad: {
    label: "Haddad / Wooley cross-reference",
    note: "Only reachable once Haddad is already known to the case through Porterhouse.",
  },
  records: {
    label: "Cell site & historical records",
    note: "Confirming rather than discovering — most of this is only worth requesting once someone's already a named suspect or person of interest.",
  },
  anpr: {
    label: "ANPR sweeps",
    note: "Wide, unfiltered searches across every vehicle in a camera window — real signal, mixed with real noise that has to be individually ruled out.",
  },
  endgame: {
    label: "The endgame",
    note: "The arrest interview — reachable only once every independent thread above converges on the same person.",
  },
};

export const THREAD_ORDER: ActionThread[] = [
  "general",
  "mason",
  "toolmark",
  "butt",
  "haddad",
  "records",
  "anpr",
  "endgame",
];

export const ACTIONS: ActionItem[] = [
  // ---------------------------------------------------------------------
  // Institutional inertia — initial interviews (prerequisite for re-interviews)
  // ---------------------------------------------------------------------
  {
    id: "pull-interview-burgess-mason",
    category: "documentary",
    thread: "general",
    case: "mason",
    group: "interviews",
    label: "Pull initial interview — Martin Burgess (2019, Mason case)",
    shortLabel: "Burgess's 2019 interview",
    description: "Retrieve the original file before pushing for anything further with him.",
    cost: 1,
    outcome: "A voluntary interview, 16 October 2019 — Burgess declined a solicitor. He gives a detailed account of servicing Mason's boiler that afternoon and an explanation for a 45-minute gap in his van's telematics, and suggests the death might be \"county lines stuff.\" Nothing was flagged for further action at the time.",
  },
  {
    id: "pull-interview-wooley",
    category: "documentary",
    thread: "general",
    case: "wooley",
    group: "interviews",
    label: "Pull initial interview — Nigel Wooley (2022, Wooley case)",
    shortLabel: "Nigel Wooley's 2022 interview",
    description: "Retrieve the original file before pushing for anything further with him.",
    cost: 1,
    outcome: "Two-part interview, 7 January 2022: the first with Nigel Wooley alone, the second after he asks for a solicitor, with R. Okafor present.",
  },
  {
    id: "pull-interview-haddad",
    category: "documentary",
    thread: "general",
    case: "porterhouse",
    group: "interviews",
    label: "Pull initial interview — Khalid Haddad (2023, Porterhouse case)",
    shortLabel: "Haddad's 2023 interview",
    description: "Retrieve the original file before pushing for anything further with him.",
    cost: 1,
    outcome: "Arrested and interviewed, 2023. Haddad answers \"no comment\" throughout, including when shown delivery-app data placing him at the scene.",
  },
  {
    id: "pull-interview-swayne",
    category: "documentary",
    thread: "general",
    case: "porterhouse",
    group: "interviews",
    label: "Pull initial interview — Colin Swayne (2023, Porterhouse case)",
    shortLabel: "Swayne's 2023 interview",
    description: "Retrieve the original file before pushing for anything further with him.",
    cost: 1,
    outcome: "2023. Swayne denies leaving home, then says he made a brief visit \"to collect money,\" then — once forensic results are put to him — says he used drugs with Porterhouse for over an hour. He won't say who else was present.",
  },

  // ---------------------------------------------------------------------
  // Institutional inertia — forensic pathology reports (all four cases)
  // ---------------------------------------------------------------------
  {
    id: "forensic-report-mason",
    category: "forensic",
    thread: "general",
    case: "mason",
    group: "forensics",
    label: "Pull forensic pathology report — Geoff Mason",
    shortLabel: "Mason's pathology report",
    description: "Request the formal post-mortem examination report from the records office.",
    cost: 1,
    availableFromWeek: 9,
    outcome: "Cause of death: blunt force trauma to the head and neck, concentrated to the crown and left temporal region. A small quantity of synthetic fibre, inconsistent with Mason's own clothing, was recovered from the margins of the skull fractures — noted as insufficient for origin determination at the time. Weapon not recovered; wound pattern consistent with a blunt, elongated object.",
  },
  {
    id: "forensic-report-wooley",
    category: "forensic",
    thread: "general",
    case: "wooley",
    group: "forensics",
    label: "Pull forensic pathology report — Susan Wooley",
    shortLabel: "Wooley's pathology report",
    description: "Request the formal post-mortem examination report from the records office.",
    cost: 1,
    availableFromWeek: 9,
    outcome: "Cause of death: blunt force trauma to the head, struck from behind or the side. No signs of forced entry. Weapon not recovered; wound pattern noted as \"similar in general character\" to another unresolved case in the area, though not formally compared at the time.",
  },
  {
    id: "forensic-report-porterhouse",
    category: "forensic",
    thread: "general",
    case: "porterhouse",
    group: "forensics",
    label: "Pull forensic pathology report — Carl Porterhouse",
    shortLabel: "Porterhouse's pathology report",
    description: "Request the formal post-mortem examination report from the records office.",
    cost: 1,
    availableFromWeek: 9,
    outcome: "Cause of death: blunt force trauma to the back of the head, with bruising and soft-tissue injury consistent with an assault by more than one person acting together. Extensive DNA and fibre trace matching Colin Swayne recovered throughout the property; additional partial profiles don't match anyone currently on file. Weapon not recovered — a heavy, irregular household item rather than a bladed or purpose-made weapon.",
  },
  {
    id: "forensic-report-butt-initial",
    category: "forensic",
    thread: "general",
    case: "butt",
    group: "forensics",
    label: "Pull forensic pathology report — Sara Butt (initial)",
    shortLabel: "Butt's initial pathology report",
    description: "Request the formal post-mortem examination report from the records office.",
    cost: 1,
    availableFromWeek: 9,
    outcome: "Initial findings, pending further examination: bruising and soft-tissue injury to the head, neck, and upper body consistent with blunt force trauma, complicated by five days' partial submersion prior to recovery. Material recovered from under the fingernails of her right hand, consistent with a struggle — DNA obtained; no match on file.",
  },
  {
    id: "forensic-report-butt-followup",
    category: "forensic",
    thread: "general",
    case: "butt",
    group: "forensics",
    label: "Pull Sara Butt's follow-up forensic report",
    shortLabel: "Butt's follow-up report",
    description: "A senior pathologist's fuller review, assigned given the case's public profile. Not available until the review has had time to complete.",
    cost: 1,
    availableFromWeek: 10,
    prerequisiteActionIds: ["forensic-report-butt-initial"],
    outcome: "Supplementary report, supersedes the initial finding. Revised cause of death: asphyxiation by manual strangulation, not blunt force trauma — a fractured hyoid bone and patterned bruising to the neck consistent with a hand grip, both largely unaffected by the water immersion that degraded the earlier soft-tissue evidence. The bruising to the head and body noted initially is now attributed to the struggle and disposal, not a separate fatal blow.",
  },

  // ---------------------------------------------------------------------
  // General / cross-case actions
  // ---------------------------------------------------------------------
  {
    id: "reint-wooley",
    category: "interview",
    thread: "general",
    case: "wooley",
    group: "interviews",
    label: "Re-interview Nigel Wooley",
    description: "Follow-up interview on his account of the evening.",
    cost: 1,
    prerequisiteActionIds: ["pull-interview-wooley"],
    outcome: "He repeats his account of being home. Phone data still places him there.",
  },
  {
    id: "reint-swayne",
    category: "interview",
    thread: "general",
    case: "porterhouse",
    group: "interviews",
    label: "Re-interview Colin Swayne",
    description: "Follow-up interview on his movements around Porterhouse's death.",
    cost: 1,
    prerequisiteActionIds: ["pull-interview-swayne"],
    outcome: "Swayne grows agitated when asked about county lines, but offers nothing new about the night Porterhouse died.",
  },
  {
    id: "reint-haddad",
    category: "interview",
    thread: "general",
    case: "porterhouse",
    group: "interviews",
    label: "Re-interview Khalid Haddad",
    shortLabel: "re-interviewing Haddad",
    description: "Follow-up interview with Khalid Haddad.",
    cost: 2,
    prerequisiteActionIds: ["pull-interview-haddad"],
    outcome: "Haddad mentions a dark 4x4 idling near the woods some months back.",
  },
  {
    id: "forensic-dna",
    category: "forensic",
    thread: "general",
    case: "wooley",
    group: "forensics",
    label: "Retest DNA — Wooley scene",
    description: "Establish whether recovered DNA can be dated to the day of her death.",
    cost: 2,
    prerequisiteActionIds: ["forensic-report-wooley"],
    outcome: "The lab confirms the DNA is present but cannot date it.",
  },
  {
    id: "doc-memo",
    category: "documentary",
    thread: "general",
    case: "mason",
    group: "records",
    label: "Pull the case-prioritisation memo",
    description: "Request the internal paperwork behind the original investigation's resourcing decisions.",
    cost: 2,
    outcome: "The memo shows Mason's case was deprioritised within a week.",
  },
  {
    id: "canvas",
    category: "witness",
    thread: "general",
    case: "general",
    group: "interviews",
    label: "Witness canvas — Boresfield / Featherton",
    description: "Door-to-door follow-up for anyone who saw something unreported at the time.",
    cost: 1,
    outcome: "A resident recalls 'a big bloke in a puffer coat' near the tenements.",
  },
  {
    id: "homeowner-witness-wooley",
    category: "witness",
    thread: "general",
    case: "wooley",
    group: "interviews",
    label: "Re-interview the homeowner Burgess visited after leaving Wooley's street, 6 January 2022",
    shortLabel: "the Wooley-night homeowner witness",
    description: "This appointment was not followed up at the time.",
    cost: 2,
    outcome: "Most procedural detail is gone after three years, but one thing has stuck with the homeowner: Burgess seemed off — sweating more than the job accounted for, short-tempered — and at one point pulled his toolbox out of sight before an awkward explanation about a valve. They couldn't put a confident time to it.",
  },
  {
    id: "reint-nigel-butt-evening",
    category: "interview",
    thread: "general",
    case: "butt",
    group: "interviews",
    label: "Re-interview Nigel Wooley regarding the evening of 22 May",
    shortLabel: "Nigel's Butt-evening interview",
    description: "Follow-up interview about his movements that evening.",
    cost: 1,
    prerequisiteActionIds: ["pull-interview-wooley"],
    outcome: "Nigel says he has no information about Sara Butt's death and doesn't know Martin Burgess. He confirms an early-evening dog walk near the marsh's northern approach, and objects to being questioned again: \"Am I being treated as a suspect now for Christ's sake?\"",
  },
  {
    id: "holly-creagan-statement",
    category: "witness",
    thread: "general",
    case: "porterhouse",
    group: "interviews",
    label: "Request Holly Creagan's statement, re: Swayne's whereabouts",
    shortLabel: "Holly Creagan's statement",
    description: "Swayne names her as someone he uses drugs with. A formal statement about the evening of 22 May.",
    cost: 2,
    outcome: "Holly confirms Colin comes round hers \"often enough\" but can't swear to one specific evening in May over another — evenings using together blend together for her.",
  },
  {
    id: "phone-data-butt",
    category: "documentary",
    thread: "general",
    case: "butt",
    group: "phone",
    label: "Request Sara Butt's phone data extraction",
    shortLabel: "Butt's phone data extraction",
    description: "Standard digital forensic extraction from her recovered device.",
    cost: 1,
    outcome: "A WhatsApp message to \"Mum & Dad\" at 22:49:07 on 22 May, reading \"back in 10\" — GPS metadata places the device near the Boresfield bus stop at the time. No outgoing activity afterward.",
  },

  // ---------------------------------------------------------------------
  // Mason movements chain
  // ---------------------------------------------------------------------
  {
    id: "traffic-cam-hollen-marsh",
    category: "visual",
    thread: "mason",
    case: "mason",
    group: "cameras",
    label: "Request local authority traffic camera footage, Hollen Marsh access roads",
    shortLabel: "traffic camera footage",
    description: "Pull traffic-camera footage from the roads leading into and out of Hollen Marsh around the estimated time of death.",
    cost: 2,
    outcome: "A council camera shows a dark 4x4 travelling toward Hollen Marsh at 9:14pm, and returning the other way at 9:52pm. The plate is clearly readable.",
  },
  {
    id: "canvass-doorbell-mason",
    category: "visual",
    thread: "mason",
    case: "mason",
    group: "cameras",
    label: "Canvass the residential street for doorbell/ring camera footage",
    shortLabel: "doorbell camera footage",
    description: "Door-to-door canvass of the residential street nearest the car park, checking doorbell and home-security cameras for anything unreported.",
    cost: 1,
    outcome: "One homeowner's doorbell camera catches a heavy-set man on foot at 9:47pm, carrying something bulky. He cannot be identified with certainty.",
  },
  {
    id: "vehicle-reg-lookup",
    category: "forensic",
    thread: "mason",
    case: "mason",
    group: "cameras",
    label: "Run the vehicle registration",
    description: "Cross-reference the plate read from the traffic-camera footage against DVLA records.",
    cost: 1,
    prerequisiteActionIds: ["traffic-cam-hollen-marsh"],
    outcome: "Registration KN58 TVP — registered keeper: Mrs [P.] Burgess. No other flags on file.",
  },

  // ---------------------------------------------------------------------
  // Tool-mark chain — cross-case comparison, not a single-case review
  // ---------------------------------------------------------------------
  {
    id: "toolmark-review-mason-wooley",
    category: "forensic",
    thread: "toolmark",
    case: "general",
    group: "forensics",
    alsoRelatesTo: ["mason", "wooley"],
    label: "Request a comparative forensic review of wound patterns — Mason and Wooley",
    shortLabel: "the Mason/Wooley tool-mark review",
    description: "A comparison of the wound patterns recorded in the Mason and Wooley post-mortem examinations.",
    cost: 3,
    prerequisiteActionIds: ["forensic-report-mason", "forensic-report-wooley"],
    outcome: "A comparative review of the skull fracture patterns in the unsolved Mason (2019) and Wooley (2022) cases finds a consistent match: two parallel, flat impact surfaces, evenly spaced, repeated across multiple wound sites in both victims — inconsistent with a rounded object, and a close match for the jaws of an adjustable spanner or similar wrench-type tool.",
  },
  {
    id: "property-search-burgess",
    category: "forensic",
    thread: "toolmark",
    case: "general",
    group: "forensics",
    label: "Request a property search — Martin Burgess (home and workplace)",
    shortLabel: "the Burgess property search",
    description: "A search warrant for his home and workplace, executed on the strength of the tool-mark match.",
    cost: 2,
    prerequisiteActionIds: ["toolmark-review-mason-wooley"],
    outcome: "His work van holds his gas-engineer's kit — one spanner conspicuously cleaner than the rest of the set. Forensic comparison: matches the tool-mark signature exactly (flat, parallel impact surfaces).",
  },
  {
    id: "property-search-wooley",
    category: "forensic",
    thread: "toolmark",
    case: "general",
    group: "forensics",
    label: "Request a property search — Nigel Wooley (home and workplace)",
    shortLabel: "the Nigel Wooley property search",
    description: "A search warrant for his home and workplace, executed on the strength of the tool-mark match.",
    cost: 2,
    prerequisiteActionIds: ["toolmark-review-mason-wooley"],
    outcome: "A steel surveyor's levelling pole in a hall cupboard, left over from his old career — genuinely heavy, with a smooth cylindrical cross-section, not the flat parallel signature. The same cupboard holds an ordinary household toolkit, including an adjustable spanner — the same type of tool, showing the wear of ordinary, infrequent DIY use.",
  },
  {
    id: "property-search-swayne",
    category: "forensic",
    thread: "toolmark",
    case: "general",
    group: "forensics",
    label: "Request a property search — Colin Swayne (home and workplace)",
    shortLabel: "the Swayne property search",
    description: "A search warrant for his home and workplace, executed on the strength of the tool-mark match.",
    cost: 2,
    prerequisiteActionIds: ["toolmark-review-mason-wooley"],
    outcome: "An old claw hammer, unclear origin, in a kitchen drawer. Forensic comparison: no match — the claw and rounded head don't produce the wound pattern.",
  },
  {
    id: "interim-interview-burgess",
    category: "interview",
    thread: "toolmark",
    case: "general",
    group: "interviews",
    label: "Interim interview — Martin Burgess, voluntary under caution",
    shortLabel: "Burgess's interim interview",
    description: "Voluntary interview under caution following the search of his van.",
    cost: 1,
    prerequisiteActionIds: ["property-search-burgess", "pull-interview-burgess-mason"],
    outcome: "Burgess declines a solicitor. Confronted with the spanner and the tool-mark match to Mason and Wooley, he explains that lubricant on the handle is hard to clean without soaking and that he wiped it down before it rusted, and denies any connection to either death.",
  },

  // ---------------------------------------------------------------------
  // Butt movements chain — two genuine, fragmented capture points
  // ---------------------------------------------------------------------
  {
    id: "bus-cctv-butt",
    category: "visual",
    thread: "butt",
    case: "butt",
    group: "cameras",
    label: "Request bus operator CCTV/payment records, routes serving Critchley estate, evening of 22 May",
    shortLabel: "bus operator CCTV/payment records",
    description: "Check the routes into Hollenbourne from Critchley for the evening of Sara Butt's death.",
    cost: 2,
    outcome: "A contactless fare boards a service toward Critchley at 8:52pm — an unregistered, pay-as-you-go card, no name attached. Onboard CCTV shows a heavy-set male passenger matching general build, alone, sitting apart from other passengers.",
  },
  {
    id: "highstreet-cctv-butt",
    category: "visual",
    thread: "butt",
    case: "butt",
    group: "cameras",
    label: "Request Hollenbourne high street CCTV, evening of 22 May",
    shortLabel: "high street CCTV",
    description: "Follow the same evening's movements onto the high street.",
    cost: 1,
    prerequisiteActionIds: ["bus-cctv-butt"],
    outcome: "A heavy-set man matching the earlier description is briefly visible on high street CCTV at 9:38pm, before leaving the frame down a side street.",
  },
  {
    id: "doorbell-paget-street-butt",
    category: "visual",
    thread: "butt",
    case: "butt",
    group: "cameras",
    label: "Canvass Paget Street, North Hollenbourne, for doorbell/ring camera footage",
    shortLabel: "the Paget Street doorbell canvass",
    description: "Door-to-door canvass of the residential route away from the high street.",
    cost: 2,
    prerequisiteActionIds: ["highstreet-cctv-butt"],
    outcome: "One doorbell camera catches the same build and clothing — dark puffer jacket, work boots, hood up — moving toward the marshes at approximately 9:45pm. No usable facial capture.",
  },

  // ---------------------------------------------------------------------
  // The endgame
  // ---------------------------------------------------------------------
  {
    id: "endgame-arrest-burgess-butt",
    category: "interview",
    thread: "endgame",
    case: "butt",
    group: "interviews",
    label: "Arrest and interview Burgess — Butt case",
    shortLabel: "Burgess's arrest interview",
    description: "Arrest and formal interview under caution.",
    cost: 2,
    prerequisiteActionIds: [
      "bus-cctv-butt",
      "doorbell-paget-street-butt",
      "toolmark-review-mason-wooley",
      "property-search-burgess",
      "vehicle-reg-lookup",
    ],
    outcome: "Arrest interview, Hollenbourne Police Station, 2025. DS Ferris interviewing, DC Marsh second officer. Mr Burgess is offered a solicitor and declines; the interview is suspended at 10:47 after he asks for one.",
  },

  // ---------------------------------------------------------------------
  // Haddad / Wooley cross-reference
  // ---------------------------------------------------------------------
  {
    id: "haddad-wooley-crossref",
    category: "documentary",
    thread: "haddad",
    case: "wooley",
    group: "phone",
    alsoRelatesTo: ["porterhouse"],
    label: "Cross-reference Haddad's known movement data against the Wooley case timeframe",
    shortLabel: "the Haddad/Wooley cross-reference",
    description: "Compare his delivery-app movement data against the evening of 6 January 2022.",
    cost: 2,
    prerequisiteActionIds: ["reint-haddad"],
    outcome: "His employer's delivery-app GPS logs place him on Marsh Road on the evening of 6 January 2022 — the night Susan Wooley died.",
  },
  {
    id: "haddad-wooley-further-interview",
    category: "interview",
    thread: "haddad",
    case: "wooley",
    group: "interviews",
    alsoRelatesTo: ["porterhouse"],
    label: "Further interview — Haddad, re: Wooley",
    shortLabel: "Haddad's Wooley-case interview",
    description: "Voluntary interview with Khalid Haddad.",
    cost: 1,
    prerequisiteActionIds: ["haddad-wooley-crossref", "pull-interview-haddad"],
    outcome: "Haddad pushes back sharply once confronted (\"if you thought I did that Porterhouse geezer you'd have charged me\") before disclosing a pickup on Marsh Road that evening, dropped off shortly after in Featherton. He knows neither the person who asked nor the person he handed it to.",
  },

  // ---------------------------------------------------------------------
  // Cell site data & historical records (gated on the subject already
  // being a named suspect/person of interest)
  // ---------------------------------------------------------------------
  {
    id: "cellsite-burgess-wooley",
    category: "documentary",
    thread: "records",
    case: "wooley",
    group: "phone",
    label: "Request historic cell site data — Martin Burgess, 6 January 2022 (Wooley)",
    shortLabel: "Burgess's Wooley-night cell site data",
    description: "Cell site analysis of his phone for the afternoon of 6 January 2022.",
    cost: 3,
    prerequisiteActionIds: ["property-search-burgess"],
    outcome: "The device connects to the sector covering the booked job's street — which also covers Susan Wooley's address — continuously from 15:14 to 16:51, then moves to a sector consistent with travel toward Featherton. No second booking is recorded at any address within the sector after the first job's expected completion.",
  },
  {
    id: "cellsite-burgess-mason",
    category: "documentary",
    thread: "records",
    case: "mason",
    group: "phone",
    label: "Request historic cell site data — Martin Burgess, 8 October 2019 (Mason)",
    shortLabel: "Burgess's Mason-night cell site data",
    description: "Cell site analysis of his phone for the afternoon and evening of 8 October 2019.",
    cost: 2,
    prerequisiteActionIds: ["property-search-burgess"],
    outcome: "The device enters the Boresfield sector at about 15:18, connects to the sector covering Geoff Mason's street from 15:31 to 16:20, then moves to a sector consistent with Harrison Road at about 16:33. No cell activity is recorded for the device that evening.",
  },
  {
    id: "cellsite-burgess-butt",
    category: "documentary",
    thread: "records",
    case: "butt",
    group: "phone",
    label: "Request historic cell site data — Martin Burgess, 22 May 2025 (Butt)",
    shortLabel: "Burgess's Butt-night cell site data",
    description: "Cell site analysis of his phone for the evening of 22 May 2025.",
    cost: 2,
    prerequisiteActionIds: ["property-search-burgess"],
    outcome: "The device connects to the Critchley sector at 20:48, moves through the high street and into the North-Hollenbourne sector by 21:45, then reaches the sector covering the marsh's southern approach by 22:30, before the connection is lost at 22:58.",
  },
  {
    id: "cellsite-nigel-butt",
    category: "documentary",
    thread: "records",
    case: "butt",
    group: "phone",
    label: "Request historic cell site data — Nigel Wooley, 22 May 2025",
    shortLabel: "Nigel's Butt-night cell site data",
    description: "Cell site analysis of his phone for the evening of 22 May 2025.",
    cost: 1,
    prerequisiteActionIds: ["pull-interview-wooley"],
    outcome: "The device stays within the Featherton sector from 18:00, moving briefly to the sector covering the marsh's northern approach between 19:40 and 20:05, then returning to the Featherton sector for the rest of the evening.",
  },
  {
    id: "cellsite-swayne-porterhouse",
    category: "documentary",
    thread: "records",
    case: "porterhouse",
    group: "phone",
    label: "Request historic cell site data — Colin Swayne, 29 May 2023",
    shortLabel: "Swayne's cell site data",
    description: "Cell site analysis of his phone for the evening of 29 May 2023.",
    cost: 2,
    prerequisiteActionIds: ["pull-interview-swayne"],
    outcome: "The device is stationary in the single sector covering both Swayne's own address and Porterhouse's from 20:41 through to 22:15, after which the connection becomes intermittent.",
  },
  {
    id: "haddad-record-summary",
    category: "documentary",
    thread: "records",
    case: "porterhouse",
    group: "records",
    label: "Request historical record summary — Khalid Haddad (PNC/NRM)",
    shortLabel: "Haddad's PNC/NRM record",
    description: "Request his PNC/NRM record summary.",
    cost: 1,
    prerequisiteActionIds: ["reint-haddad"],
    outcome: "2018: arrested during a county lines operation. A duty solicitor raised concern about exploitation given his age, immigration history and clean record, and an NRM referral was made before charge. The case was discontinued on a Section 45 Modern Slavery Act defence; no conviction recorded. The Home Office's Single Competent Authority returned positive reasonable-grounds and conclusive-grounds decisions.",
  },
  {
    id: "riverbank-liaison-swayne",
    category: "documentary",
    thread: "records",
    case: "porterhouse",
    group: "records",
    label: "Request Operation Riverbank liaison — Colin Swayne",
    shortLabel: "the Operation Riverbank liaison",
    description: "Request the record of Swayne's 2024 interview under Operation Riverbank.",
    cost: 2,
    outcome: "A 2024 interview under caution by a separate organised crime unit, about the county lines network operating around Boresfield. Swayne says Kato and Reece approached an \"old boy\" near the marsh in 2019, trying to use his house, before approaching Swayne; the man refused. When told this was Geoff Mason, Swayne says he hadn't known.",
  },

  // ---------------------------------------------------------------------
  // ANPR sweeps — unfiltered searches across every vehicle in a camera
  // window, distinct from the records above (which target one named person)
  // ---------------------------------------------------------------------
  {
    id: "anpr-burgess-vehicle-history",
    category: "forensic",
    thread: "anpr",
    case: "mason",
    group: "cameras",
    label: "Request ANPR history for Patricia Burgess's vehicle, wider date range",
    shortLabel: "Burgess's vehicle ANPR history",
    description: "A national, queryable camera network, once the plate is known.",
    cost: 2,
    prerequisiteActionIds: ["vehicle-reg-lookup"],
    outcome: "The vehicle is picked up on the Hollen Marsh approach roads at 9:11pm and 9:54pm on 8 October 2019. No ANPR hits at all near Wooley's address on 6 January 2022, or near the marsh or Boresfield on 22 May 2025.",
  },
  {
    id: "anpr-sweep-hollen-marsh-2019",
    category: "forensic",
    thread: "anpr",
    case: "mason",
    group: "cameras",
    label: "Request full ANPR sweep — Hollen Marsh access roads, 8 October 2019, 21:00–22:00",
    shortLabel: "the 2019 Hollen Marsh ANPR sweep",
    description: "An unfiltered sweep of every vehicle through camera coverage in the window, not a targeted request.",
    cost: 3,
    prerequisiteActionIds: ["traffic-cam-hollen-marsh"],
    outcome: "Four vehicles pass through in the window. One is the dark 4x4 registered to Patricia Burgess. The other three are eliminated individually: a taxi confirmed en route to an unrelated fare, a resident's car returning home, and a delivery van on a scheduled round.",
  },
  {
    id: "anpr-haddad-marsh-road",
    category: "forensic",
    thread: "anpr",
    case: "wooley",
    group: "cameras",
    label: "Request ANPR check — Khalid Haddad's vehicle, Marsh Road, 6 January 2022",
    shortLabel: "Haddad's Marsh Road ANPR check",
    description: "ANPR check on Khalid Haddad's vehicle for Marsh Road on the evening of 6 January 2022.",
    cost: 1,
    prerequisiteActionIds: ["reint-haddad"],
    outcome: "The vehicle is picked up at the northern end of Marsh Road at 18:04, and again heading back onto Chertsey Street at 18:16.",
  },
  {
    id: "anpr-sweep-featherton-2022",
    category: "forensic",
    thread: "anpr",
    case: "wooley",
    group: "cameras",
    label: "Request full ANPR sweep — Featherton, 6 January 2022, 18:10–18:20",
    shortLabel: "the 2022 Featherton ANPR sweep",
    description: "An unfiltered sweep of every vehicle through camera coverage in the window, not a targeted request.",
    cost: 2,
    prerequisiteActionIds: ["anpr-haddad-marsh-road"],
    outcome: "Three vehicles pass through besides Haddad's own: a resident's car confirmed as a normal return home, a delivery van on a separate scheduled round, and one plate that returns no match on the DVLA database at all.",
  },
  // Added last on purpose: exhibit numbers are handed out in catalog order
  // (lib/evidence-catalog.ts), so appending keeps every existing EX.nn fixed.
  {
    id: "londis-cctv-butt",
    category: "visual",
    thread: "butt",
    case: "butt",
    group: "cameras",
    label: "Request Londis entrance CCTV, evening of 22 May",
    shortLabel: "Londis entrance CCTV",
    description: "Check the camera at the Londis entrance for the evening of Sara Butt's death.",
    cost: 2,
    prerequisiteActionIds: ["pull-interview-swayne"],
    outcome: "The camera records a man in a grey hooded tracksuit with dark side stripes, a rip at the knee and dark boots entering the shop doorway at 23:23:17 on 22 May 2025. His face is visible.",
  },
  {
    id: "ring-cam-pleasance-street-butt",
    category: "visual",
    thread: "butt",
    case: "butt",
    group: "cameras",
    label: "Canvass Pleasance Street, North Hollenbourne, for doorbell/ring camera footage",
    shortLabel: "the Pleasance Street doorbell canvass",
    description: "Door-to-door canvass of Pleasance Street for doorbell and home-security cameras.",
    cost: 2,
    prerequisiteActionIds: ["pull-interview-swayne"],
    outcome: "One doorbell camera records a man in a grey hooded tracksuit with dark side stripes and dark boots walking along the pavement at 21:52:08 on 22 May 2025. His face is partly visible in profile.",
  },
];

export function getActionItem(id: string): ActionItem | undefined {
  return ACTIONS.find((a) => a.id === id);
}
