# Hollenbourne Case Review

Team case-review portal for *Becoming a Criminologist* (CRM_4_BCR).

## Running it locally

```
npm install
npm run dev
```

Then visit http://localhost:3000 — it'll redirect you to `/login`.

The local database is a SQLite file (`dev.db`) created automatically the first
time you run a migration. If you ever need to recreate it from scratch:

```
npx drizzle-kit generate   # only needed after changing db/schema.ts
npx drizzle-kit migrate    # applies migrations to dev.db
```

To use the instructor dashboard (`/instructor`), add a passcode to
`.env.local` (gitignored):

```
node -e "require('bcryptjs').hash('your-passcode', 10).then(console.log)"
```

Copy the printed hash into `.env.local` as `INSTRUCTOR_PASSCODE_HASH=...` —
**backslash-escape every `$` in it** (e.g. `\$2b\$10\$...`), or Next.js's env
loader will silently mangle the hash (it treats bare `$word` as a variable
reference).

## What's built so far

- **Team accounts** — one shared login per team (name + passcode), not
  individual student logins. Passcodes are hashed, never stored in plain text.
- **Sessions** — cookie-based, 30-day expiry (a term shouldn't log anyone out
  mid-week).
- **`/dashboard` is a single-page tabbed app** — This Week / Investigation /
  Case Log, all mounted at once and toggled with `hidden` so switching tabs
  never loses in-progress state. No separate routes per feature.
- **This Week** — a Moodle-style front page: the module's current week,
  whichever quiz matches it embedded directly (gated once on a lightweight
  "who's answering" step, no passwords), what's newly unlocked, the team's
  progress, and every other week's quiz below for review/catch-up.
- **Investigation** — the weekly action economy (1 action point per
  student per week, a 0-3 trust bonus from that week's quiz average, a
  team-wide reserve that 2 unspent points can be banked into). ~45 actions,
  grouped into named narrative threads, each gated by prerequisites and/or
  a minimum week.
- **Case Log** — the evidence board, organised into permanent sections by
  case (one per victim, plus general/force-wide). ~19 baseline exhibits
  plus one linked exhibit per Investigation action, all readable in full
  once unlocked and pinnable to a corkboard (drag to arrange, drag between
  cards to connect with a labelled relationship). No citation exercise —
  citation is taught through the quizzes instead.
- **A module-wide "current week"**, instructor-controlled — gates both the
  evidence board's `unlocksWeek` items and the action economy's
  `availableFromWeek` items. Not calendar-derived, so an extension or a
  snow day doesn't need a code change.
- **Instructor dashboard** — `/instructor`, gated by a single shared
  passcode (see setup above, not per-team accounts). The current-week
  control lives here. Mostly read-only otherwise — a summary table of every
  team plus a per-team detail view (unlocked evidence, week-by-week action
  state, per-student quiz breakdown) — plus one write action: moving a
  student to a different team. A move only changes where they show up going
  forward; their past quiz attempts stay attributed to whichever team they
  were on when they took them, so it never changes an already-recorded
  week's trust bonus for either team.

## What's not built yet

The AI-graded free-text referencing feature for Week 3 (spec'd, not built —
blocked on a fresh Anthropic API key). Everything else from the original
punch list is built; see `CLAUDE.md`'s "Current state" section for the full,
detailed history of what was built when and why.

## Stack notes for later deployment

- **Drizzle ORM**, not Prisma — deliberately chosen. Prisma needs to
  download a query-engine binary from its own CDN at install/migrate time,
  which is a real fragility risk in restricted network environments (CI
  runners, some hosting platforms). Drizzle's migrations are plain SQL
  files with no external binary dependency.
- **No next/font/google** — same reasoning. Fetching fonts from Google at
  *build* time means a network hiccup during deployment can break the
  build. Using the system font stack instead removes that risk entirely.
- **SQLite locally, Postgres in production** — when you're ready to deploy
  (e.g. to Railway or Render), swap `db/client.ts` for a Postgres driver
  (`drizzle-orm/node-postgres` or `drizzle-orm/postgres-js`) and re-run
  migrations against the new database. The schema file itself barely
  changes.

## Known non-issues (checked, not ignored)

`npm audit` will show a handful of vulnerabilities. All of them are in
*development-only* tooling (Prisma's old CLI dependencies, esbuild's dev
server via drizzle-kit) — none are in code that runs in the actual deployed
app. Fixing them would mean downgrading to older, less-maintained package
versions, which is a worse trade for real reliability. Worth re-checking
`npm audit` periodically as dependencies update, but not urgent.
