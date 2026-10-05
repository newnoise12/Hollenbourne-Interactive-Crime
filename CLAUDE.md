# Hollenbourne Case Review

Team case-review portal for *Becoming a Criminologist* (CRM_4_BCR), LSBU.
Students work in teams (~8-10 teams, ~40 students) investigating a fictional
murder case across a 12-week module, building "trust" through weekly
institutional-review activities that unlock bonus investigation actions.

**The module spec** — full case narrative, victims/suspects, and the
week-by-week topic/activity/skills table for all 12 weeks — is
`Reference/hollenbourne-activity-plan.md`. Treat that table as the
authoritative plan for what each week's trust activity should be about when
building future weeks (Week 2's ranking quiz is already built; Weeks 3-11
each have a described activity — e.g. Week 3 is referencing/"Cite Them
Right", Week 4 is a crime-data quiz, Week 5 a PACE quiz — none built yet).

**`Reference/case-content/`** is a much fuller case-design archive — case
bible, cell-site/ANPR reports, full interview transcripts, procedural
documents (policy files, FLO logs, canvass returns), quiz drafts for weeks
3/5/6/etc., and exhibit images. It was recovered from a second, disconnected
copy of this project that accumulated in OneDrive independently of this
repo's own git history (see "Repo location" below) — treat it as the
authoritative source for case detail and unbuilt-week content, in the same
way `hollenbourne-activity-plan.md` is authoritative for the week-by-week
topic table. In particular, `case-content/mechanics/hollenbourne-action-economy.md`
is the exact spec `lib/actions-catalog.ts` was built from (costs, gating,
outcome text) — check it before adding or changing any action, rather than
inventing new cost/gating decisions ad hoc.

## Commands

```
npm run dev              # start dev server (localhost:3000)
npm run build             # production build — run this before assuming anything works
npx tsc --noEmit           # typecheck the whole project
npx eslint .                # lint
npx drizzle-kit generate  # after changing db/schema.ts, generates SQL migration
npx drizzle-kit migrate   # applies migrations to the local dev.db
```

**`drizzle-kit generate` needs a real TTY the moment a schema change looks
like a rename** (dropping a column while adding others in the same table)
— it tries to interactively ask "did you rename X to Y?" and, with no TTY
available, fails outright rather than falling back to a default. Workaround:
split the change into two `generate`/`migrate` cycles — first a pure
addition (new columns alongside the old one), then a second pass that
drops the old column alone. Neither step alone is a rename candidate, so
neither prompts.

## Architecture

- **Next.js (App Router)** + TypeScript + Tailwind
- **Drizzle ORM**, SQLite locally (`better-sqlite3`) — deliberately not Prisma,
  see "Decisions worth knowing" below
- **Auth**: team-based, not per-student. One shared name+passcode login per
  team (bcrypt-hashed passcode), session via HTTP-only cookie, 30-day expiry.
- **Data model** (`db/schema.ts`): teams, sessions, weekly action-point state
  (resets each week — this is deliberate, matches the game's trust mechanic),
  a permanent action log (does NOT reset), evidence citations per team,
  students (named individuals within a team, no auth of their own — see
  below), quiz attempts (per student, not per team).

## Page structure

**`/dashboard` is a single-page tabbed app, not separate routes per
feature.** `app/dashboard/page.tsx` is the only server component — it fetches
everything every tab needs in parallel and hands it all to
`DashboardShell.tsx` (client), which renders the masthead, the tab bar,
and every tab's content in one page, toggling visibility with a plain
`hidden` attribute rather than mounting/unmounting — so switching tabs
never loses in-progress state (a half-answered quiz, an unsaved corkboard
drag) the way a route change would. The routes `/dashboard/case-log`,
`/dashboard/actions`, `/dashboard/quiz`, and `/dashboard/quiz/[quizId]` don't
exist; the actual feature components (`ActionEconomy.tsx`,
`EvidenceBoard.tsx`, `TrustQuiz.tsx`, `McqQuiz.tsx`, `MultiselectQuiz.tsx`,
`WhoAreYou.tsx`) still live at their same paths, stripped of their own
page-level chrome since `DashboardShell` supplies that once for every tab.

**As of the handover-package pass (see "Current week" and "Citation removed"
below), there are three tabs, not four**: **This Week** (`WeeklyOverviewTab.tsx`,
label "This Week") / **Investigation** / **Case Log**. There is no separate
Briefing or Quizzes tab any more — `BriefingTab.tsx` and `QuizzesTab.tsx` are
both deleted. `WeeklyOverviewTab.tsx` absorbed all of `QuizzesTab.tsx`'s
job (gates on `WhoAreYou` once, embeds whichever quiz matches the module's
current week, and lists every other week's quiz below for review/catch-up)
plus a Moodle-style summary of what's newly unlocked this week and the
team's overall progress, with buttons that switch tabs programmatically
(`DashboardShell` lifts its `tab` state and passes `setTab` down as
`onNavigate`, rather than each tab being a self-contained island).

## Current state (as of last session)

**Built and verified working end-to-end:**
- Team registration, login, logout, session handling — all API routes
  (`app/api/auth/*`) and pages (`app/login`, `app/dashboard`) tested both as
  unit tests and over real HTTP.
- The case log (evidence board, `app/dashboard/case-log/EvidenceBoard.tsx`)
  and weekly action economy (`app/dashboard/actions/ActionEconomy.tsx`) —
  both rendered as tabs in the unified `/dashboard` shell (see "Page
  structure" above), not standalone routes — ported from the earlier
  browser-local-storage prototypes (kept for reference in `Reference/`),
  now backed by the real database (`evidenceCitations`,
  `weekActionState`/`actionLog`). Citation validation lives in
  `lib/citation-validation.ts` and runs both client-side (live field
  feedback) and server-side (`lib/evidence.ts`, defense in depth).
- The Week 2 trustworthiness-ranking quiz (`app/dashboard/quiz/TrustQuiz.tsx`,
  rendered as a tab in `QuizzesTab.tsx` — see "Page structure" above), content
  from `Reference/week2-trustworthiness-quiz (1).md`, backed by
  `quizAttempts` — **attributed to individual students, not the team**.
  Evidence board and action economy stay team-shared (unchanged, one login
  per team); only the quiz needs to know who's answering, since the trust
  bonus is now the average of the team's members' scores, not one shared
  score. `app/dashboard/quiz/WhoAreYou.tsx` handles this: a lightweight
  dropdown-of-existing-names-or-add-a-new-one, no passwords, backed by
  `lib/students.ts`'s `students` table and a plain (non-auth)
  `STUDENT_COOKIE_NAME` cookie that's re-validated against the
  *currently-logged-in team* on every read — this is what makes it safe on
  a shared classroom computer (logging into a different team doesn't
  inherit the previous team's student identity; `app/api/auth/logout`
  also clears it directly).
  Up to `MAX_ATTEMPTS` (3, `lib/quiz-catalog.ts`) attempts **per student**
  — `lib/quiz.ts`'s `submitQuizAttempt` rejects a submission past that.
  Submitting shows an in-page confirmation panel first (not
  `window.confirm` — that gets silently suppressed by some
  automated/controlled browsers, confirmed during testing) naming which
  attempt this is and how many are left.
  **This quiz is the institutional-review activity**: a team's trust bonus
  for the quiz week is *derived live*, not stored — `lib/actions.ts`'s
  `resolveTrustBonus` computes it on every read as the rounded average of
  each contributing student's *best* score (`getTeamQuizAverage`,
  `lib/quiz.ts`), so nothing ever writes a stale value and the manual
  trust-bonus +/- control on the actions page is rejected server-side
  (`setTrustBonus` throws) for that week — confirmed end-to-end, including
  that the control disappears from the UI too. Every `quizAttempts` row
  also stores `teamIdAtAttempt` (the student's team *at submission time*,
  captured once, never updated) separately from the student's *current*
  team (`students.teamId`) — averages are grouped by `teamIdAtAttempt`, so
  an instructor moving a student to a different team later never changes a
  past week's average for either team. Confirmed end-to-end: moved a
  student mid-session and verified both teams' Week 2 averages were
  untouched.
- The instructor dashboard (`app/instructor`) — read-only cross-team view
  plus one write action (student reassignment), gated by a single shared
  passcode (`INSTRUCTOR_PASSCODE_HASH` env var, bcrypt-hashed, checked in
  `lib/instructor-auth.ts`) rather than per-team accounts, since there's no
  real "instructor" entity to attach a passcode to. Sessions use a separate
  table/cookie (`instructorSessions`, `INSTRUCTOR_SESSION_COOKIE_NAME`)
  from team sessions, so an instructor and a team can be logged in in the
  same browser without clobbering each other — confirmed. `/instructor`
  lists every team with a summary (exhibits cited, quiz average, actions
  taken) plus a Students section for moving a student between teams
  (`app/instructor/StudentsPanel.tsx` → `app/api/instructor/reassign-student`
  → `lib/students.ts`'s `reassignStudentTeam`, which touches only
  `students.teamId`, never `quizAttempts`); `/instructor/teams/[teamId]`
  shows full detail by reusing the same query functions the team-facing
  pages already use (`getCitationsForTeam`, `getAllWeekState`/
  `getActionLog`, `getTeamQuizAverage`/`getTeamQuizBreakdown`) — no
  parallel data layer. Otherwise read-only by design; no grading/override
  UI beyond the one reassignment control.
- **Prerequisite-gated and week-gated actions** (`lib/actions-catalog.ts`'s
  `ActionItem.prerequisiteActionIds` — an array, so an action can require
  *several* other actions at once, all of them — and `ActionItem.availableFromWeek`).
  Prerequisites are checked against the *permanent* `actionLog` with no week
  restriction of their own (done in any week, on any prior week's budget,
  stays done forever); `availableFromWeek` is a separate, independent check
  against the week the action is being taken in, for content that's
  time-gated regardless of points spent (the forensic pathology reports,
  available from Week 9; Sara Butt's follow-up report specifically from
  Week 10). Both enforced server-side in `takeAction`
  (`lib/actions.ts`, throws `ActionsError`) and mirrored client-side in
  `ActionEconomy.tsx`, which derives the locked/unlocked set live from the
  in-memory action log (so completing a prerequisite unlocks its follow-up
  immediately, no reload) and renders locked actions greyed-out with a
  "LOCKED" badge and a "requires: ..." line listing only the *still-unmet*
  prerequisites plus any week requirement — visible and readable, not
  hidden, since knowing a locked action exists is deliberately part of the
  puzzle. Confirmed end-to-end, including a five-way prerequisite (the
  endgame arrest interview) and a mixed prerequisite+week case (Butt's
  follow-up report), and that the "requires" line correctly drops
  prerequisites as they're completed one at a time rather than needing all
  of them satisfied before showing anything.
- **The full action-economy catalog**, built from
  `Reference/case-content/mechanics/hollenbourne-action-economy.md` — every
  chain that spec describes now exists in `lib/actions-catalog.ts`: initial-
  interview pulls gating every re-interview, forensic pathology reports for
  all four victims, the Mason movements chain, the tool-mark →
  three-way-property-search → interim-interview chain, the full Sara Butt
  movements chain (bus/high-street CCTV, Paget Street doorbell canvass),
  the five-prerequisite endgame arrest interview, the Haddad/Wooley
  cross-reference, cell-site/ANPR requests, and the two previously-flagged
  ungated documents (Holly Creagan's statement, Butt's phone data
  extraction). Three early placeholder actions the spec explicitly called
  stale were retired (a generic vehicle check and CCTV pull superseded by
  the properly-gated Mason movements chain, and a generic Burgess
  re-interview superseded by the interim interview). Sara Butt is now fully
  represented as the fourth victim.
- **The evidence board (case log) deepened to match the same spec's
  Category 1 baseline material** (`lib/evidence-catalog.ts`) — Ferris's
  opening memo, all four victim biographies (unlocking Week 3, ahead of the
  rest), a policy-file-and-canvass-summary exhibit per case (Week 9), Sara
  Butt's missing person report, the town and street maps, and the
  homicide-rate background, alongside the original six exhibits. Also fixed
  EX.01's metadata, which incorrectly attributed the crime report to "Kent
  Police, Maidstone" — left over from before the case's setting was
  relocated to Essex/Thurrock — to "Hollenbourne Police."
- **Weeks 4-6 trust activities** — Dark Figure of Crime (Week 4, 3 stages,
  real ONS chart images plus one illustrative Hollenbourne chart), PACE
  Quiz (Week 5, 6 questions), and a pair of argument-diagnosis multiselect
  quizzes (Week 6, "Diagnose the Argument" — council regeneration funding
  and force structure). Recovered fully-authored *and* fully-built from a
  third, previously-unknown copy of this project (a standalone artifact,
  published 2026-09-15, entirely disconnected from both this repo and
  `Reference/case-content/` — see "Repo location" below) and ported in.
  Unlike Week 2's bespoke ranking quiz, these share one generic path:
  `lib/quiz-catalog.ts`'s `QUIZ_DEFS` (mcq/multiselect quiz definitions,
  `scoreMcqQuiz`/`scoreMultiselectQuiz`) →
  `lib/quiz.ts`'s `submitGenericQuizAttempt`/`getGenericQuizAttempts` →
  `app/dashboard/quiz/[quizId]/McqQuiz.tsx` or `MultiselectQuiz.tsx`
  depending on the quiz's `kind`, rendered inside `QuizzesTab.tsx` (see
  "Page structure" above — this was a dynamic route before the single-page
  restructure; the folder name is now just where the component files live).
  `score`/
  `maxScore` are always stored on the same 0-3 trust-bonus scale as Week 2
  (not the raw question count), which is what lets `getTeamQuizAverage`
  keep working unchanged for these weeks purely by filtering on `week` —
  and why Week 6's two quizzes pool into one average, each student's best
  score across either one counting. `lib/actions.ts`'s trust-bonus
  resolution generalized from a single hardcoded `QUIZ_WEEK` check to
  `ALL_QUIZ_WEEKS` (ranking quiz week + every `QUIZ_DEFS` week), so the
  manual trust-bonus control now correctly disappears for all four weeks,
  not just Week 2; the instructor team-detail page generalized the same
  way, showing a per-week breakdown for every quiz week (Week 2 keeps its
  detailed rank-item table, the others show raw score/attempt summaries).
  Confirmed end-to-end in the browser: PACE (6/6 correct → trust bonus +3),
  and the regeneration argument quiz (3 correct + 1 wrong picked → net
  score 2/3, matching the net-correct-minus-wrong-picked formula), with the
  Week 6 pooling visible live on the actions page after just one of the two
  quizzes was attempted.
- **The per-student weekly action budget, fixed to match the spec.** The
  budget was a flat `BASELINE_ACTIONS = 2` per team regardless of size —
  contradicting `hollenbourne-action-economy.md`'s "1 action point per
  student, per week." Replaced with `lib/actions.ts`'s
  `getTeamBaselineActions(teamId)`, computed live from the `students` table
  (`Math.max(1, roster.length)` — floored so a team with nobody recorded
  yet, i.e. nobody's taken a quiz, isn't locked out entirely). This is a
  real gameplay-balance change, made deliberately rather than silently: an
  8-student team now gets 8 baseline points/week instead of 2. Threaded
  through `ActionEconomy.tsx`, the instructor team-detail page, and
  `takeAction`/`bankReservePoint`, replacing the removed
  `actions-catalog.ts` constant everywhere.
- **The corkboard evidence board and case-reserve banking**, recovered from
  a *third* disconnected location on top of the two already documented
  below: a nested, independently-developed Next.js app at
  `C:\Users\CrisW\dev\hollenbourne-app\app\` (its own git history, DB,
  migrations — an older branch that never got per-student quiz attribution
  or the instructor dashboard, but built two things the main lineage never
  did). Adapted rather than copied wholesale, since that branch's evidence
  model (`suspect`/`case`/`iconType`) doesn't match this repo's citation-
  based `EvidenceItem` catalog:
  - **Corkboard** (`app/dashboard/case-log/Corkboard.tsx`, using
    `@xyflow/react`) — a pannable/zoomable board where a team pins exhibits
    from the case log, drags them into position, and drags between two
    pinned cards to record a labelled relationship. New tables
    `evidencePins`/`evidenceConnections` (`db/schema.ts`), team-scoped, a
    pin referencing an exhibit id rather than copying its content. Pinning
    is gated on having already **cited** that exhibit (`lib/board.ts`'s
    `pinEvidence`) — the corkboard is for connecting evidence a team has
    already engaged with through the citation exercise, not a shortcut
    around it. The source project's `window.prompt`/`window.confirm` for
    labelling/removing a connection were replaced with in-page panels
    before porting — those are known to get silently suppressed in some
    automated/controlled browsers (the same reason `TrustQuiz.tsx` and the
    take-action/banking flows below use in-page confirmation already).
  - **Case reserve banking** (`teams.reservePoints`, `lib/actions.ts`'s
    `canBank`/`bankReservePoint`) — converts 2 unspent weekly points into 1
    permanent, team-wide reserve point once a team has earned a trust bonus
    that week. `takeAction` gained a `useReserve` flag so any action can be
    paid from the reserve instead of the weekly budget (`/api/actions/take`
    body: `{..., useReserve: true}`) — spending it shows an in-page "do you
    have your team's agreement?" confirmation on the actions page
    (`ActionEconomy.tsx`'s `pendingReserveAction`), per the reserve's own
    spec framing. Confirmed end-to-end: banked 2 of 4 weekly points into 1
    reserve point, then spent that reserve point on an action with 0
    weekly points remaining and confirmed the weekly `actionsSpent` count
    was untouched by the reserve payment.
- **Weeks 7 and 8 quizzes** (CPS Quiz, Reoffending and Sentencing Quiz) —
  same generic mcq path as weeks 4/5, ported from fully-written content in
  `Reference/case-content/quizzes/hollenbourne-cps-quiz.md` and
  `hollenbourne-prisons-quiz.md`. Week 8 needed one small architecture
  addition: `McqQuestion` gained an optional `context` field (a passage
  shown immediately before one specific question, not the whole stage) —
  for the selection-effects reveal in Part 1 and the source text in Part 3
  — rendered in both the answering and result views of `McqQuiz.tsx`.
  These were found via a **full audit of every file** in
  `Reference/case-content/` (prompted by the user explicitly asking for
  one) rather than only the files a specific feature happened to need —
  worth repeating that audit before declaring any week's content "not
  recovered," since three separate rounds of building from this archive so
  far each turned up more than the previous round checked for.
- **Fixed: the corkboard's two deviations from its own design brief**
  (`Reference/case-content/hollenbourne-evidence-board-design.md`). (1)
  **Colour-by-suspect**: `EvidenceItem` gained `case` (`CaseName` —
  mason/wooley/porterhouse/butt/general) and optional `suspect` fields;
  `lib/evidence-catalog.ts`'s `SUSPECT_META`/`getEvidenceColor` reuse hexes
  already established elsewhere in the app (witness-indigo for Nigel,
  reserve-gold for Swayne, visual-teal for Haddad, the existing
  inadmissible-red for Burgess) rather than a second palette. Of the 19
  existing exhibits, only two are genuinely suspect-specific and got tagged
  — EX.17 (Wooley policy file, `suspect: "nigel"` — the tunnel-vision
  thread) and EX.18 (Porterhouse policy file, `suspect: "swayne"` — the
  convenient-suspect thread); everything else stays neutral grey
  deliberately, since the brief itself allows that for non-suspect-specific
  material and the other 17 items are victim/force-wide documents, not
  suspect interviews. **Deliberately did not** invent a `suspect` tag for
  items that only circumstantially implicate Burgess without naming him
  (e.g. EX.03's "heavy-set man in a dark puffer jacket") — colouring those
  Burgess-red would hand students the answer via the UI, against the
  game's own no-spoiler design principle. (2) **Filing cabinet**:
  `EvidenceBoard.tsx` now groups the citation list into permanent
  per-case sections (General/force-wide first, then Mason, Wooley,
  Porterhouse, Butt) instead of one flat list — Corkboard.tsx unchanged
  structurally, just reads colour from `getEvidenceColor` instead of
  `TYPE_META`. Confirmed in-browser: cited and pinned EX.01, corkboard card
  renders with the neutral grey border instead of the old type colour.
  Real suspect-interview content (richer than these 19 items) exists only
  as prose in `Reference/case-content/case/hollenbourne-interviews.md` and
  as action-economy outcome text — pulling it into the evidence catalog as
  new citable exhibits was considered and deliberately deferred as a
  separate, larger content decision, not bundled into this fix.
- **Recovered and ported the visual design system from the standalone
  artifact prototype** (see "A third, previously-unknown copy" below) —
  previously only its Weeks 4-6 quiz *content* had been extracted; its
  actual look had never been carried over, which is what prompted the user
  to say a session felt like it had regressed to an earlier, cruder design
  than one they remembered. It hadn't — the polished version was just
  sitting unused in that artifact. Ported: (1) its type system, Special
  Elite (case-file typewriter display face) and IBM Plex Sans/Mono, loaded
  via a plain `<link>` to the Google Fonts CDN in `app/layout.tsx` — a
  runtime stylesheet request, NOT `next/font/google`, so it doesn't
  reintroduce the build-time fragility that decision was about; wired in
  through the `--font-serif`/`--font-sans`/`--font-mono` tokens in
  `app/globals.css` rather than touching every component, so every existing
  `font-serif`/`font-mono`/`font-sans` Tailwind class across the whole app
  picked it up for free. (2) The evidence board's card-grid +
  reader-dialog interaction pattern: exhibits now render as compact
  `ExhibitTile`s in a grid (`EvidenceBoard.tsx`) rather than full-width
  stacked cards; clicking one opens `ExhibitDetail` in a centred `Overlay`
  (styled after the artifact's `dialog#reader`) containing the *same*
  citation-exercise logic as before (assisted fields / free-text / the
  existing `DocumentModal` letterhead view) — a reskin of the container,
  not a rewrite of the mechanic. Deliberately did NOT adopt the artifact's
  color palette wholesale (already close to this app's own) or its
  simpler game logic (no per-student attribution, gating, or instructor
  dashboard — this app's mechanics are ahead of that prototype, not behind
  it) — only its typography and evidence-display pattern were missing.
  Confirmed end-to-end in-browser: cited EX.13, saw the VERIFIED stamp and
  pin button render correctly, opened the letterhead document view — all
  in the new type system.
- **Also recovered from that same artifact, found in a follow-up pass after
  the user said evidence still felt missing**: the artifact's "Unlock Tree"
  (its name for the Investigation tab) groups all ~45 actions into named
  narrative threads — the Mason movements chain, the tool-mark chain, the
  Butt movements chain, ANPR sweeps, the endgame, etc. — each with a short
  framing note (e.g. "The single most expensive action available from week
  one — and the one that can actually name a suspect"). The live
  Investigation tab was a single flat list of all 45 actions in catalog
  order with no such grouping at all — this, not the evidence board, was
  what the user meant by "a whole prompt about what is unlocked and the
  relative trust point costs of different evidence forms." Ported as
  `ActionThread`/`THREAD_META`/`THREAD_ORDER` in `lib/actions-catalog.ts`
  (every action tagged with its thread, verified 45/45 against the
  artifact's own grouping) and a per-thread heading+note+count in
  `ActionEconomy.tsx`, replacing the flat `.map()`. Most of the artifact's
  per-action cost-framing prose (e.g. "Priced highest deliberately...")
  turned out to already be present, near-verbatim, in each action's
  existing `description` — it was specifically the section-level grouping
  and its narrative framing that had never been carried over, not the
  content underneath it. Confirmed in-browser: all 8 threads render in
  the artifact's own order with correct counts (20/3/5/3/2/7/4/1 = 45).
- **Fixed a real gating discrepancy found while doing the above, confirmed
  with the user first.** `hollenbourne-unlock-tree.md`'s Tier 2 says the
  three Burgess cell-site actions (`cellsite-burgess-wooley`/`-mason`/
  `-butt`) should require the tool-mark chain having already named him
  (`property-search-burgess`) — the whole point of Tier 2 being gated on
  "Burgess named specifically." They were actually gated only on
  `pull-interview-burgess-mason` (a Tier 0 action, 1 point), so a team
  could buy his cell-site data — arguably the single most valuable
  evidence in the game — without ever running the property search meant
  to name him as a suspect first. All three now require
  `property-search-burgess` instead, matching the spec. Confirmed
  in-browser: all three correctly show "requires: the Burgess property
  search" and render LOCKED for a fresh team.
- **Three usability fixes to the Case Log, from direct user feedback after
  clicking through the live app.** (1) Confirmed the evidence board is
  already grouped by case, not by type/theme — that request needed no
  code change, just checking; worth remembering the "filing cabinet" fix
  a few sessions back already covers this. (2) **Full-text reading**:
  `EvidenceItem` gained an optional `body` (`EvidenceBodySection[]` —
  heading + paragraphs, several sections for a multi-document exhibit)
  in `lib/evidence-catalog.ts`, populated for the 12 of 19 exhibits with
  real source prose behind them — Ferris's memo, all four victim
  biographies (from the case bible), the missing person report, both
  maps, the homicide-rate stat (from `hollenbourne-source-prose.md`), and
  all four cases' policy-file/FLO-log/canvass-summary bundles — ported
  from the recovered artifact prototype and the case bible, not
  fabricated. The remaining 6 (EX.01–06, the original prototype-era
  placeholder exhibits, predating the deepening work) have no dedicated
  source document and were deliberately left without a `body` rather
  than invented. `EvidenceBoard.tsx`'s new `FullTextReader` component
  renders this as an inline "READ IN FULL ▾" disclosure inside
  `ExhibitDetail` — shown for any unlocked exhibit regardless of citation
  status, since reading and citing are two separate tasks, not
  sequential gates. Also wired into `PinDetailModal.tsx` (exported from
  `EvidenceBoard.tsx`) so a corkboard card shows the same full text.
  (3) **Corkboard pin management**: replaced the disabled/enabled "pin to
  corkboard" button with a proper toggle — "move to corkboard" /
  "remove from corkboard" — in both `ExhibitDetail` and `PinDetailModal`,
  so removing a pin no longer requires scrolling down to the corkboard's
  small "Unpin EX.xx" link list (kept as a fast secondary option, not
  removed). Corkboard dragging itself is unchanged and still the
  intended way to arrange/connect pinned cards — only add/remove no
  longer needs it. Confirmed end-to-end in-browser: read EX.13's full
  town-geography text inline, pinned and unpinned it via the new toggle
  in both places.
- **The big one: a module-wide "current week," the action→evidence link,
  full removal of the citation exercise, and the Moodle-style front page —
  driven by a handover package the user dropped at the repo root
  (`recovery/`, `mechanics/hollenbourne-weekly-unlock-schedule.md`, an
  updated `prototype-reference/index.html`) after suspecting a past revert
  had lost work.** Read the whole package, ran a Pass-1 status check
  against its 13-section recovery checklist before changing anything (per
  its own two-pass recovery prompt), found most of it already matched the
  live code, and got explicit sign-off before starting Pass 2. Four parts:
  1. **Instructor-controlled current week** — new `moduleSettings` table
     (`db/schema.ts`, a genuine single-row/singleton pattern, the first one
     in this schema), `lib/module-settings.ts`'s `getCurrentWeek`/
     `setCurrentWeek`, `app/api/instructor/set-week/route.ts` (copies
     `reassign-student`'s exact shape), and `app/instructor/CurrentWeekControl.tsx`
     on the instructor dashboard. Deliberately instructor-controlled, not
     calendar-derived — gives control for extensions/snow days rather than
     assuming the term runs exactly on schedule. This is a real capability
     that didn't exist at all before: `EvidenceItem.unlocksWeek` and
     `ActionItem.availableFromWeek` were previously compared only against
     a client-side, per-team browsable week selector with no connection to
     reality — nothing ever advanced them, so every week-gated exhibit and
     action was either free from day one or permanently locked. Confirmed
     live: bumped the instructor's week control from 1 to 3, watched a
     team's "evidence unlocked" count go from 7 to 11 (exactly the four
     victim biographies gated at Week 3).
  2. **Action → evidence link** — `EvidenceItem` gained `unlockedByActionId`;
     `lib/evidence-catalog.ts`'s `isEvidenceUnlocked(item, currentWeek,
     completedActionIds)` is now the single source of truth for whether an
     exhibit is readable, checked both for week-gates and action-gates
     together. Every one of the 45 actions in `lib/actions-catalog.ts` now
     has a matching Case Log exhibit (EX.20 onward, `ev-<action-id>`),
     reusing that action's own already-written `outcome` text as the
     exhibit body — mechanical porting, not new authoring, per the
     recovered prototype's own pattern (every costed action reveals a real
     Case Log document, not just its own inline card text). `ActionCard`
     still shows `outcome` inline exactly as before — the Case Log entry
     is the permanent, poolable, corkboard-able copy of the same finding,
     not a replacement. Case/suspect tagging for these 45 follows the same
     judgment calls as EX.01-19 (a suspect only tagged when the finding is
     substantively about them — a property search, a named registered
     keeper, cell site data on their number — never inferred from
     circumstantial description alone). Confirmed live: took "Pull initial
     interview — Nigel Wooley," its linked EX.21 appeared unlocked in the
     Case Log, correctly suspect-tagged (indigo, matching the corkboard's
     own Nigel colour), full outcome text readable via the existing "read
     in full" reader, pinnable with no citation step.
  3. **Citation exercise removed entirely**, per explicit request — the
     user found it "clunky and annoying" and is teaching citation through
     quizzes instead now that Week 3 has a dedicated referencing quiz spec.
     Deleted: `lib/evidence.ts`, `lib/citation-validation.ts`,
     `app/api/evidence/route.ts`, the `evidenceCitations` table (two-pass
     migration per the documented TTY workaround — added `moduleSettings`
     alone first, then dropped `evidenceCitations` alone second, since
     doing both in one `generate` reads as an ambiguous rename candidate),
     and `EvidenceItem.meta`/`citeType`/`assisted`/`hint` plus the whole
     CITE form, VERIFIED/INADMISSIBLE stamp, and bibliographic "view
     document" reference popup from `EvidenceBoard.tsx`. An exhibit now has
     exactly two states — locked or unlocked — and pinning to the corkboard
     requires only that it's unlocked, not a prior correct citation.
     `lib/instructor-data.ts`'s "exhibits cited" stat became "evidence
     unlocked," computed via the same shared helper.
  4. **Front page rebuilt** — see "Page structure" above for the
     structural change (three tabs, `WeeklyOverviewTab.tsx` replacing both
     `BriefingTab.tsx` and `QuizzesTab.tsx`).

  Deliberately deferred, flagged for the user rather than guessed: whether
  `ActionItem.category`'s "forensic" category should get its own
  `EvidenceType` (currently mapped onto the existing "documentary" type,
  same as everything else without a dedicated exhibit-type icon).
  Production build, typecheck, and lint all clean throughout; the two-pass
  migration applied cleanly against the real `dev.db`.
- **Fixed two real gaps in the above, found by the user clicking through the
  live preview**: not every exhibit was actually readable in full, and no
  exhibit had an image, despite several being explicitly visual (maps, CCTV
  stills, cell-site reports). Checked before assuming either was fixed:
  `EvidenceItem` had no `image` field at all, and grep confirmed six
  exhibits — `EX.01`–`06`, the original pre-deepening prototype placeholders
  (verified against `Reference/evidence-board.jsx`, the actual source they
  were ported from) — have no real document behind them anywhere in any
  recovered material, so they never got a `body`. Fixed both: (1)
  `EvidenceItem` gained `image?: string` (same `public/`-relative-path
  pattern as `quiz-catalog.ts`'s `McqStage.image`); copied the two case maps
  and all five cell-site exhibit images from the handover's `visuals/`
  folder into `public/case-images/`, wired to `EX.13`/`EX.14` and the five
  `cellsite-*` action-derived exhibits via `ACTION_EVIDENCE_META`;
  `EvidenceBoard.tsx`'s `ExhibitDetail` renders the image (when present)
  above the full-text reader, same as `McqQuiz.tsx` already does for quiz
  charts. `EX.02` ("CCTV still — woodland car park") has no real image
  anywhere in any recovered material — left text-only rather than
  mislabelling an unrelated file as it. (2) `FullTextReader` is now always
  offered, not conditional on `item.body` existing — the six bodyless
  exhibits show an honest one-line fallback ("No fuller record exists on
  file for this exhibit beyond the summary above.") instead of silently
  omitting the button, so every exhibit behaves consistently rather than a
  handful looking broken. Confirmed in-browser: all 7 images return 200 and
  render (one visually screenshotted, the other 6 confirmed via direct
  fetch); EX.01 (previously bodyless) now shows the fallback text through
  the same "READ IN FULL" control as every other exhibit.
- Production build passes clean (`npx next build`), TypeScript and ESLint
  both clean.
- **Week 3's referencing quiz, including AI-graded free-text practice.**
  Stage 1 (4 mcq questions, from `hollenbourne-week3-referencing-quiz.md`)
  is just another `lib/quiz-catalog.ts` `QUIZ_DEFS` entry
  (`WEEK3_REFERENCING_QUIZ`) — scored, persisted, and averaged into the
  trust bonus through the exact same generic mcq path every other quiz
  week uses, no new infrastructure needed. Stage 2 (the 3 free-text "write
  your own" tasks) is deliberately separate and **never scored or
  persisted** — its own source doc marks it "for your own review" — but
  does get real AI-graded structured feedback per element (author/year/
  title/publication details/access details), per
  `technical-briefs/hollenbourne-claude-code-referencing-brief.md`:
  `lib/reference-tasks.ts` (server-only task catalog, so the model answer
  is never sent to the client), `app/api/quiz/reference-feedback/route.ts`
  (session-gated, calls the Anthropic Messages API with `claude-sonnet-5`
  — the brief's `claude-sonnet-4-6` is stale — one retry on failure), and
  `app/dashboard/quiz/ReferencingPractice.tsx` (rendered inline below the
  Stage 1 quiz card in `WeeklyOverviewTab.tsx`, both in the current-week
  and other-weeks positions). **Real bug found and fixed during
  end-to-end testing**: `claude-sonnet-5`, given this longer prompt,
  returns a `thinking` content block *before* the `text` block — the
  initial implementation assumed `content[0]` was always the text block
  and got `undefined`, failing every request with a 502. Fixed by finding
  the block by `type === "text"` instead of by index, and `max_tokens`
  raised from 600 to 1024 to comfortably cover thinking + JSON output.
  Confirmed in-browser end-to-end after the fix: Stage 1 scored 4/4 →
  trust bonus +3 (confirmed live on the Investigation tab after a
  reload); Stage 2 given a genuinely correct reference returned all-
  correct per-element feedback, and given a deliberately broken one
  (missing year, missing publication details, flawed title) returned
  correctly differentiated flawed/missing feedback for exactly those
  elements and "Needs work" overall; confirmed not persisted (textareas
  empty again after a reload); confirmed a logged-out request to
  `/api/quiz/reference-feedback` is rejected with 401.
  **Superseded in two later passes (read these over the paragraph above
  wherever they differ):** (1) Stage 2 is now *persisted* per student
  (`referencePracticeDrafts` table, `lib/reference-practice.ts`, mirroring
  `cw2MockDrafts`) and has a distinct "SUBMIT AS MY ANSWER" step beside
  "check my reference" — still unscored, submit is only a completion marker
  and is only enabled when the text matches what was last checked; Stage 1
  is labelled "Stage 1 — Multiple choice" in `WeeklyOverviewTab.tsx` (not
  inside the shared `McqQuiz`) so Stage 2 has a visible partner. (2) The
  three Stage 2 tasks were rewritten (2026-10-05) to be easier and to match
  **LSBU's own Harvard guide** (`https://library.lsbu.ac.uk/harvard`, each
  task links to its page): Task 1 a print book (`print-book`), Task 2 a
  journal article (`journal-article`), Task 3 the online news article
  (`online-news`) deliberately referenced as a **webpage** — LSBU has no
  online-newspaper entry (only print newspaper and webpage), so year-only,
  italic title, no newspaper name, no quote marks. Verified against the live
  guide pages: LSBU print books have **no place of publication**; journal
  article titles go in single quotes with the journal title italic. The
  grader prompt in `reference-feedback/route.ts` now says it's grading
  against LSBU's format and that students mark italics with `*asterisks*`
  (the box is plain text; unmarked italics aren't penalised, italics on the
  wrong element are). Task ids changed, so any rows saved under the old
  ids (`newspaper`, `undated-website`, `book-chapter`) are simply ignored.
  Stage 1's MCQ answers were brought into line with the same LSBU format
  at the user's request (the book answer no longer has a place of
  publication, the journal answer now has a quoted article title and
  "pp. 512–530", and the CPS answer's explanation names the webpage
  format); correct-answer indexes are unchanged so saved attempts still
  score the same. `Reference/case-content/quizzes/hollenbourne-week3-referencing-quiz.md`
  was updated to match, so a future re-port from it won't undo this.
- **CPS Application Quiz** (`hollenbourne-cps-application-quiz.md`, from a
  second handover drop landing directly in `Reference/case-content/quizzes/`
  — see "Repo location" below) — a companion to the existing Week 7 CPS
  Quiz, not a replacement: that one teaches the Full Code Test's mechanics
  abstractly, this one applies both stages to 4 scored scenarios (one
  deliberately echoing Khalid Haddad's own NRM/exploitation backstory as a
  worked parallel, without being Haddad specifically). Added as
  `CPS_APPLICATION_QUIZ` in `lib/quiz-catalog.ts`, same week (7) as
  `CPS_QUIZ` — confirmed this pools the two into one average exactly like
  Week 6's pair of argument quizzes already do, since `getTeamQuizAverage`
  filters purely by `week`, not `quizId`. No new code needed. Confirmed
  end-to-end: submitted 4/4 correct (trust bonus +3), verified directly
  against `dev.db` that the attempt row stored `week: 7` alongside the
  existing CPS Quiz's attempts.
- **Mock CW2 practice tool** — built out from the Mock CW2 pack
  (`hollenbourne-mock-cw2-pack.md` + its chart) into a genuine scaffolded
  exercise, not a passive read-through: the user's own design, deliberately
  more structured than the pack's own "choose 2, write 1000 words" brief.
  Students pick 3 of the 4 items (statistical, visual, textual,
  documentary), and for each type an in-text citation, a full bibliographic
  reference, and an interpretation of what it shows and how it relates to
  broader social trends — getting AI feedback after each item, not just at
  the end — before writing a final synthesis discussing how the three
  items interact, with feedback on that too. Entirely unscored (no trust
  bonus, nothing in `quizAttempts`) but genuinely persisted, unlike Week 3
  Stage 2's deliberately-ephemeral practice — a student can leave and come
  back. Matches Week 11's plan row ("Crime Trends: Data Analysis Workshop"
  — "Visual, Textual, and Statistical Analysis").
  New table `cw2MockDrafts` (`db/schema.ts`), one row per student (a draft
  being edited, not an append-only attempt log), upserted via
  `onConflictDoUpdate` on a unique `studentId` index — same pattern
  `lib/module-settings.ts`'s singleton row already uses. `lib/cw2-sources.ts`
  holds the 4 items' content plus server-only grading answers
  (`correctCitation`, `interpretationGuidance`) — never sent to the client
  wholesale, same precaution as `lib/reference-tasks.ts`; the client
  component (`app/dashboard/quiz/MockCw2Practice.tsx`) keeps its own
  public-safe duplicate of just the student-facing content, for the same
  reason `ReferencingPractice.tsx` already does. `lib/cw2-practice.ts` is
  pure DB access (`getDraft`/`saveSelection`/`saveItemResponse`/
  `saveSynthesis`); the AI-grading orchestration lives in
  `app/api/quiz/mock-cw2/route.ts` (one POST route, `action`-discriminated:
  `select`/`item`/`synthesis`), session- and student-gated exactly like
  `/api/quiz`.
  **Extracted a shared `lib/anthropic-grading.ts`** (`callClaudeForJson`/
  `callClaudeForJsonWithRetry`) from the logic already fixed once in
  `reference-feedback/route.ts` (finding the response's `text` content
  block by `type`, not by index — the thinking-block bug) — both AI-graded
  features now share one place this bug class can be fixed if it recurs;
  `reference-feedback/route.ts` refactored to use it, no behaviour change.
  **A second real bug found in this build's own end-to-end testing**: the
  synthesis-grading call (longer prompt, longer expected response) hit
  `max_tokens: 1024` and got its JSON response truncated mid-string on the
  first attempt, then produced *no* text block at all on the retry
  (thinking tokens alone exhausted the budget) — both attempts failed,
  502. Fixed by raising the budget for calls with more to say: 1536 for
  per-item feedback, 2048 for the synthesis (which grades a much longer
  student submission and returns two assessed dimensions instead of one).
  Confirmed end-to-end in-browser after the fix: selected 3 items,
  submitted a genuinely correct citation+reference+interpretation for the
  statistical item (all-correct, "Strong" feedback), a deliberately broken
  one for the visual item ("chart, 2026" as the citation, a one-line
  description instead of a reference, a shallow interpretation — correctly
  returned Flawed/Missing/Needs work with accurate reasoning for each),
  and a correct one for the textual item ("Developing" — genuinely
  differentiated, not just correct/incorrect); confirmed the synthesis
  section stayed hidden until all 3 items had feedback; submitted a
  synthesis engaging a real tension between the sources and got back
  accurate, specific feedback naming that tension; reloaded the page and
  confirmed every input, every feedback panel, and the synthesis itself
  were all still there — the actual point of persisting this, unlike
  Week 3 Stage 2; confirmed a logged-out request to `/api/quiz/mock-cw2`
  is rejected with 401.
- **Mock CW2 feedback reworked to the v2 brief + feedback philosophy** (a
  third handover drop into `Reference/case-content/technical-briefs/`:
  `hollenbourne-cw2-feedback-philosophy.md`, `hollenbourne-claude-code-cw2-feedback-brief.md`,
  and a restructured `hollenbourne-mock-cw2-pack.md` — **note this shares a
  filename with the older data pack in `quizzes/` but is a different, newer
  document: the step-by-step form is the current spec**). This supersedes
  the description of the Mock CW2 tool above wherever they differ:
  - **Four data types, the student chooses three.** Statistical, visual,
    textual, documentary. Exactly 3 must be chosen and the statistical one
    must be among them (the real assignment's rule — enforced server-side
    in `saveSelection`, `lib/cw2-practice.ts`). The chosen three are worked
    in catalog order, each unlocking after the previous is checked, then
    synthesis. Deselected items keep their responses; changing the
    selection clears the synthesis *feedback* (it was about a different set
    of sources) but keeps the text.
  - **Category definitions (the user's, worth not re-litigating): "visual
    data" means an IMAGE; a chart is a way of representing statistical
    data.** So the sentencing-outcomes chart
    (`public/quiz-charts/chart-mock-cw2-sentencing-outcomes.png`) is shown
    *inside* the statistical item, alongside its written figures, and is
    not a separate option. The visual item (`id: "image"`,
    `public/cw2-images/station-platform.webp`) is an AI-generated image
    the user supplied for the module: a teenager alone on a station
    platform with a phone, beside a British Transport Police "Could this be
    child exploitation?" poster. History: the tool went through
    chart-as-its-own-visual-option and five-option versions in one session
    before this was clarified; the selection column was also dropped and
    restored (migration 0010).
  - **The image's citation has no single correct string** — no generating
    tool or date was given — so `CW2_GRADING.image.citationNote` accepts any
    honest, clearly labelled treatment of AI-generated course material
    (author = university/module/named tool, 2026, descriptive title,
    "[AI-generated image]" label, no URL or access date) and marks a
    real-photographer/stock-agency credit as wrong. Tighten it if the tool
    name and generation date are supplied.
  - **The visual frame is a drafted extension, not from the philosophy doc.**
    The doc defines frames for statistical, textual and documentary
    sources but none for an image. `CW2_GRADING.image` in
    `lib/cw2-grading.ts` (marked with a NOTE) reads it as a constructed
    image — composition, the poster text beside the subject, what the image
    invites a viewer to infer, that it cannot show whether the person is
    exploited, and that it is an illustration rather than evidence of a
    real case. Check it against the assessment brief. The grader is given
    a text description of the image (and of the chart), not the image
    files themselves.
  - **Form fields per step**: parenthetical citation, narrative citation,
    full reference, "what is this data saying" (description), "what could
    explain this" (interpretation); synthesis has two boxes (relationship,
    argument). Stored in `cw2_mock_drafts`; rows written before this rework
    are normalised on read (old feedback shape dropped, so it just gets
    re-checked).
  - **Feedback**: `lib/cw2-grading.ts` (SERVER-ONLY) holds a system prompt
    containing all 12 principles and both worked examples in full, including
    Worked Example 1's corrected mistake, plus answer keys and prompt
    builders. The data-type checkpoint returns citation (parenthetical /
    narrative / bibliographic checked separately), description accuracy,
    plausibility-of-reasoning with a **structurally separate**
    sufficiency_statement and socratic_prompt, multiplicity, and epistemic
    framing. Synthesis returns relationship (connection *or* tension both
    pass), reasoning-gap, multiplicity, epistemic framing. Two additions to
    the brief's JSON shape, both taken from the philosophy doc:
    `epistemic_framing` (Principle 5 says it is a distinct check the brief
    shape omitted) and a `relationship` field for synthesis (the brief
    lists the check but had nowhere to put it). The disclaimer is NOT in
    the model JSON — it is the hardcoded `FORMATIVE_DISCLAIMER`
    (`lib/cw2-items.ts`), shown in a sticky banner and every feedback
    panel. No instructor-facing view of this feedback exists, deliberately
    ("never seen by whoever marks the real submission") — don't add one
    without asking.
  - **Daily cap**: `DAILY_CHECK_CAP = 15` checks per student per London day
    (`checks_today`/`checks_date` on the draft row; 429 past it; work stays
    saved). Adjust the constant if it proves wrong.
  - **Content split**: `lib/cw2-items.ts` is student-facing and client-safe;
    `lib/cw2-grading.ts` is the answer key and must never be imported
    client-side. This removed the duplicate-content-in-the-component
    workaround.
  - **Verified live** using Worked Example 1 as a calibration test: the
    philosophy doc's own student answer got multiplicity "present", *no*
    false proxy-measure flag (the Principle-6 failure), and epistemic
    framing "could_be_sharper" as the one real refinement — exactly as the
    doc says. A weak textual answer (hedged non-sequitur: "might possibly
    indicate the boy was lying") was marked `gap_found` despite the hedging
    (Principle 9), and caught a misread source count. Cap 429, persistence
    and the sticky banner also confirmed.
  - **Known issue — latency**: a data-type check takes ~30s and the
    synthesis ~60s (long system prompt plus thinking). Fine for an async
    practice tool with a "CHECKING…" state, but a host with a short request
    timeout would cut it off. Token budgets are 3072 / 4096.
  - **Documentary content is a placeholder**: the pack's documentary item is
    MoJ (2023) *County Lines Exploitation — Practice Guidance for Youth
    Offending Teams* with its extract marked "to be finalised". Until the
    real extract exists, the documentary step uses the Home Office (2025)
    evaluation already in the app (prompt wording adapted from "guidance"
    to "evaluation"). Swapping is a content-only edit in
    `lib/cw2-items.ts` and `lib/cw2-grading.ts`.
- The endgame submission form (`hollenbourne-endgame-form.md`) is
  confirmed **not** a gap — it's explicit in its own header that it's
  offline and hand-graded, no app integration intended.
- **Corrected**: DS Ferris conducts every interview throughout the case,
  including the Haddad/Swayne Porterhouse arrests — the "DS Fenwick" name
  in the standalone prototype was a naming drift, not a second detective.
  A prior session momentarily concluded these were "deliberately two
  different people" — that was itself the confusion, since resolved
  against the handover package's `recovery/hollenbourne-claude-code-kickoff-prompt.md`
  and `recovery/hollenbourne-recovery-checklist.md`, both of which say to
  default to Ferris. If this ever resurfaces, Ferris is correct; there is
  no Fenwick in the real design.
- The disconnected OneDrive copy this content was recovered from
  (`C:\Users\CrisW\dev\hollenbourne-app`) still exists and hasn't been
  cleaned up — safe to delete once its content is confirmed fully migrated,
  but not yet done. This now includes the nested `app\` Next.js project
  described above (corkboard/banking source) — confirm nothing else useful
  is left in it before deleting.
- **Deployment — in progress, targeting Railway with SQLite on a
  persistent volume** (see "Decisions worth knowing" and README's
  "Deploying (Railway)" section for the reasoning and steps). GitHub
  remote is live at `github.com/newnoise12/Hollenbourne-Interactive-Crime`
  (branch `master` — GitHub's own new-repo default of `main` was never
  created; Railway's branch selector had to be pointed at `master`
  explicitly). `package.json` gained `db:migrate` and an `engines.node`
  pin.
  **`railway.json` was added, then deleted — it does nothing on this
  project.** Railway's actual builder is **Railpack**, not Nixpacks, and
  "Config as Code" (what `railway.json` requires) is deprecated and
  unavailable to any service created after 2026-08-28, which this one was
  — the file was silently ignored the whole time. The equivalent settings
  are configured directly in Railway's dashboard instead: Settings → Deploy
  → **Custom Start Command** = `npm run db:migrate && npm run start`. If a
  future session is tempted to reach for `railway.json`/`nixpacks.toml`
  again, check the service's Settings → Config-as-code section first —
  it'll say outright whether this project can use one.
  **Two real deploy-blocking bugs found and fixed getting this far:**
  1. Railway's GitHub App was never actually installed on the user's
     GitHub account (`github.com/settings/installations` showed zero
     installed apps) despite the repo appearing "connected" in Railway —
     every deploy attempt silently produced nothing, with the service
     stuck on "There is no active deployment for this service" and the
     branch selector showing "Could not load branches" with a Retry that
     never succeeded. Not an OAuth-app permission (that's a different
     GitHub settings page, "Authorized OAuth Apps," which only offers
     "Revoke" — a real dead end the user hit first). Fixed by
     disconnecting and reconnecting the repo in Railway's Settings, which
     re-triggered GitHub's actual App-installation popup this time.
  2. First real build attempt failed: `better-sqlite3` (a native module)
     had no prebuilt binary for the newest Node version Railway's Railpack
     builder picked by default (24.10.0), so it fell back to compiling
     from source via `node-gyp`, which failed outright — the build image
     has no Python. `package.json`'s `engines.node` was `">=22"` (an open
     range); pinned to `"22.x"` to force the same Node line the app is
     actually developed and tested on locally, avoiding the newest-minor
     trap entirely rather than trying to get Python into the build image.
  Not yet confirmed live end-to-end — next deploy after the engines pin
  is the one to check.
- **"My trust points didn't update after the quiz" (2026-10-05) — three
  separate causes, all fixed.** (1) **The submit button didn't submit.** In
  `McqQuiz`/`MultiselectQuiz` the button labelled SUBMIT ANSWERS only
  *revealed* the answers; the real save was two clicks later (FINISH QUIZ →
  YES, SUBMIT), so a student who stopped after seeing the answers had
  submitted nothing. The last stage's button is now the real submit (it goes
  straight to the "this will be attempt N of 3 — saves your answers and sets
  your trust bonus" confirmation, answers locked meanwhile, and the correct
  answers appear on the results screen after saving); earlier stages of a
  multi-stage quiz keep an in-place "CHECK ANSWERS" → CONTINUE. This also
  closes a hole where answers were revealed before anything was saved, so a
  reload gave a free look at the key. (2) **The Investigation tab held the
  server's numbers forever.** `ActionEconomy` copied its props into
  `useState` once on page load, so even a saved quiz didn't show there until
  a full reload. It now re-syncs from props (render-time prop-change pattern,
  as in `Corkboard`), and the quiz submit, take-action and bank-points
  handlers call `router.refresh()` — which also fixed taking an action not
  unlocking its Case Log exhibit or updating the This Week counts until a
  reload. Rule of thumb: the dashboard's server data reaches client state
  once; anything that changes it must `router.refresh()`, and a component
  that copies props into state must re-sync. (3) **A perfect score now
  completes a quiz.** `isPerfectAttempt` (`lib/quiz-catalog.ts`, client-safe
  so both sides share it): the quiz shows "✓ Quiz complete", no try-again,
  the card header reads "✓ complete (+N)", and `submitGenericQuizAttempt`
  refuses any further attempt server-side. Applies to every generic mcq and
  multiselect quiz, not just Week 3; the Week 2 ranking quiz (`TrustQuiz`)
  is unchanged. **Only Stage 1 of the Week 3 quiz is scored** — Stage 2 never
  touched the trust bonus; the wording now says so in both the Stage 1 intro
  and the Stage 2 intro, and the Week 3 card header shows both ("Stage 1: …
  · Stage 2: n/3 submitted").
- **"Check my reference" kept erroring (2026-10-05) — two causes in
  `lib/anthropic-grading.ts`, both fixed.** Reproduced by calling the API
  directly with the production prompt, so the numbers are real: (1)
  **Rate limiting, the main one.** The org's API key caps *concurrent*
  requests (it tripped at roughly 25 in flight: "Number of concurrent
  requests across all models has exceeded your organization's limit" — a
  429). A lab of students pressing check together exceeds that, and the old
  retry fired instantly so it was rejected too (5 of 30 simultaneous calls
  failed). Calls now queue behind a process-level limit of 10
  (`MAX_CONCURRENT_CALLS` — fine because it's one Railway instance; a second
  instance would need the limit lowered or shared), and a 429/5xx/timeout is
  retried with back-off honouring `Retry-After`. (2) **Truncation.** The
  grader asked for `max_tokens: 1024`, and reasoning + JSON ran past it
  about 1 call in 20 on *wrong* answers (which need longer notes — the ones
  students resubmit most), giving cut-off JSON. Stage 2 now asks for 4096,
  and the helper detects `stop_reason: "max_tokens"` and retries with double
  the budget. Also: a 120s fetch timeout, non-retryable errors (bad key or
  request) fail immediately instead of retrying, every failed attempt is
  logged as `[ai-grading] attempt n/N failed: <real reason>`, and
  `GradingError.busy` lets the route tell students "the service is busy, press
  check again" rather than a generic error. Stage 2 makes up to 4 attempts
  (its calls take seconds); Mock CW2 keeps the default 2 because its calls
  take 30–60s. After the fix 30 simultaneous checks all succeeded (slowest
  ~31s, from queueing); a single check is a few seconds. **If errors come
  back, look for `[ai-grading]` lines in the Railway logs first** — they say
  whether it's 429s (raise the org's limits or lower the queue), truncation,
  or something else.

## Env vars

`ANTHROPIC_API_KEY` (`.env.local`, gitignored) powers the Week 3 Stage 2
AI-graded referencing feedback (`app/api/quiz/reference-feedback/route.ts`).
**Must be a workspace-scoped key from console.anthropic.com, not an
org-level/unscoped one** — an unscoped key fails with a 400 "not scoped to
a workspace" error on every call. A Claude Pro subscription login does not
work here either; this needs real API credentials with billing set up.

`INSTRUCTOR_PASSCODE_HASH` (`.env.local`, gitignored) gates `/instructor`.
Generate a new one with:
```
node -e "require('bcryptjs').hash('your-passcode', 10).then(console.log)"
```
**Dollar signs in the hash MUST be backslash-escaped** (`\$2b\$10\$...`) in
`.env.local` — Next.js's env loader (`@next/env`, via `dotenv-expand`) treats
a bare `$word` as a variable reference and silently replaces it with an
empty string if that variable isn't set, which silently corrupts an
unescaped bcrypt hash (every `$2b`, `$10`, and the `$<salt+hash>` segment
each get eaten). This cost real debugging time once already — don't
re-introduce an unescaped hash in an env file.

## Repo location

Lives at `C:\dev\hollenbourne-app`, tracked with a local git repo (no
remote yet) — moved out of the OneDrive-synced Documents folder it started
in, because OneDrive's file sync was intermittently corrupting Turbopack's
persistent cache (`Failed to restore meta for task...` panics) and, more
importantly, there was no real version control at all before this. Still
good practice never to run `next build` while `next dev` is running
against the same `.next` directory (stop the dev server first) — if a
Turbopack `TurbopackInternalError` ever shows up again, `rm -rf .next
node_modules/.cache` and restart.

**A second, disconnected copy of this project** independently accumulated
in OneDrive after this repo's own move — a content-authoring folder with
its own single-commit git history at `C:\Users\CrisW\dev\hollenbourne-app`,
containing case content that was never ported into this repo (see
`Reference/case-content/` above, which is that content, copied in). If a
future session finds itself confused about "missing" content that other
sessions seem to remember, check whether it's sitting in that folder rather
than assuming it was lost — it's the second time this has caused confusion.

**The old OneDrive folder this repo itself was moved out of**
(`C:\Users\CrisW\OneDrive\Documents\Becoming a Criminologist\hollenbourne-app`)
has since been deleted, once a stale `next dev` process holding it open was
killed — don't assume a similar "can't delete, file in use" error means the
delete is unsafe; check for a leftover dev server first.

**A third, previously-unknown copy existed as a published Claude Artifact**
(not a filesystem folder) — a fully self-contained HTML build of the whole
game, complete with its own live database, published 2026-09-15 and found
only by explicitly listing artifacts (`Artifact` tool, `action: "list"`) —
neither `git log` nor a filesystem search would ever surface it. It held
the Weeks 4-6 quiz content ported into `lib/quiz-catalog.ts` (see above),
plus a leader-controlled "release this quiz to teams now" mechanism the
current instructor dashboard doesn't have, and full verbatim interview
transcripts richer than the summarized outcome text in
`lib/actions-catalog.ts`. Its live database was checked and held only one
test team from the same day it was published — no real student data was
ever at risk of being lost. **If a future session is asked to verify
nothing has been lost, or a user says work feels like it's missing,
checking `Artifact` with `action: "list"` is a real, necessary step** —
this exact gap (reassuring the user based on git history alone, without
checking for a published artifact) has now happened three times, each
narrower than the last: first when this artifact's quiz content wasn't
known about at all; then when its content had been ported but its visual
design (fonts, evidence-card layout) had not; then, in the very same
session as that second fix, when the user said evidence *still* felt
missing and it turned out to be a third, more specific thing this
artifact had that the app didn't — the Investigation tab's narrative
thread-grouping and framing notes, not the evidence board at all. Porting
*some* of a recovered source's content, even carefully, does not mean
everything from it has been reconciled — each fix should prompt asking
"what else from this same source might still be missing," not just being
treated as closing the file on it.

**A fresh handover package landed at the repo root** (not inside
`Reference/`) after the user suspected a revert had lost work — `case/`,
`mechanics/`, `quizzes/`, `technical-briefs/`, `visuals/`,
plus two genuinely new folders, `recovery/` (a 13-section checklist and
two Claude Code prompts written to verify against a suspected revert) and
`prototype-reference/` (a newer `index.html` than the published artifact
above — same architecture, several real fixes: the property-search chain
properly three-way from the start, initial-interview-pull actions gating
re-interviews). Spot-diffed the overlapping files against
`Reference/case-content/` — byte-identical — confirming the user's own
recovery prompt was right that "the content files themselves are all
intact and correct." Folded everything into `Reference/`: the five
already-present folders merged into `Reference/case-content/` (also
fixing a pre-existing mess there — `visuals/` had every image duplicated
flat *and* in its proper subfolder; now only the subfolder copies
remain), plus the two new folders as `Reference/recovery/` and
`Reference/prototype-reference/`. The root-level copies were then
deleted — this is describing a one-time cleanup, not an ongoing
convention; a future handover drop should go straight into `Reference/`
rather than the repo root.

**A second, smaller handover drop landed correctly** the following
session, straight into `Reference/case-content/quizzes/` rather than the
repo root — the CPS Application Quiz and Mock CW2 pack described in
"Current state" above. Confirms the convention above is the right one to
keep pointing future drops at.

**File-drop handovers are being superseded by a live Claude Doc**, created
2026-10-01 specifically to cut out the save-file-then-drop-it-in-Reference
round trip: **"Hollenbourne Content Inbox"**,
`https://claude.ai/code/artifact/4745b21f-884b-4f98-9175-d5d9a79dff64`. The
user writes new/updated case content, quiz drafts, mechanics/action-economy
changes, AI-grading brief changes, or visuals notes directly into this doc
from any Claude chat (their "desktop chat" included) — a Code session reads
it with this tool's `read` action when asked, instead of waiting for a file
drop. If a future session is asked to check for new content and nothing's
been handed over directly in the conversation, check this doc before
assuming there's nothing new — the same way `Reference/case-content/` and
the recovered artifact needed explicitly checking for, this doc won't show
up by grepping the repo. Whether ported content gets cleared from the doc
or left as a running log was an open question put to the user in a comment
on the doc itself at creation time — check there for the answer before
assuming either way. The `Reference/` file-drop convention documented above
still works as a fallback; it's just no longer the primary path.

**First inbox drop ported (2026-10-05)** — worth knowing what that process
actually involved, since the next one will look the same. The doc's own
"Applied to source documents" list described edits made in the user's
*other* chat's copies of the case files, not ours, so each one had to be
re-applied to `Reference/` as well as the app. Done: Burgess's dark 4x4 is
**KN58 TVP** (the ANPR exhibit in `lib/action-evidence-bodies.ts`, the
`vehicle-reg-lookup` outcome, and `hollenbourne-cell-site-data.md` — Haddad's
`[registration]` placeholder is deliberately still a placeholder); the high
street CCTV sighting is **9:38pm**, not "shortly after 10pm"; Nigel's dog is
**Missy** (female, so "she'd", not "he'd"), not Baxter; the "Chase CCTV —
Hollen Marsh car park" action was already absent from the app (it had been
retired with the other generic placeholders) and was removed from the two
mechanics docs. Four approved exhibit images were added under
`public/case-images/` as JPEGs: the Mason traffic-camera stills
(`traffic-cam-hollen-marsh`), the Mason doorbell still (`canvass-doorbell-mason`),
and the Butt bus / high street / Paget Street frames. **Two placement calls
that were mine, not the user's:** the Butt image arrived as one three-panel
composite, but those three actions are independent and priced separately
(2/1/2), so showing the whole set on each would have given away the other
two for the price of one — it was cropped into one panel per action; and
the Wooley footpath CCTV (21:47:03, 6 Jan 2022) has no action of its own, so
it sits on the Wooley initial-interview exhibit, where Ferris puts that very
footage to Nigel. `EvidenceItem` gained an optional `imageCaption` (shown
under the image) to carry what/when for each. The doc's design notes about
each image (e.g. "coat kept deliberately ambiguous") were not copied into
captions — they're notes for the authors, not for students.

## Decisions worth knowing (so they don't get re-litigated)

- **Drizzle, not Prisma**: Prisma needs to download a query-engine binary
  from its own CDN at install/migrate time — a real fragility risk in
  restricted network environments (CI runners, some hosting platforms).
  Drizzle's migrations are plain SQL files, no external binary dependency.
- **No `next/font/google`**: same reasoning — fetching fonts from Google at
  *build* time means a network hiccup during deployment can break the build.
  Using the system font stack instead removes that risk entirely.
- **SQLite in production too, deployed to Railway on a persistent volume**
  (reversed from an earlier "Postgres in production" plan once actually
  deploying). That earlier plan assumed swapping `db/client.ts` for a
  Postgres driver was a drop-in change — it isn't: Drizzle's sqlite-core
  and pg-core table builders are different APIs, so `db/schema.ts` itself
  would need converting, and either a second schema file to keep in sync
  or moving local dev to Postgres too. Since day-to-day changes here are
  almost always content (quiz text, evidence, grading prompts — plain
  data files, no schema involved), running SQLite in production was the
  pragmatic call to get live quickly without taking on that maintenance
  burden. `DATABASE_URL` is a plain file path in both environments — see
  README's "Deploying (Railway)" for the actual steps (a Railway volume
  mounted at `/data`, `railway.json` running `drizzle-kit migrate` before
  `next start` on every deploy). Revisit Postgres later if it's ever
  actually needed (e.g. multiple app instances sharing one database), not
  as a default assumption.
- **`npm audit` will show some vulnerabilities** — all confirmed to be in
  dev-only tooling (Prisma's old CLI deps left in the lockfile history,
  esbuild's dev server via drizzle-kit), not in code that runs in the
  deployed app. Don't downgrade packages just to silence these; check what
  they actually affect first.

## Conventions

- Server components by default; client components only where interactivity
  is genuinely needed (forms, buttons) — see `app/login/LoginForm.tsx` and
  `app/dashboard/LogoutButton.tsx` for the pattern.
- API routes return `{ error: string }` on failure with an appropriate status
  code, `{ ...data }` on success — kept consistent across all `/api/auth/*`
  routes.
- Cookie name and other shared constants live in `lib/session-cookie.ts`
  rather than being repeated as string literals.

## Next.js version note

@AGENTS.md
