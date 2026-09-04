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

## Architecture

- **Next.js (App Router)** + TypeScript + Tailwind
- **Drizzle ORM**, SQLite locally (`better-sqlite3`) — deliberately not Prisma,
  see "Decisions worth knowing" below
- **Auth**: team-based, not per-student. One shared name+passcode login per
  team (bcrypt-hashed passcode), session via HTTP-only cookie, 30-day expiry.
- **Data model** (`db/schema.ts`): teams, sessions, weekly action-point state
  (resets each week — this is deliberate, matches the game's trust mechanic),
  a permanent action log (does NOT reset), evidence citations per team, quiz
  attempts.

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
  `quizAttempts`. Up to `MAX_ATTEMPTS` (3, `lib/quiz-catalog.ts`) attempts
  per team — `lib/quiz.ts` rejects a submission past that. Submitting shows
  an in-page confirmation panel first (not `window.confirm` — that gets
  silently suppressed by some automated/controlled browsers, confirmed
  during testing) naming which attempt this is and how many are left.
  **This quiz is the institutional-review activity**: the *best* score
  across all attempts (not just the latest) is written as that team's Week
  2 trust bonus via `setTrustBonus` in `lib/actions.ts` — confirmed
  end-to-end, including that a worse later attempt doesn't lower an
  already-earned trust bonus. The manual trust-bonus +/- control on the actions
  page still exists for weeks without a quiz behind them yet.
- The instructor dashboard (`app/instructor`) — read-only cross-team view,
  gated by a single shared passcode (`INSTRUCTOR_PASSCODE_HASH` env var,
  bcrypt-hashed, checked in `lib/instructor-auth.ts`) rather than per-team
  accounts, since there's no real "instructor" entity to attach a passcode
  to. Sessions use a separate table/cookie (`instructorSessions`,
  `INSTRUCTOR_SESSION_COOKIE_NAME`) from team sessions, so an instructor and
  a team can be logged in in the same browser without clobbering each other
  — confirmed. `/instructor` lists every team with a summary (exhibits
  cited, quiz score, actions taken); `/instructor/teams/[teamId]` shows full
  detail by reusing the same query functions the team-facing pages already
  use (`getCitationsForTeam`, `getAllWeekState`/`getActionLog`,
  `getQuizAttempt`) — no parallel data layer. Read-only by design; no
  grading/override UI.
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

## Windows/OneDrive dev note

This repo lives inside a synced OneDrive folder. Turbopack's persistent
cache (`.next/cache`) has been seen to corrupt here (`Failed to restore
meta for task...` panics) — most likely `next build` and `next dev` fighting
over the same `.next` directory, or OneDrive syncing mid-write. If the dev
server or build starts throwing Turbopack `TurbopackInternalError`s: stop
the dev server first, `rm -rf .next node_modules/.cache`, then restart.
Never run `next build` while `next dev` is running against the same
`.next` directory.

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
