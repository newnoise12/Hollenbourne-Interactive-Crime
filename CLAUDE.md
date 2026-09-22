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

## Current state (as of last session)

**Built and verified working end-to-end:**
- Team registration, login, logout, session handling — all API routes
  (`app/api/auth/*`) and pages (`app/login`, `app/dashboard`) tested both as
  unit tests and over real HTTP.
- The case log (evidence board, `app/dashboard/case-log`) and weekly action
  economy (`app/dashboard/actions`) — ported from the earlier
  browser-local-storage prototypes (kept for reference in `Reference/`),
  now backed by the real database (`evidenceCitations`,
  `weekActionState`/`actionLog`). Citation validation lives in
  `lib/citation-validation.ts` and runs both client-side (live field
  feedback) and server-side (`lib/evidence.ts`, defense in depth).
- The Week 2 trustworthiness-ranking quiz (`app/dashboard/quiz`), content
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
  `app/dashboard/quiz/[quizId]` (one dynamic route rendering `McqQuiz.tsx`
  or `MultiselectQuiz.tsx` depending on the quiz's `kind`). `score`/
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
- Production build passes clean (`npx next build`), TypeScript and ESLint
  both clean.

**Not yet built — the next work:**
- Week 3's referencing/"Cite Them Right" activity — the one week-by-week
  table entry with no quiz recovered from either content source yet. A
  `week3-referencing-quiz.md` draft exists in
  `Reference/case-content/quizzes/`, but per CLAUDE.md's earlier notes this
  may actually need an AI-graded format (a rotated Anthropic API key), not
  a scored mcq/multiselect quiz like weeks 4-6 — worth checking that draft
  before assuming it fits the existing pattern.
- Further weeks beyond 6 (7-11) have no quiz content recovered from either
  source yet, beyond what `hollenbourne-activity-plan.md`'s table names.
- The disconnected OneDrive copy this content was recovered from
  (`C:\Users\CrisW\dev\hollenbourne-app`) still exists and hasn't been
  cleaned up — safe to delete once its content is confirmed fully migrated,
  but not yet done.

## Env vars

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
checking for a published artifact) already happened once.

## Decisions worth knowing (so they don't get re-litigated)

- **Drizzle, not Prisma**: Prisma needs to download a query-engine binary
  from its own CDN at install/migrate time — a real fragility risk in
  restricted network environments (CI runners, some hosting platforms).
  Drizzle's migrations are plain SQL files, no external binary dependency.
- **No `next/font/google`**: same reasoning — fetching fonts from Google at
  *build* time means a network hiccup during deployment can break the build.
  Using the system font stack instead removes that risk entirely.
- **SQLite locally, Postgres in production**: when deploying (Railway or
  Render), swap `db/client.ts` for a Postgres driver
  (`drizzle-orm/node-postgres` or `drizzle-orm/postgres-js`) and re-run
  migrations against the new database. The schema file barely changes.
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
