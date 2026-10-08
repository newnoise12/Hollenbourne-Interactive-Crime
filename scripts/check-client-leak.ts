// Checks that locked case content never reaches a student's browser.
//
//   npm run build && npm run check:leak            # scans the built JavaScript
//   npm run check:leak -- --live http://localhost:3000   # also checks a fresh team's page data
//                                                        (needs a running server and the local dev.db)
//
// Every exhibit body, action result and action description is a "secret" unless the
// per-team view (lib/team-view.ts) legitimately sends it. The bundle must contain none
// of them; a brand-new team's page data must contain none that it hasn't unlocked.
// Fails (exit 1) on any hit.

import fs from "node:fs";
import path from "node:path";
import { ACTIONS } from "../lib/actions-catalog";
import { EVIDENCE } from "../lib/evidence-catalog";
import { buildTeamView } from "../lib/team-view";

// A quote-free, plain-ASCII run from a string: robust to the escaping a bundle or the
// page data applies to quotes and punctuation.
function marker(text: string): string | null {
  const runs = text.match(/[A-Za-z0-9 ,.:;()/\-]{36,}/g);
  if (!runs) return null;
  return runs.sort((a, b) => b.length - a.length)[0].trim().slice(0, 60);
}

type Secret = { where: string; marker: string };
const secrets: Secret[] = [];
const add = (where: string, text: string | undefined) => {
  if (!text) return;
  const m = marker(text);
  if (m && m.length >= 30) secrets.push({ where, marker: m });
};
for (const a of ACTIONS) {
  add(`outcome of ${a.id}`, a.outcome);
  add(`description of ${a.id}`, a.description);
}
for (const e of EVIDENCE) {
  add(`snippet of ${e.exhibit}`, e.snippet);
  for (const s of e.body ?? []) for (const p of s.paragraphs) add(`body of ${e.exhibit}`, p);
}

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.log("FAIL  " + msg);
};

// ---- 1. the built JavaScript ------------------------------------------------
const staticDir = path.join(__dirname, "..", ".next", "static");
if (!fs.existsSync(staticDir)) {
  console.log("SKIP  no .next/static — run `npm run build` first to check the browser bundle");
} else {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith(".js")) files.push(p);
    }
  };
  walk(staticDir);
  const blob = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  const hits = secrets.filter((s) => blob.includes(s.marker));
  console.log(`bundle: ${files.length} JS files scanned, ${secrets.length} case-content markers`);
  if (hits.length === 0) console.log("PASS  no exhibit or action text in the browser bundle");
  else for (const h of hits.slice(0, 10)) fail(`bundle contains ${h.where}: "${h.marker}"`);
  if (hits.length > 10) fail(`…and ${hits.length - 10} more`);
}

// ---- 2. a fresh team's page data (optional) ------------------------------
const liveIdx = process.argv.indexOf("--live");
if (liveIdx !== -1) {
  const base = process.argv[liveIdx + 1] ?? "http://localhost:3000";
  (async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    const db = new Database(path.join(__dirname, "..", "dev.db"));
    const currentWeek: number = db.prepare("select current_week as w from module_settings").get()?.w ?? 1;
    const name = `Leak Check ${Date.now()}`;
    const reg = await fetch(base + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, passcode: "leak-check-1" }),
    });
    const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
    const teamId = (await reg.json()).team?.id;
    try {
      const html = await (await fetch(base + "/dashboard", { headers: { cookie } })).text();
      const allowed = JSON.stringify(buildTeamView(new Set(), currentWeek));
      const hits = secrets.filter((s) => html.includes(s.marker) && !allowed.includes(s.marker));
      console.log(`page data: fresh team at week ${currentWeek}, ${html.length} bytes`);
      if (hits.length === 0) console.log("PASS  a fresh team's page contains no text it hasn't unlocked");
      else for (const h of hits.slice(0, 10)) fail(`page data contains ${h.where}: "${h.marker}"`);
    } finally {
      db.pragma("foreign_keys = ON");
      if (teamId) db.prepare("delete from teams where id = ?").run(teamId);
    }
    console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
    process.exit(failures === 0 ? 0 : 1);
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}
