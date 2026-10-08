// Static case content for the evidence board. Two sources feed this catalog:
// EX.01-19 are the baseline case-file material (victim bios, policy files,
// maps — free from day one or time-released), deepened from
// Reference/case-content/mechanics/hollenbourne-evidence-overview.md's
// Category 1/2. EX.20 onward are investigation findings — one per action in
// lib/actions-catalog.ts, per the recovered handover package's prototype
// (every costed action reveals a real, readable Case Log document, not just
// its own inline outcome paragraph). Where a genuine fuller source document
// exists for that action (most interviews, cell-site/ANPR reports, a few
// witness statements — see lib/action-evidence-bodies.ts), that's the body;
// otherwise it falls back to the action's own outcome text, which is all
// that's ever existed for it. Not stored in the database; team progress
// lives in actionLog (for action-unlocked items) and the module-wide
// current week (db/schema.ts, lib/module-settings.ts).
//
// SERVER-ONLY: never import this from a client component — it holds every exhibit's
// full text. Browser code reads the per-team view built in lib/team-view.ts.

import { ACTIONS, type ActionItem } from "./actions-catalog";
import type { EvidenceItem, EvidenceType, Suspect } from "./evidence-meta";

// Types, display constants and isEvidenceUnlocked live in evidence-meta.ts (browser-safe).
export * from "./evidence-meta";
import { ACTION_EVIDENCE_BODY } from "./action-evidence-bodies";

const BASELINE_EVIDENCE: EvidenceItem[] = [
  {
    id: "ex01",
    exhibit: "EX.01",
    type: "statistical",
    case: "general",
    group: "maps",
    title: "Boresfield incident stats, 2015–2025",
    snippet: "Recorded violent incidents by year, with a dip across 2020–21.",
  },
  {
    id: "ex03",
    exhibit: "EX.03",
    type: "interview",
    case: "wooley",
    group: "interviews",
    title: "Neighbour account, Wooley case",
    snippet: "Heavy-set man in a dark puffer jacket, seen entering and leaving the property.",
  },
  {
    id: "ex04",
    exhibit: "EX.04",
    type: "documentary",
    case: "general",
    group: "records",
    title: "Internal force memo",
    snippet: "Case prioritisation notes.",
    unlocksWeek: 8,
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
    case: "general",
    group: "records",
    title: "Ferris's opening memo",
    snippet: "DS Ferris sets out, informally, why she thinks four deaths across six years should be looked at together.",
    unlocksWeek: 9,
    body: [
      {
        heading: "Internal memorandum — 2 June 2025",
        paragraphs: [
          "To: Divisional Commander; Hollenbourne Case Review Panel. From: DS H. Ferris. Re: Possible connections between recent deaths — Mason (2019), Wooley (2022), Porterhouse (2023), Butt (2025).",
          "I've been asked to set out, informally and ahead of the panel's formal review, why I think these four deaths warrant being looked at together rather than as four separate matters.",
          "I want to be honest about where this comes from, and about what it might mean if I'm right. None of what follows is proof — most of it, taken alone, wouldn't justify reopening anything. But looking at these four together, I don't think it would be responsible of me to keep that to myself, even knowing how it might look, and even knowing that some of what I'm raising touches on decisions I was part of myself. I'd rather be the one who raised this too early and was wrong than the one who noticed something and said nothing.",
          "1. Method and location. Three of the four deaths — Mason, Wooley, and now Butt — involve blunt-force trauma, and all four have some connection to the Hollen Marsh area, either as the scene or the disposal site. That's a real pattern, whatever else turns out to be true.",
          "2. The Mason interview, 2019. I personally interviewed a tradesman who'd been at Geoff Mason's property on the day he died — I want to say a boiler or gas engineer, though I'd need the original file to confirm. Nothing came of it at the time; his account held up and there was no basis to take it further. But something about the interview sat wrong with me in a way I couldn't articulate then and still can't fully articulate now. I'd recommend that file is pulled and looked at again with fresh eyes, mine included.",
          "3. Nigel Wooley. Given his conviction for stalking Susan and the clear pattern of controlling behaviour that preceded it, I think it's reasonable to ask whether that capacity extends further than we've previously assumed. I'm not presenting this as a conclusion — only that a man capable of that level of fixation toward one woman is worth a closer look in relation to the others, particularly Butt.",
          "4. The marshland and county lines. Given how well-documented the marsh's use is as a route for local county lines activity, I think it's worth asking whether Mason had some exposure to that world we never uncovered in 2019 — used unwittingly, threatened, or otherwise drawn in. It would explain a death that otherwise never fit a domestic or opportunistic profile.",
          "5. Porterhouse. I'd urge the panel not to assume that solving one case solves all four. Porterhouse's death sits differently to the others — his known history, his associates, the manner of it — and I think there's a real risk that public pressure to find one explanation for everything pushes us to fold his case into a pattern it doesn't actually belong to.",
          "I'll make myself available to the panel at any point if useful. — DS Hannah Ferris, Hollenbourne Police",
        ],
      },
    ],
  },
  {
    id: "ex08",
    exhibit: "EX.08",
    type: "documentary",
    case: "mason",
    group: "records",
    title: "Victim biography — Geoff Mason",
    snippet: "Widower, retired Critchley cement-plant worker, walked the marsh daily since his wife's death.",
    unlocksWeek: 3,
    body: [
      {
        paragraphs: [
          "Born working-class in Deptford, lived through the Blitz. Moved to Hollenbourne in 1954 for work at the new Critchley cement plant; met his wife Doreen that same year, married 1957. Lived first in the Howill tower on the Critchley estate, then bought in Boresfield once Doreen was expecting their first child (1958) — three children raised there.",
          "Geoff never liked the marsh himself; Doreen did. Worked at Critchley for the plant's last 28 years before its 1982 closure, which he felt as a real, ongoing grief. Retired at 60 after a spell as a gardener.",
          "Doreen was diagnosed with dementia in 2014, died 2017 — after which Geoff took up walking the marsh himself, specifically because it made him feel closer to her. That walking habit is what puts him there regularly enough for Burgess's account of him to be credible, and is the emotional reason he's on the marsh at all in the years before his death.",
        ],
      },
    ],
  },
  {
    id: "ex09",
    exhibit: "EX.09",
    type: "documentary",
    case: "wooley",
    group: "records",
    title: "Victim biography — Susan Wooley",
    snippet: "Teaching assistant, church and food-bank volunteer, moved to Hollenbourne alone after her first marriage ended — well-regarded by neighbours and former students alike.",
    unlocksWeek: 3,
    body: [
      {
        paragraphs: [
          "Grew up in Tottenham, a bright, ambitious child of a Caribbean family. Studied Chemistry at Reading (from 1982), trained as a teacher, taught in northeast London secondary schools — well-regarded, former students speak warmly of her.",
          "First marriage to Daniel Williams (a hardware shop owner), 1991, Walthamstow; separated 2010. Moved to Hollenbourne alone afterward, bought her own house, took the teaching assistant post at St Martin's primary school, got involved in church and food-bank volunteering.",
          "Met Nigel in 2012 through this new Hollenbourne life, not before it.",
        ],
      },
    ],
  },
  {
    id: "ex10",
    exhibit: "EX.10",
    type: "documentary",
    case: "porterhouse",
    group: "records",
    title: "Victim biography — Carl Porterhouse",
    snippet: "Known at the Robin Hood pub; a back injury ended his manual work; financially precarious in his final years.",
    unlocksWeek: 3,
    body: [
      {
        paragraphs: [
          "Known to drink at the Robin Hood pub, well-liked there despite his record; a back injury from labouring work ended his ability to do manual work and contributed to his declining health in the years before his death; borrowed money periodically to keep his utilities running, consistent with his established financial precarity.",
          "No fuller biography exists on file.",
        ],
      },
    ],
  },
  {
    id: "ex11",
    exhibit: "EX.11",
    type: "documentary",
    case: "butt",
    group: "records",
    title: "Victim biography — Sara Butt",
    snippet: "British-Pakistani, lifelong Hollenbourne resident, dental student working part-time to help support her parents — the only one of the four who never lived anywhere else.",
    unlocksWeek: 3,
    body: [
      {
        paragraphs: [
          "British-Pakistani family, lived in Hollenbourne her entire life — the only one of the four victims who is a genuine lifelong local rather than someone who arrived as an adult. Attended Hollenbourne Comprehensive to 18, excelled in sciences, went on to study dentistry at Queen Mary University of London.",
          "Moved to part-time study from 2020 once her parents' health began to decline, taking a job at a hair salon in the Piazza to help support the family alongside caring for them directly. Well-liked, described by friends as the one who held the friend group together.",
          "Killed returning from a day out with friends in Stratford. Relatively little is confirmed about her compared to Mason or Wooley, given how recently this happened — this remains an active, ongoing case, not yet a settled retrospective.",
        ],
      },
    ],
  },
  {
    id: "ex12",
    exhibit: "EX.12",
    type: "documentary",
    case: "butt",
    group: "records",
    title: "Sara Butt — missing person report",
    snippet: "Filed high-risk from the outset: her last message home was \"back in 10.\" She never arrived.",
    unlocksWeek: 9,
    body: [
      {
        heading: "Missing Person Report and Risk Assessment — 23 May 2025, 08:15",
        paragraphs: [
          "Report taken by: PC R. Ahmed. Reported by: Sara Butt's parents, next of kin.",
          "Circumstances: Sara was returning home from seeing friends, a journey made many times before without incident. Her last contact was a WhatsApp message to her parents at 10:49pm reading \"back in 10\" — sent as she got off the bus, consistent with her usual estimate for the walk home. She did not arrive. Her parents raised the alarm the following morning.",
          "Risk assessment: HIGH. No history of going missing previously; a reliable pattern of contact; last contact indicated imminent return; no known relationship difficulties, financial pressures or mental health concerns disclosed; phone subsequently unreachable, consistent with the device being off, damaged or out of signal.",
          "Immediate actions authorised: Family Liaison Officer assigned same day; search of the last-known route, focusing initially on the vicinity of the bus stop; media appeal authorised at force level; phone data request submitted.",
        ],
      },
    ],
  },
  {
    id: "ex13",
    exhibit: "EX.13",
    type: "visual",
    case: "general",
    group: "maps",
    title: "Hollenbourne town map",
    snippet: "The marsh, the estates, and the routes between them, laid out end to end.",
    image: "/case-images/hollenbourne-town-map.png",
    body: [
      {
        paragraphs: [
          "Hollenbourne sits on the Thames, near Thurrock/Grays in South Essex. The A13 runs east–west through the north of the town. Critchley, north-west, is the old cement-works estate — post-war tenement towers, older and more deprived. North-Hollenbourne, north, is Victorian terraces of medium income; its central road, Clements Road, connects to Hollen Marsh's northern entrance, and Paget Street is a residential street here. Featherton, north-east, is the newer, more aspirational estate, its commercial centre known as \"the Piazza.\" The high street and railway station sit centrally. Boresfield, south, is older and more deprived, bordering Hollen Marsh directly — the marsh has two entrances, northern (via North-Hollenbourne/behind Featherton) and southern (the main entrance, via Boresfield, where the car park and the bus stop sit).",
        ],
      },
    ],
  },
  {
    id: "ex14",
    exhibit: "EX.14",
    type: "visual",
    case: "general",
    group: "maps",
    title: "Boresfield street map",
    snippet: "Every named house on the estate marked against the streets that connect them.",
    image: "/case-images/boresfield-street-map.png",
    body: [
      {
        paragraphs: [
          "On the Boresfield estate itself: Chertsey Street runs in from the high street. Harrison Road — Susan Wooley's house; the Londis sits on its corner. Bamford Street — Carl Porterhouse's house; the Robin Hood pub sits on its corner. Folkestone Road — Holly Creagan, the Butt family, and Geoff Mason (southernmost, backing onto the marsh). Blenheim Street and Carpenter Street are cross streets. Marsh Road runs past Colin Swayne's flat down to the car park and the southern marsh entrance.",
        ],
      },
    ],
  },
  {
    id: "ex15",
    exhibit: "EX.15",
    type: "statistical",
    case: "general",
    group: "maps",
    title: "Hollenbourne homicide rate, 2018–2025",
    snippet: "Twenty-four murders in eight years, unevenly spread.",
    body: [
      {
        paragraphs: [
          "Hollenbourne has been the site of 24 murders since 2018, an average rate of roughly 3 murders a year. 2022 was a higher-than-average year, with 5 murders recorded — including the death of Susan Wooley.",
          "None of the four deaths under review stood out as exceptional in its own year against this backdrop, which is part of why no connection between them was drawn at the time.",
        ],
      },
    ],
  },
  {
    id: "ex16",
    exhibit: "EX.16",
    type: "documentary",
    case: "mason",
    group: "records",
    title: "Policy file & canvass summary — Geoff Mason",
    snippet: "SIO policy file, family liaison log and house-to-house canvass summary for the Geoff Mason investigation, October 2019.",
    unlocksWeek: 9,
    body: [
      {
        heading: "SIO policy file — SIO: DCI A. Prentice",
        paragraphs: [
          "Decision 1 — 8 October 2019, 21:40. Death to be treated as suspicious pending post-mortem findings. Fast-track actions authorised: scene preservation, immediate house-to-house, next of kin traced, post-mortem arranged.",
          "Decision 2 — 9 October 2019. Family Liaison Officer (DC R. Ahmed) assigned to next of kin — two adult children, both outside the Hollenbourne area.",
          "Decision 3 — 10 October 2019. Forensic strategy: full scene examination and post-mortem as standard; trace evidence recovery expected to be limited given outdoor exposure.",
          "Decision 4 — 11 October 2019. CCTV canvass limited to premises and private cameras in the immediate vicinity of the discovery site. Wider traffic-camera canvass not authorised — no specific information currently indicates vehicle involvement.",
          "Decision 5 — 14 October 2019. Trade/tradesperson canvass authorised for premises with recent callouts in the area, alongside standard house-to-house.",
          "Decision 6 — 28 October 2019. Fast-track actions complete, no substantive new lines of enquiry. Resourcing scaled back to a core team. Case remains open.",
          "Disclosure note: material gathered but not forming part of any active line of enquiry — including trace fibre evidence recovered at post-mortem, noted as insufficient for origin determination — is retained as unused material.",
        ],
      },
      {
        heading: "Family liaison log — FLO: DC R. Ahmed | Next of kin: two adult children",
        paragraphs: [
          "Mr Mason lived alone since his wife Doreen's death in 2017 — increasingly solitary but not unhappy, a routine centred on his garden and daily marsh walks. Neither child aware of any concerns, threats or disputes. No known financial difficulties. Neither able to account for his exact movements on 8 October — contact was by phone only, roughly weekly. Both confirm a boiler service was expected around that time but weren't aware of the specific date or engineer.",
        ],
      },
      {
        heading: "House-to-house canvass — immediate vicinity of Mr Mason's address and the discovery site",
        paragraphs: [
          "Of 14 addresses canvassed, 9 residents made contact. Several neighbours confirm Mr Mason as a familiar, well-liked local figure. One neighbour (No. 14) recalls seeing \"a work van, one of the gas company ones\" outside sometime that week — unable to confirm the exact day or time; not treated as significant given the boiler service was already known and expected. One neighbour (No. 9) reports seeing Mr Mason on the marsh path \"most evenings, like clockwork.\" No unfamiliar persons, vehicles or disturbances reported.",
        ],
      },
    ],
  },
  {
    id: "ex17",
    exhibit: "EX.17",
    type: "documentary",
    case: "wooley",
    group: "records",
    suspect: "nigel",
    title: "Policy file & canvass summary — Susan Wooley",
    snippet: "SIO policy file, family liaison log and house-to-house canvass summary for the Susan Wooley investigation, January 2022.",
    unlocksWeek: 9,
    body: [
      {
        heading: "SIO policy file — SIO: DCI S. Whitmore",
        paragraphs: [
          "Decision 1 — 6 January 2022, 19:15. Death treated as suspicious from the outset — visible trauma, no forced entry. Fast-track actions authorised.",
          "Decision 2 — 6 January 2022, 20:00. Nigel Wooley (ex-husband) identified as a person of interest with immediate priority — prior stalking conviction, restraining order, at least one previous breach.",
          "Decision 3 — 6 January 2022, 21:30. Family liaison to the deceased's sister rather than Mr Wooley, given his status as a person of interest.",
          "Decision 4 — 7 January 2022. Nigel Wooley arrested and interviewed. DNA recovered; speculative database search against unidentified profiles authorised.",
          "Decision 5 — 10 January 2022. House-to-house of the immediate street to continue at standard level; tradesperson canvass at single-officer, doorstep level only, no follow-up scheduled unless new information arises.",
          "Decision 6 — 24 January 2022. Mr Wooley released on bail pending further enquiries. Investigation to continue with Mr Wooley as the central active line of enquiry.",
          "Disclosure note: material gathered in the tradesperson canvass — including the attendance record of M. Burgess, gas engineer, at the neighbouring property — is retained as unused material.",
        ],
      },
      {
        heading: "Family liaison log — FLO: DC J. Okafor | Next of kin: sister (D. Marsh, née Edwards)",
        paragraphs: [
          "Ms Marsh describes her sister as \"the kindest person I knew\" — active in church and food-bank work, no known disputes. Unambiguous in her own view: believes Nigel Wooley is responsible, citing his history, the restraining order, and his inability to accept the relationship had ended — she says she warned Susan \"more than once.\" Confirms Susan had recently begun seeing someone new, though doesn't know who or how serious — only that Susan mentioned it, \"excited, like herself again.\"",
        ],
      },
      {
        heading: "House-to-house canvass — Harrison Road and immediate vicinity",
        paragraphs: [
          "Of 11 addresses canvassed, 8 residents made contact. Neighbours consistently describe Susan as well-liked and quiet. Two neighbours independently mention Nigel by name, unprompted, describing him as \"on edge\" after the separation — neither reports seeing him on the day itself. One neighbour (No. 12) recalls a van parked outside a nearby address sometime that week — assumed work being done; couldn't say which house or day with confidence. No neighbour reports anything unusual on 6 January specifically.",
        ],
      },
    ],
  },
  {
    id: "ex18",
    exhibit: "EX.18",
    type: "documentary",
    case: "porterhouse",
    group: "records",
    suspect: "swayne",
    title: "Policy file & canvass summary — Carl Porterhouse",
    snippet: "SIO policy file, family liaison log and house-to-house canvass summary for the Carl Porterhouse investigation, June 2023.",
    unlocksWeek: 9,
    body: [
      {
        heading: "SIO policy file — SIO: DCI M. Doyle",
        paragraphs: [
          "Decision 1 — 1 June 2023, 14:20. Death treated as suspicious from the outset, following a welfare check prompted by neighbour concern.",
          "Decision 2 — 1 June 2023, 16:00. Given the deceased's known history and the area's county lines activity, initial focus on the local drug trade as the most likely explanatory frame.",
          "Decision 3 — 1 June 2023, 17:30. Next of kin traced — one sibling, long estranged. Limited ongoing FLO engagement anticipated.",
          "Decision 4 — 2 June 2023. Request submitted to the regional organised crime unit for intelligence on county lines operations active in Boresfield.",
          "Decision 5 — 2–3 June 2023. Colin Swayne (known associate, placed in the vicinity by witness account and forensic trace) and Khalid Haddad (delivery driver, phone/bike data placing him in the area) both arrested and interviewed.",
          "Decision 6 — 22 June 2023. Both released — Swayne on bail, Haddad without charge. No substantive response yet to the Decision 4 intelligence request. Investigation continues at reduced resourcing.",
          "Disclosure note: no material currently held as unused beyond routine documentation.",
        ],
      },
      {
        heading: "Family liaison log — FLO: DC P. Adeyemi | Next of kin: brother (D. Porterhouse)",
        paragraphs: [
          "Contact made with Mr Porterhouse's brother, traced after several years of no contact. Confirms the estrangement, declines to discuss its cause — \"we went different ways a long time ago.\" Attends formal identification; declines further liaison beyond what's legally necessary.",
          "Contact concluded at family's request. None anticipated given the estrangement.",
        ],
      },
      {
        heading: "House-to-house canvass — immediate vicinity of Bamford Street",
        paragraphs: [
          "Of 9 addresses canvassed, 6 residents made contact. Two independently report hearing shouting and banging from the direction of Mr Porterhouse's address the evening of 29 May — one states a call was made to police at the time, \"nobody come, though.\" No record of attendance found. One resident recalls a man matching Colin Swayne's description walking toward Bamford Street at approximately 8:30pm — consistent with, and already incorporated into, his interview timeline. General view of Mr Porterhouse is mixed; no resident reports a specific dispute or threat.",
        ],
      },
    ],
  },
  {
    id: "ex19",
    exhibit: "EX.19",
    type: "documentary",
    case: "butt",
    group: "records",
    title: "Policy file & canvass summary — Sara Butt",
    snippet: "SIO policy file, family liaison log and house-to-house canvass summary for the Sara Butt investigation, May–June 2025.",
    unlocksWeek: 9,
    body: [
      {
        heading: "SIO policy file — SIO: Det. Supt. R. Callahan",
        paragraphs: [
          "Decision 1 — 22 May 2025, 23:40. Missing person report treated as high risk from the outset. Fast-track actions authorised: search coordination, press appeal, FLO assigned to parents same night.",
          "Decision 2 — 23 May 2025. Given anticipated public interest, media strategy coordinated at force level; national appeal authorised.",
          "Decision 3 — ~30 May 2025. Body found. Case escalated to Major Incident Team status. Det. Supt. Callahan appointed SIO; team assembled, including DS H. Ferris.",
          "Decision 4 — 31 May 2025. Initial post-mortem findings indicate blunt force trauma consistent with visible injury. Cause of death treated as such pending further findings.",
          "Decision 5 — 1 June 2025. CCTV and witness canvass to focus on the immediate vicinity of the known route home and the discovery site. Wider canvass of approach routes (bus services, town centre, routes from Featherton or Critchley) not prioritised at this time — no evidence currently indicates the individual responsible travelled in from elsewhere.",
          "Decision 6 — 10 June 2025. Given the case's public profile, a senior pathologist assigned to conduct a fuller review.",
          "Case remains an active Major Incident investigation at full resourcing.",
        ],
      },
      {
        heading: "Family liaison log — FLO: DC N. Osei | Next of kin: parents",
        paragraphs: [
          "Continuous contact since 22 May. Both parents describe Sara as devoted to her studies and to caring for them, well-liked, close with a stable friend group. Confirm she took the bus home from Stratford most weekends without incident. Neither aware of any dispute, concern or unfamiliar person in her life.",
        ],
      },
      {
        heading: "House-to-house canvass — known route home, vicinity of the bus stop and Hollen Marsh",
        paragraphs: [
          "Of 16 addresses canvassed, 12 residents made contact; an additional press/social media appeal was made. No resident reports witnessing the incident or any disturbance. Several confirm Sara as a familiar, well-liked local figure. No unfamiliar person or vehicle reported in the immediate vicinity of the bus stop or marsh. No information received regarding movements further afield — consistent with the canvass scope set in Decision 5.",
        ],
      },
    ],
  },
];

// Per-action tagging for the investigation-findings exhibits below (EX.20+)
// — case and suspect assigned by content, matching the same judgment calls
// used for EX.01-19 (a suspect is only tagged when the finding is
// substantively about them, e.g. a search of their property or a named
// registered keeper — never inferred from circumstantial description alone,
// per the earlier no-spoiler principle for EX.03's unidentified "heavy-set
// man"). `evidenceType` maps each action's category onto the four exhibit
// types (no separate "forensic" exhibit type exists — forensic findings are
// filed as "documentary", matching how nothing in EX.01-19 uses a
// forensic-specific type either).
const ACTION_EVIDENCE_META: Record<string, { suspect?: Suspect; type: EvidenceType; image?: string; imageCaption?: string }> = {
  "pull-interview-burgess-mason": { suspect: "burgess", type: "interview" },
  "pull-interview-wooley": {
    suspect: "nigel",
    type: "interview",
    image: "/case-images/cctv-hollen-marsh-footpath-2022.jpg",
    imageCaption: "CAM 2 — Hollen Marsh Footpath, 6 January 2022, 21:47:03: a man walking a dog. This is the footage put to Nigel Wooley in the interview below.",
  },
  "pull-interview-haddad": { suspect: "haddad", type: "interview" },
  "pull-interview-swayne": { suspect: "swayne", type: "interview" },
  "forensic-report-mason": { type: "documentary" },
  "forensic-report-wooley": { type: "documentary" },
  "forensic-report-porterhouse": { suspect: "swayne", type: "documentary" },
  "forensic-report-butt-initial": { type: "documentary" },
  "forensic-report-butt-followup": { type: "documentary" },
  "reint-wooley": { suspect: "nigel", type: "interview" },
  "reint-swayne": { suspect: "swayne", type: "interview" },
  "reint-haddad": { suspect: "haddad", type: "interview" },
  "forensic-dna": { type: "documentary" },
  "doc-memo": { type: "documentary" },
  canvas: { type: "interview" },
  "homeowner-witness-wooley": { suspect: "burgess", type: "interview" },
  "reint-nigel-butt-evening": { suspect: "nigel", type: "interview" },
  "holly-creagan-statement": { suspect: "swayne", type: "interview" },
  "phone-data-butt": { type: "documentary" },
  "traffic-cam-hollen-marsh": {
    type: "visual",
    image: "/case-images/traffic-cam-marsh-car-park-2019.jpg",
    imageCaption: "CAM 3 — Marsh Car Park Access, 8 October 2019: a dark 4x4 entering at 21:14:03 and leaving at 21:52:17.",
  },
  "canvass-doorbell-mason": {
    type: "visual",
    image: "/case-images/ring-doorbell-mason-2019.jpg",
    imageCaption: "Doorbell camera, residential street near the Hollen Marsh car park, 8 October 2019, 21:47:03: a heavy-set man on foot, carrying something bulky.",
  },
  "vehicle-reg-lookup": { suspect: "burgess", type: "documentary" },
  "toolmark-review-mason-wooley": { type: "documentary" },
  "property-search-burgess": { suspect: "burgess", type: "documentary" },
  "property-search-wooley": { suspect: "nigel", type: "documentary" },
  "property-search-swayne": { suspect: "swayne", type: "documentary" },
  "interim-interview-burgess": { suspect: "burgess", type: "interview" },
  "bus-cctv-butt": {
    type: "visual",
    image: "/case-images/butt-bus-interior-2025.jpg",
    imageCaption: "Bus 102, rear interior, 22 May 2025, 20:52:16.",
  },
  "highstreet-cctv-butt": {
    type: "visual",
    image: "/case-images/butt-high-street-2025.jpg",
    imageCaption: "Hollenbourne High Street, Cam 04, 22 May 2025, 21:38:27.",
  },
  "doorbell-paget-street-butt": {
    type: "visual",
    image: "/case-images/butt-paget-street-2025.jpg",
    imageCaption: "Paget Street, front-door camera, 22 May 2025, 21:45:03.",
  },
  "londis-cctv-butt": {
    type: "visual",
    image: "/case-images/londis-entrance-butt-2025.jpg",
    imageCaption: "Londis Boresfield — Entrance CAM 1, 22 May 2025, 23:23:17.",
  },
  "ring-cam-pleasance-street-butt": {
    type: "visual",
    image: "/case-images/ring-cam-pleasance-street-2025.jpg",
    imageCaption: "Pleasance Street, front-door camera, 22 May 2025, 21:52:08.",
  },
  "endgame-arrest-burgess-butt": { suspect: "burgess", type: "interview" },
  "haddad-wooley-crossref": { suspect: "haddad", type: "documentary" },
  "haddad-wooley-further-interview": { suspect: "haddad", type: "interview" },
  "cellsite-burgess-wooley": { suspect: "burgess", type: "documentary", image: "/case-images/cellsite-burgess-wooley.png" },
  "cellsite-burgess-mason": { suspect: "burgess", type: "documentary", image: "/case-images/cellsite-burgess-mason.png" },
  "cellsite-burgess-butt": { suspect: "burgess", type: "documentary", image: "/case-images/cellsite-burgess-butt.png" },
  "cellsite-nigel-butt": { suspect: "nigel", type: "documentary", image: "/case-images/cellsite-nigel-butt.png" },
  "cellsite-swayne-porterhouse": { suspect: "swayne", type: "documentary", image: "/case-images/cellsite-swayne-porterhouse.png" },
  "haddad-record-summary": { suspect: "haddad", type: "documentary" },
  "riverbank-liaison-swayne": { suspect: "swayne", type: "documentary" },
  "anpr-burgess-vehicle-history": { suspect: "burgess", type: "documentary" },
  "anpr-sweep-hollen-marsh-2019": { suspect: "burgess", type: "documentary" },
  "anpr-haddad-marsh-road": { suspect: "haddad", type: "documentary" },
  "anpr-sweep-featherton-2022": { suspect: "haddad", type: "documentary" },
};

// Exhibit numbers that belonged to actions since retired. Never reused, so the
// numbers students and staff already know stay put. EX.33 was "Pull phone data".
const RETIRED_EXHIBIT_NUMBERS = [33];

/** One exhibit per action, reusing its own outcome text — see the module comment above. */
function buildActionEvidence(): EvidenceItem[] {
  let exhibitNumber = 20;
  return ACTIONS.map((action: ActionItem) => {
    // Exhibit numbers are handed out in catalog order, skipping any that belong
    // to a retired action — so retiring one never renumbers the rest.
    while (RETIRED_EXHIBIT_NUMBERS.includes(exhibitNumber)) exhibitNumber++;
    const meta = ACTION_EVIDENCE_META[action.id];
    if (!meta) throw new Error(`No evidence tagging for action "${action.id}" — add it to ACTION_EVIDENCE_META.`);
    return {
      id: `ev-${action.id}`,
      exhibit: `EX.${exhibitNumber++}`,
      type: meta.type,
      case: action.case,
      group: action.group,
      suspect: meta.suspect,
      title: action.label,
      snippet: action.description,
      unlockedByActionId: action.id,
      image: meta.image,
      imageCaption: meta.imageCaption,
      // A handful of actions (mostly interviews, cell-site/ANPR reports, and
      // a few witness statements) have a genuine fuller source document —
      // see lib/action-evidence-bodies.ts. Everything else falls back to
      // the action's own outcome text, which is all that's ever existed for it.
      body: ACTION_EVIDENCE_BODY[action.id] ?? [{ paragraphs: [action.outcome] }],
    };
  });
}

export const EVIDENCE: EvidenceItem[] = [...BASELINE_EVIDENCE, ...buildActionEvidence()];

export function getEvidenceItem(id: string): EvidenceItem | undefined {
  return EVIDENCE.find((e) => e.id === id);
}
