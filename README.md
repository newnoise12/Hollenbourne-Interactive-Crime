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
- **Database** — six tables: teams, sessions, weekly action-point state
  (resets each week), a permanent action log (doesn't reset), evidence
  citations per team, and quiz attempts.
- **Case log (evidence board)** — `/dashboard/case-log`, backed by the
  `evidenceCitations` table. Citation validation (assisted-fields and
  free-text paths) runs both client- and server-side.
- **Weekly action economy** — `/dashboard/actions`, backed by
  `weekActionState`/`actionLog`. Trust bonus is a manual per-team control
  for weeks without a quiz driving it (see below).
- **Week 2 trust activity (quiz)** — `/dashboard/quiz`, backed by
  `quizAttempts`. One attempt per team; the score becomes that team's Week 2
  trust bonus automatically.
- **Instructor dashboard** — `/instructor`, gated by a single shared
  passcode (see setup above, not per-team accounts). Read-only: a summary
  table of every team plus a per-team detail view (citations, week-by-week
  action state, quiz answers).

## What's not built yet

Everything from the original punch list is built. The evidence board, action
economy, Week 2 quiz, and instructor dashboard have all been ported in from
earlier standalone-artifact versions (kept for reference in `Reference/`,
not part of the app build) — later weeks' trust activities would follow the
same pattern as the Week 2 quiz once their content exists.

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
