// Static case content for the investigation action economy — ported from
// reference/action-economy.jsx, then deepened per the full spec in
// Reference/case-content/mechanics/hollenbourne-action-economy.md. Not
// stored in the database; team progress against this catalog lives in
// weekActionState + actionLog (db/schema.ts).

export type ActionCategory = "interview" | "forensic" | "documentary" | "visual" | "witness";

export type ActionItem = {
  id: string;
  category: ActionCategory;
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
  // ---------------------------------------------------------------------
  // Institutional inertia — initial interviews (prerequisite for re-interviews)
  // ---------------------------------------------------------------------
  {
    id: "pull-interview-burgess-mason",
    category: "documentary",
    label: "Pull initial interview — Martin Burgess (2019, Mason case)",
    shortLabel: "Burgess's 2019 interview",
    description: "Retrieve the original file before pushing for anything further with him.",
    cost: 1,
    outcome: "A voluntary interview, 16 October 2019 — Burgess declined a solicitor. Gives a detailed, accurate account of servicing Mason's boiler that afternoon, talks his way through a 45-minute gap in his van's telematics with an improvised two-part explanation, and closes by volunteering, unprompted, that it might be \"county lines stuff.\" Nothing flagged it for further action at the time.",
  },
  {
    id: "pull-interview-wooley",
    category: "documentary",
    label: "Pull initial interview — Nigel Wooley (2022, Wooley case)",
    shortLabel: "Nigel Wooley's 2022 interview",
    description: "Retrieve the original file before pushing for anything further with him.",
    cost: 1,
    outcome: "Two-part interview, 7 January 2022. Nigel denies leaving the house twice before the coat found in his flat makes further denial untenable, then requests a solicitor mid-interview. With R. Okafor present, he admits breaching the restraining order and his real motive — hearing Susan had a new partner — but denies any involvement in her death.",
  },
  {
    id: "pull-interview-haddad",
    category: "documentary",
    label: "Pull initial interview — Khalid Haddad (2023, Porterhouse case)",
    shortLabel: "Haddad's 2023 interview",
    description: "Retrieve the original file before pushing for anything further with him.",
    cost: 1,
    outcome: "Arrested and interviewed, 2023. Haddad answers \"no comment\" throughout, including when confronted with delivery-app data placing him at the scene. No admission, no further lead — the file was closed on that basis.",
  },
  {
    id: "pull-interview-swayne",
    category: "documentary",
    label: "Pull initial interview — Colin Swayne (2023, Porterhouse case)",
    shortLabel: "Swayne's 2023 interview",
    description: "Retrieve the original file before pushing for anything further with him.",
    cost: 1,
    outcome: "Gradual, prompted admissions, 2023. Swayne denies leaving home, then admits a brief visit \"to collect money,\" then — once forensic results are put to him — admits using drugs with Porterhouse for over an hour. He won't say who else was present.",
  },

  // ---------------------------------------------------------------------
  // Institutional inertia — forensic pathology reports (all four cases)
  // ---------------------------------------------------------------------
  {
    id: "forensic-report-mason",
    category: "forensic",
    label: "Pull forensic pathology report — Geoff Mason",
    shortLabel: "Mason's pathology report",
    description: "Request the formal post-mortem examination report. A records office reluctant to hand sensitive material to outside consultants, even years on.",
    cost: 1,
    availableFromWeek: 9,
    outcome: "Cause of death: blunt force trauma to the head and neck, concentrated to the crown and left temporal region. A small quantity of synthetic fibre, inconsistent with Mason's own clothing, was recovered from the margins of the skull fractures — noted as insufficient for origin determination at the time, and never pursued further. Weapon not recovered; wound pattern consistent with a blunt, elongated object.",
  },
  {
    id: "forensic-report-wooley",
    category: "forensic",
    label: "Pull forensic pathology report — Susan Wooley",
    shortLabel: "Wooley's pathology report",
    description: "Request the formal post-mortem examination report. A records office reluctant to hand sensitive material to outside consultants, even years on.",
    cost: 1,
    availableFromWeek: 9,
    outcome: "Cause of death: blunt force trauma to the head, struck from behind or the side. No signs of forced entry — she likely admitted her killer, or was killed by someone already known to her. Weapon not recovered; wound pattern noted as \"similar in general character\" to another unresolved case in the area, though not formally compared at the time.",
  },
  {
    id: "forensic-report-porterhouse",
    category: "forensic",
    label: "Pull forensic pathology report — Carl Porterhouse",
    shortLabel: "Porterhouse's pathology report",
    description: "Request the formal post-mortem examination report. A records office reluctant to hand sensitive material to outside consultants, even years on.",
    cost: 1,
    availableFromWeek: 9,
    outcome: "Cause of death: blunt force trauma to the back of the head, with bruising and soft-tissue injury consistent with an assault by more than one person acting together. Extensive DNA and fibre trace matching Colin Swayne recovered throughout the property; additional partial profiles don't match anyone currently on file. Weapon not recovered — a heavy, irregular household item rather than a bladed or purpose-made weapon.",
  },
  {
    id: "forensic-report-butt-initial",
    category: "forensic",
    label: "Pull forensic pathology report — Sara Butt (initial)",
    shortLabel: "Butt's initial pathology report",
    description: "Request the formal post-mortem examination report. A records office reluctant to hand sensitive material to outside consultants, even years on.",
    cost: 1,
    availableFromWeek: 9,
    outcome: "Initial findings, pending further examination: bruising and soft-tissue injury to the head, neck, and upper body consistent with blunt force trauma, complicated by five days' partial submersion prior to recovery. Material recovered from under the fingernails of her right hand, consistent with a struggle — DNA obtained, but it doesn't match anyone currently on file without a named suspect to compare it against.",
  },
  {
    id: "forensic-report-butt-followup",
    category: "forensic",
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
    label: "Re-interview Nigel Wooley",
    description: "Already flagged in the original investigation. Press on his account of the evening.",
    cost: 1,
    prerequisiteActionIds: ["pull-interview-wooley"],
    outcome: "He repeats his account of being home. Phone data still places him there — but he doesn't mention the dog, or the car park.",
  },
  {
    id: "reint-swayne",
    category: "interview",
    label: "Re-interview Colin Swayne",
    description: "Known to police already. Follow up on his movements around Porterhouse's death.",
    cost: 1,
    prerequisiteActionIds: ["pull-interview-swayne"],
    outcome: "Swayne grows agitated when asked about county lines, but offers nothing new about the night Porterhouse died.",
  },
  {
    id: "reint-haddad",
    category: "interview",
    label: "Re-interview Khalid Haddad",
    shortLabel: "re-interviewing Haddad",
    description: "Cleared of suspicion early on. Reopening this line goes against the existing file.",
    cost: 2,
    prerequisiteActionIds: ["pull-interview-haddad"],
    outcome: "Haddad mentions, almost in passing, a dark 4x4 idling near the woods some months back. Nobody asked him about it before.",
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
  {
    id: "homeowner-witness-wooley",
    category: "witness",
    label: "Re-interview the homeowner Burgess visited after leaving Wooley's street, 6 January 2022",
    shortLabel: "the Wooley-night homeowner witness",
    description: "This appointment was never followed up on at the time — cold, unprompted, against the grain of the original investigation's focus.",
    cost: 2,
    outcome: "Most procedural detail is gone after three years, but one thing has stuck with the homeowner: Burgess seemed off — sweating more than the job accounted for, short-tempered — and at one point pulled his toolbox out of sight before an awkward explanation about a valve. They couldn't put a confident time to it.",
  },
  {
    id: "reint-nigel-butt-evening",
    category: "interview",
    label: "Re-interview Nigel Wooley regarding the evening of 22 May",
    shortLabel: "Nigel's Butt-evening interview",
    description: "He's already a known quantity to the review, not a fresh lead — but he was in the general vicinity that night too.",
    cost: 1,
    prerequisiteActionIds: ["pull-interview-wooley"],
    outcome: "Nigel has no information of any value about Sara Butt's death and doesn't know Martin Burgess at all. He confirms an early-evening dog walk near the marsh's northern approach — well before the attack — and pushes back sharply at being pulled into scrutiny again: \"Am I being treated as a suspect now for Christ's sake?\"",
  },
  {
    id: "holly-creagan-statement",
    category: "witness",
    label: "Request Holly Creagan's statement, re: Swayne's whereabouts",
    shortLabel: "Holly Creagan's statement",
    description: "Swayne names her, in passing, as who he uses drugs with. Worth a formal statement on the Butt evening specifically.",
    cost: 2,
    outcome: "Holly confirms Colin comes round hers \"often enough\" but can't swear to one specific evening in May over another — evenings using together blend together for her. Genuinely uncomplicated, not guarded: she wasn't told what date mattered, and didn't ask. Neither confirms nor contradicts Swayne's whereabouts on the Butt evening.",
  },
  {
    id: "phone-data-butt",
    category: "documentary",
    label: "Request Sara Butt's phone data extraction",
    shortLabel: "Butt's phone data extraction",
    description: "Standard digital forensic extraction from her recovered device.",
    cost: 1,
    outcome: "A WhatsApp message to \"Mum & Dad\" at 22:49:07 on 22 May, reading \"back in 10\" — GPS metadata places the device near the Boresfield bus stop at the time. No outgoing activity afterward. Cross-references cleanly with the bus operator's 8:52pm boarding timestamp and the Paget Street doorbell sighting, though nobody had compared the three before this review.",
  },

  // ---------------------------------------------------------------------
  // Mason movements chain
  // ---------------------------------------------------------------------
  {
    id: "traffic-cam-hollen-marsh",
    category: "visual",
    label: "Request local authority traffic camera footage, Hollen Marsh access roads",
    shortLabel: "traffic camera footage",
    description: "Pull traffic-camera footage from the roads leading into and out of Hollen Marsh around the estimated time of death.",
    cost: 2,
    outcome: "A council camera shows a dark 4x4 travelling toward Hollen Marsh at 9:14pm, and returning the other way at 9:52pm. The plate is clearly readable.",
  },
  {
    id: "canvass-doorbell-mason",
    category: "visual",
    label: "Canvass the residential street for doorbell/ring camera footage",
    shortLabel: "doorbell camera footage",
    description: "Door-to-door canvass of the residential street nearest the car park, checking doorbell and home-security cameras for anything unreported.",
    cost: 1,
    outcome: "One homeowner's doorbell camera catches a heavy-set man on foot at 9:47pm, carrying something bulky, moving without any obvious reason to be on that particular street. Not identifiable with certainty — but the timing sits precisely inside the window the vehicle was parked at Hollen Marsh.",
  },
  {
    id: "vehicle-reg-lookup",
    category: "forensic",
    label: "Run the vehicle registration",
    description: "Cross-reference the plate read from the traffic-camera footage against DVLA records.",
    cost: 1,
    prerequisiteActionIds: ["traffic-cam-hollen-marsh"],
    outcome: "Registered keeper: Mrs [P.] Burgess. No other flags on file.",
  },

  // ---------------------------------------------------------------------
  // Tool-mark chain — cross-case comparison, not a single-case review
  // ---------------------------------------------------------------------
  {
    id: "toolmark-review-mason-wooley",
    category: "forensic",
    label: "Request a comparative forensic review of wound patterns — Mason and Wooley",
    shortLabel: "the Mason/Wooley tool-mark review",
    description: "The single most expensive action in the review — a genuine cross-case comparison neither original examination ever made.",
    cost: 3,
    outcome: "A comparative review of the skull fracture patterns in the unsolved Mason (2019) and Wooley (2022) cases finds a consistent match: two parallel, flat impact surfaces, evenly spaced, repeated across multiple wound sites in both victims — inconsistent with a rounded object, and a close match for the jaws of an adjustable spanner or similar wrench-type tool. The same weapon, or an identical type of tool, appears to have been used in both killings.",
  },
  {
    id: "property-search-burgess",
    category: "forensic",
    label: "Request a property search — Martin Burgess (home and workplace)",
    shortLabel: "the Burgess property search",
    description: "A search warrant, executed on the strength of the tool-mark match, his trade, and his 2019 interview.",
    cost: 2,
    prerequisiteActionIds: ["toolmark-review-mason-wooley"],
    outcome: "His work van holds his gas-engineer's kit — one spanner conspicuously cleaner than the rest of the set. Forensic comparison: matches the tool-mark signature exactly (flat, parallel impact surfaces).",
  },
  {
    id: "property-search-wooley",
    category: "forensic",
    label: "Request a property search — Nigel Wooley (home and workplace)",
    shortLabel: "the Nigel Wooley property search",
    description: "A search warrant, executed on the strength of the tool-mark match. Applies identically across any suspect worth ruling in or out.",
    cost: 2,
    prerequisiteActionIds: ["toolmark-review-mason-wooley"],
    outcome: "A steel surveyor's levelling pole in a hall cupboard, left over from his old career — genuinely heavy, but ruled out by shape (smooth cylindrical cross-section, not the flat parallel signature). The same cupboard holds an ordinary household toolkit, including an adjustable spanner — the same type of tool, so it can't be ruled out by shape alone. It's ruled out on wear pattern instead: ordinary, infrequent DIY use, none of the anomalous cleaning that flagged Burgess's.",
  },
  {
    id: "property-search-swayne",
    category: "forensic",
    label: "Request a property search — Colin Swayne (home and workplace)",
    shortLabel: "the Swayne property search",
    description: "A search warrant, executed on the strength of the tool-mark match. Applies identically across any suspect worth ruling in or out.",
    cost: 2,
    prerequisiteActionIds: ["toolmark-review-mason-wooley"],
    outcome: "An old claw hammer, unclear origin, in a kitchen drawer — the kind of thing that accumulates in most homes. Forensic comparison: doesn't match — the claw and rounded head don't produce the established wound pattern.",
  },
  {
    id: "interim-interview-burgess",
    category: "interview",
    label: "Interim interview — Martin Burgess, voluntary under caution",
    shortLabel: "Burgess's interim interview",
    description: "Reachable well before a full case for arrest — his van has just been searched, and he knows why.",
    cost: 1,
    prerequisiteActionIds: ["property-search-burgess", "pull-interview-burgess-mason"],
    outcome: "Visibly more wary than in 2019, but he still declines a solicitor. Confronted with the spanner and the tool-mark match to Mason and Wooley, he offers a specific, textured explanation — lubricant on the handle, hard to clean without soaking, then wiped down before it rusted — and denies any connection to either death. The interview ends inconclusively: not enough to arrest, not a clean clearance either.",
  },

  // ---------------------------------------------------------------------
  // Butt movements chain — two genuine, fragmented capture points
  // ---------------------------------------------------------------------
  {
    id: "bus-cctv-butt",
    category: "visual",
    label: "Request bus operator CCTV/payment records, routes serving Critchley estate, evening of 22 May",
    shortLabel: "bus operator CCTV/payment records",
    description: "Check the routes into Hollenbourne from Critchley for the evening of Sara Butt's death.",
    cost: 2,
    outcome: "A contactless fare boards a service toward Critchley at 8:52pm — an unregistered, pay-as-you-go card, no name attached. Onboard CCTV shows a heavy-set male passenger matching general build, alone, sitting apart from other passengers.",
  },
  {
    id: "highstreet-cctv-butt",
    category: "visual",
    label: "Request Hollenbourne high street CCTV, evening of 22 May",
    shortLabel: "high street CCTV",
    description: "Follow the same evening's movements onto the high street.",
    cost: 1,
    outcome: "A heavy-set man matching the earlier description is briefly visible on high street CCTV shortly after 10pm, before leaving the frame down a side street rather than continuing toward the town centre or the piazza.",
  },
  {
    id: "doorbell-paget-street-butt",
    category: "visual",
    label: "Canvass Paget Street, North Hollenbourne, for doorbell/ring camera footage",
    shortLabel: "the Paget Street doorbell canvass",
    description: "Door-to-door canvass of the residential route away from the high street.",
    cost: 2,
    outcome: "One doorbell camera catches the same build and clothing — dark puffer jacket, work boots, hood up — moving toward the marshes at approximately 9:45pm. No usable facial capture. The route, via the high street and North Hollenbourne rather than straight through the piazza, deliberately avoids Featherton's much denser camera network.",
  },

  // ---------------------------------------------------------------------
  // The endgame
  // ---------------------------------------------------------------------
  {
    id: "endgame-arrest-burgess-butt",
    category: "interview",
    label: "Arrest and interview Burgess — Butt case",
    shortLabel: "Burgess's arrest interview",
    description: "The full confrontation. Only reachable once every independent thread has already converged on him.",
    cost: 2,
    prerequisiteActionIds: [
      "bus-cctv-butt",
      "doorbell-paget-street-butt",
      "toolmark-review-mason-wooley",
      "property-search-burgess",
      "vehicle-reg-lookup",
    ],
    outcome: "DS Ferris again — the same officer from his 2019 Mason interview. Burgess builds a full, vague account of his evening before being shown the bus fare, the cell site data, and the doorbell footage piece by piece. Pressed on why he'd avoid the best-covered route through town \"if he had nothing to hide,\" he falls back on the same county-lines deflection he used in 2019 — word for word, almost, which Ferris recognises immediately. He never confesses. The interview ends on a request for a solicitor, and a voice that's lost its composure for the first time in six years.",
  },

  // ---------------------------------------------------------------------
  // Haddad / Wooley cross-reference
  // ---------------------------------------------------------------------
  {
    id: "haddad-wooley-crossref",
    category: "documentary",
    label: "Cross-reference Haddad's known movement data against the Wooley case timeframe",
    shortLabel: "the Haddad/Wooley cross-reference",
    description: "Only makes sense once Haddad is already known to the case through Porterhouse.",
    cost: 2,
    prerequisiteActionIds: ["reint-haddad"],
    outcome: "His employer's delivery-app GPS logs place him on Marsh Road on the evening of 6 January 2022 — the night Susan Wooley died. Never checked against this case before; the original 2022 investigation never ran his data at all.",
  },
  {
    id: "haddad-wooley-further-interview",
    category: "interview",
    label: "Further interview — Haddad, re: Wooley",
    shortLabel: "Haddad's Wooley-case interview",
    description: "Voluntary, not an arrest — a real tonal shift from his Porterhouse interview.",
    cost: 1,
    prerequisiteActionIds: ["haddad-wooley-crossref", "pull-interview-haddad"],
    outcome: "Haddad pushes back sharply once confronted (\"if you thought I did that Porterhouse geezer you'd have charged me\") before eventually disclosing a pickup on Marsh Road that evening, dropped off shortly after in Featherton. He knows neither the person who asked nor the person he handed it to — a thread that goes nowhere further, deliberately.",
  },

  // ---------------------------------------------------------------------
  // Cell site data, historical records, and cross-agency liaison
  // (gated on the subject already being a named suspect/person of interest)
  // ---------------------------------------------------------------------
  {
    id: "cellsite-burgess-wooley",
    category: "documentary",
    label: "Request historic cell site data — Martin Burgess, 6 January 2022 (Wooley)",
    shortLabel: "Burgess's Wooley-night cell site data",
    description: "The single most valuable report in the set — the only one of Burgess's three killings with no independent movement evidence until now.",
    cost: 3,
    prerequisiteActionIds: ["pull-interview-burgess-mason"],
    outcome: "The device connects to the sector covering the booked job's street — which also covers Susan Wooley's address — continuously from 15:14 to 16:51, roughly 45–50 minutes longer than the booked job alone accounts for, with no second job logged to explain the remainder. Consistent with, and independently corroborating, his own later account of an unbooked visit nearby that afternoon.",
  },
  {
    id: "cellsite-burgess-mason",
    category: "documentary",
    label: "Request historic cell site data — Martin Burgess, 8 October 2019 (Mason)",
    shortLabel: "Burgess's Mason-night cell site data",
    description: "Confirming rather than new on its own — the value is in what it doesn't show.",
    cost: 2,
    prerequisiteActionIds: ["pull-interview-burgess-mason"],
    outcome: "A normal, complete pattern of movement for the booked job — arrival, appointment, and a departure route that doesn't retrace the approach. No cell activity at all is recorded that evening, consistent with the phone being left behind for the return trip to the marsh. The gap doesn't undermine the case: the traffic camera, ANPR, and doorbell evidence already on file don't depend on the phone at all.",
  },
  {
    id: "cellsite-burgess-butt",
    category: "documentary",
    label: "Request historic cell site data — Martin Burgess, 22 May 2025 (Butt)",
    shortLabel: "Burgess's Butt-night cell site data",
    description: "A confirming piece, stacked on top of the existing chain.",
    cost: 2,
    prerequisiteActionIds: ["pull-interview-burgess-mason"],
    outcome: "The device connects to the Critchley sector at 20:48 (matching the bus boarding), moves through the high street and into the North-Hollenbourne sector by 21:45 (matching Paget Street), then reaches the sector covering the marsh's southern approach by 22:30, before the connection is lost at 22:58. Independently corroborates the bus, high street, and doorbell sightings — three separate timestamps never cross-referenced against telecoms data until now.",
  },
  {
    id: "cellsite-nigel-butt",
    category: "documentary",
    label: "Request historic cell site data — Nigel Wooley, 22 May 2025",
    shortLabel: "Nigel's Butt-night cell site data",
    description: "He's a person of interest from the start, so this needs no gate of its own.",
    cost: 1,
    outcome: "The device stays within the Featherton sector from 18:00, moving briefly to the sector covering the marsh's northern approach between 19:40 and 20:05 — well before, and well clear of, Sara Butt's own confirmed movements, which begin with her 22:49 message near the Boresfield bus stop. Exonerating, and worth presenting as exactly that: the same tool that builds a case against Burgess clears Nigel with equal confidence.",
  },
  {
    id: "cellsite-swayne-porterhouse",
    category: "documentary",
    label: "Request historic cell site data — Colin Swayne, 29 May 2023",
    shortLabel: "Swayne's cell site data",
    description: "He's a named suspect from the start, so this needs no gate of its own.",
    cost: 2,
    outcome: "The device is stationary in the single sector covering both Swayne's own address and Porterhouse's from 20:41 through to 22:15 — over ninety minutes, consistent with his eventual admission of a visit \"over an hour\" long, and starkly inconsistent with his initial denial. This data was requestable from the earliest days of the 2023 investigation and was never pulled.",
  },
  {
    id: "haddad-record-summary",
    category: "documentary",
    label: "Request historical record summary — Khalid Haddad (PNC/NRM)",
    shortLabel: "Haddad's PNC/NRM record",
    description: "Requesting a named suspect's own history is standard practice, not cross-agency friction.",
    cost: 1,
    prerequisiteActionIds: ["reint-haddad"],
    outcome: "A 2018 arrest during a county lines operation ends in no conviction: a duty solicitor flagged exploitation given his age, immigration history, and clean record, and an NRM referral followed before charge. The Home Office's own Single Competent Authority returned a positive finding both ways — Haddad is a formally recognised victim of criminal exploitation, not a drugs-adjacent suspect who won't cooperate. It was sitting in the system the whole time; nobody thought to pull it.",
  },
  {
    id: "riverbank-liaison-swayne",
    category: "documentary",
    label: "Request Operation Riverbank liaison — Colin Swayne",
    shortLabel: "the Operation Riverbank liaison",
    description: "A cross-agency request into a genuine institutional friction — Swayne is already a named suspect.",
    cost: 2,
    outcome: "A separate county lines taskforce interview, run by a different unit entirely and genuinely not about any murder, reveals that Kato and Reece approached Geoff Mason first, in 2019, trying to cuckoo his house before Swayne's — Mason refused, and they moved on. Swayne himself never makes the connection to Mason's death, and the information never reaches whoever's working Porterhouse: different unit, different reporting line.",
  },
  {
    id: "anpr-burgess-vehicle-history",
    category: "forensic",
    label: "Request ANPR history for Patricia Burgess's vehicle, wider date range",
    shortLabel: "Burgess's vehicle ANPR history",
    description: "Genuinely additive to the traffic-camera evidence, not a duplicate — a national, queryable network once the plate is known.",
    cost: 2,
    prerequisiteActionIds: ["vehicle-reg-lookup"],
    outcome: "The vehicle is picked up on the Hollen Marsh approach roads at 9:11pm and 9:54pm on 8 October 2019 — independently corroborating the traffic camera sighting via a second, separate camera network. No ANPR hits at all near Wooley's address on 6 January 2022, or near the marsh or Boresfield on 22 May 2025 — a negative result consistent with his established methods for those two killings (walking, and bus).",
  },
  {
    id: "anpr-sweep-hollen-marsh-2019",
    category: "forensic",
    label: "Request full ANPR sweep — Hollen Marsh access roads, 8 October 2019, 21:00–22:00",
    shortLabel: "the 2019 Hollen Marsh ANPR sweep",
    description: "An unfiltered sweep of every vehicle through camera coverage in the window, not a targeted request.",
    cost: 3,
    outcome: "Four vehicles pass through in the window. One is the dark 4x4 registered to Patricia Burgess. The other three are eliminated individually: a taxi confirmed en route to an unrelated fare, a resident's car returning home, and a delivery van on a scheduled round — noise that would all need running down before anyone could be confident the fourth was the one that mattered.",
  },
  {
    id: "anpr-haddad-marsh-road",
    category: "forensic",
    label: "Request ANPR check — Khalid Haddad's vehicle, Marsh Road, 6 January 2022",
    shortLabel: "Haddad's Marsh Road ANPR check",
    description: "A second, independent institutional source, once he's already a person of interest via Porterhouse.",
    cost: 1,
    prerequisiteActionIds: ["reint-haddad"],
    outcome: "The vehicle is picked up at the northern end of Marsh Road at 18:04, and again heading back onto Chertsey Street at 18:16 — closely matching the timeline already established through his employer's app data and his own account. Doesn't tell a team anything new about where he was, but confirms it from a completely independent source.",
  },
  {
    id: "anpr-sweep-featherton-2022",
    category: "forensic",
    label: "Request full ANPR sweep — Featherton, 6 January 2022, 18:10–18:20",
    shortLabel: "the 2022 Featherton ANPR sweep",
    description: "An unfiltered sweep of every vehicle through camera coverage in the window, not a targeted request.",
    cost: 2,
    outcome: "Three vehicles pass through besides Haddad's own: a resident's car confirmed as a normal return home, a delivery van on a separate scheduled round, and one plate that returns no match on the DVLA database at all — inconclusive, and deliberately left unresolved. Consistent with, though it doesn't prove, a low-level operation that survives by being hard to trace through ordinary channels.",
  },
];

export function getActionItem(id: string): ActionItem | undefined {
  return ACTIONS.find((a) => a.id === id);
}
