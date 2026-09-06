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
It also documents a case detail not yet in the app: a fourth victim, Sara
Butt, not currently modelled in `lib/actions-catalog.ts`.

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
- Production build passes clean (`npx next build`), TypeScript and ESLint
  both clean.

**Not yet built — the next work:**
- Trust activities for weeks other than Week 2, per the spec in
  `Reference/hollenbourne-activity-plan.md`'s week-by-week table (Week 3
  referencing, Week 4 crime-data quiz, Week 5 PACE quiz, Week 6 argument-
  formation quiz, etc.) — same pattern as Week 2
  (`lib/quiz-catalog.ts` → `lib/quiz.ts` → `app/dashboard/quiz`), currently
  hardcoded to the one Week 2 quiz and would need generalizing (or
  duplicating) once content for another week is written. Actual content
  (readings, quiz questions, etc.) still needs authoring per week before
  any of this can be built — the table names the topic/skill, not the
  content itself.
- Sara Butt (4th victim, per the activity plan) isn't represented in
  `lib/actions-catalog.ts`'s re-interview/investigation actions yet.

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
