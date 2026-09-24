# Recovery Checklist — Features and Design Decisions, Current State

*Built to verify against wherever Claude Code's reverted state actually landed. Organised by functional area. Where something went through multiple revisions, only the FINAL, current state is listed — earlier intermediate versions are deliberately not included, to avoid rebuilding toward something already superseded.*

---

## 1. Core app infrastructure (pre-existing, before this term's design work)

- [ ] Team registration
- [ ] Team login
- [ ] Session handling (logout, current-session/"me" check)

## 2. The unlock/prerequisite-gating system

- [ ] Most actions (~27) are **Tier 0** — no real prerequisite, available from week one
- [ ] **Tier 1** (one prerequisite each): vehicle registration (needs traffic camera footage); property search (needs comparative forensic review); four general re-interviews — Nigel ×2, Swayne, Haddad — each needs its own initial interview pulled first
- [ ] **Tier 2**: interim interview + all three Burgess cell site reports, gated on property search naming Burgess **and** pulling his initial 2019 interview (two-part gate)
- [ ] **Tier 3** — the endgame: gated on **all five**: bus records, Paget Street doorbell canvass, comparative tool-mark review, property search naming Burgess, vehicle registration. 12 points total.
- [ ] Locked actions shown **greyed out with their requirement named**, not hidden
- [ ] Only the **immediate next locked step** is ever shown — not the whole future chain (avoids spoiling the mystery structure by revealing who matters before it's earned)
- [ ] Grouped by **case** (Mason / Wooley / Porterhouse / Butt) on the unlock screen, not by narrative chain

## 3. Action economy

- [ ] Baseline: 1 point/student/week
- [ ] Trust bonus: 0–3 added from team average quiz scores, resets weekly
- [ ] Banking: 2 unspent points → 1 reserve point (team-shared)
- [ ] Reserve spendable by anyone, confirmation prompt required
- [ ] Duplicate actions show "already investigated" but don't block re-running

## 4. Evidence availability categories

- [ ] **Category 0 — never distributed:** the case bible's "true solution" section. Must never appear in any student-facing material or prompt.
- [ ] **Category 1 — free from Week 9, all four cases at once (not staged):** policy logs, FLO logs, canvass summaries, missing person report, maps, homicide-rate background
- [ ] **Victim biographies specifically — free from Week 3**, ahead of the rest of Category 1
- [ ] **Category 2 — free but time-released:** Sara Butt's follow-up forensic report (strangulation finding), released Week 10/11 not Week 9 — preserves the "undermines Ferris's own memo" pattern-matching moment. Carries the same small cost as other forensic reports once its time-gate opens.
- [ ] **Institutional inertia — forensic reports:** all four initial reports + the Butt follow-up cost 1 point each despite no investigative gating (reflects the force's initial distrust of outside consultants)
- [ ] **Institutional inertia — initial interviews:** Burgess/Nigel/Haddad/Swayne's original interviews each cost 1 point, no gating, and **these gate the general re-interviews** (see Section 2, Tier 1)

## 5. The property search mechanic (tool-mark chain)

- [ ] Renamed from "search toolkit" to neutral **"search a named suspect's property (home and workplace)"**
- [ ] **Three-way comparison**, not Burgess-only, 2 points each, run separately per suspect:
  - Burgess — van + flat → matching spanner (the real weapon)
  - Nigel — flat → surveyor's levelling pole (ruled out by **shape**) *and* an ordinary household toolkit with its own spanner (ruled out by **wear pattern**, not shape — ordinary infrequent use, no anomalous cleaning)
  - Swayne — flat → old claw hammer (ruled out by shape/wound pattern)
- [ ] Burgess's version resolves via **PACE s.8 warrant** when reached through the interim interview path; the endgame's version is the separate **PACE s.32** arrest search — kept distinct so nothing contradicts Appendix H

## 6. Burgess's interview structure — two tiers, not three

- [ ] **Tier 1 (low evidence): interim interview (Appendix L)** — voluntary, under caution, gated on property search naming him **and** pulling his initial 2019 interview. 1 point, reachable at 6 points cumulative.
- [ ] **Tier 2 (full evidence): arrest interview (Appendix H)** — gated on all five endgame prerequisites, 12 points cumulative
- [ ] The generic "re-interview Martin Burgess" action is **retired** — a third, lower tier was considered and explicitly walked back as redundant

## 7. Cell site data and exhibits — final states specifically

- [ ] Five individual exhibit images exist (Burgess ×3, Nigel, Swayne), each with its own visual file, gated identically to its written report
- [ ] Markers are **transparent rings** (colour + white inner ring for contrast), not solid icons — map detail must be visible through them
- [ ] Zone fill is **low opacity** (~40/255 alpha) — street names and house labels underneath must stay legible
- [ ] **Burgess/Mason exhibit — current final state**: three pings across the **afternoon only** — entering Boresfield via Chertsey Street (~15:18), the booked job at Mason's (15:31–16:20), leaving via Harrison Road (~16:33). **No evening zone at all** — he left his phone behind for the return trip to the marsh; this is explained in the written report's text, with **no visual "no data" tag on the image itself** (explicitly removed on request)
- [ ] **Nigel/Butt exhibit — current final state**: **two zones only** (Featherton home, marsh northern approach) — a third "transit sector" was tried and explicitly reverted for unrealistic mast-spacing (real masts cover far larger areas than a tight three-point cluster implied)
- [ ] **Swayne/Porterhouse exhibit**: single stationary zone covering both his flat and Porterhouse's address — unchanged since original build
- [ ] **Burgess/Wooley and Burgess/Butt exhibits**: unchanged since original build (single zone; three-zone route respectively)
- [ ] ANPR entries exist for Burgess (vehicle history + full sweep near the Mason scene, returning known unrelated vehicles as noise) and Haddad (targeted Marsh Road check + Featherton sweep, which returns one **deliberately unresolved unmatched plate** — not explained away)

## 8. The evidence board / corkboard — designed, not yet built

- [ ] Two zones on one page: organised **case sections** (top, permanent, everything unlocked lives here) and a bounded **corkboard** (bottom, free arrangement)
- [ ] Pinning is a **deliberate student choice**, not automatic, and **copies** the item — the original stays in its case section
- [ ] **Bounded** canvas (not infinite), pannable/zoomable — built on **React Flow (xyflow)**
- [ ] Connections: drag between cards, **prompts for a short text label** describing the relationship — the annotation belongs to the connection, not just a line
- [ ] Optional short **card-level note** per pinned item, separate from connection labels
- [ ] **Two-tier interaction**: hover = quick preview (title, one-line summary, thumbnail for image exhibits); click = full document in a panel/modal
- [ ] Icons show **evidence type** (speech-bubble/document/phone-signal) plus **suspect colour-coding**: Burgess red, Nigel blue, Swayne amber, **Haddad — new, a muted teal/green, not yet finalised**. Non-suspect-specific evidence stays neutral grey.
- [ ] **Save-and-reload sync**, deliberately not true live/websocket sync — team-scoped, one board per team

## 9. Quizzes and activities — seven built

- [ ] **Week 2** — trustworthiness ranking (two-stage)
- [ ] **Week 3** — referencing, foundational: 4 recognition questions + 3 write-your-own tasks (journal article, book, government report, internal memo, newspaper, undated website, book chapter within an edited collection)
- [ ] **PACE quiz** — 6 questions (Police week)
- [ ] **CPS quiz** — 5 questions (a sixth, Hollenbourne-specific question was cut on request)
- [ ] **Argument formation** — 2 activities (council funding, force structure); Stage 1 is scorable multiple-select, Stage 2 stays offline/unscored
- [ ] **Prisons quiz** — 9 questions, 3 parts: real reoffending-by-sentence-type data with a genuine selection-effects trap; a dual-axis chart testing construction literacy (axis-scale distortion, not a correlation illusion); a referencing section
- [ ] **Dark figure of crime quiz** — 13 questions, 4 stages: two real ONS charts, one explicitly-illustrative Hollenbourne chart, a referencing section
- [ ] Both referencing sections (Prisons, Dark Figure) use the same consistent shape: **two real sources correctly cited, one fictional/illustrative source correctly refused** — and **stay multiple choice**, deliberately not upgraded to the AI-graded free-text version (see Section 10)

## 10. Referencing AI-grading feature — Week 3 specifically, spec written, not built

- [ ] **Free-text input**, not multiple choice, for Week 3 only
- [ ] AI-assisted grading via the **Anthropic API**, called server-side (Claude Sonnet)
- [ ] Structured JSON response: per-element status (author / year / title / publication details / access details) plus a short note each
- [ ] Explicit decision: **Prisons and Dark Figure's referencing sections are not converted** to this — they're lighter refreshers, multiple choice is the right amount of friction for that role
- [ ] Requires its **own separate API billing account** (console.anthropic.com) — a Claude Pro subscription does not provide this

## 11. The endgame — offline, not in-app

- [ ] Short form: 3 questions × 4 cases (who / what charge / what evidence)
- [ ] Hand-graded by Chris against a rubric: 3 pts correct + strong evidence; 1–2 pts correct + thin evidence; 0 pts wrong but hedged; **−2 pts wrong and confidently charged**
- [ ] "Correct" for Porterhouse means recognising it as a separate case — naming Kato/Reece is never required or expected
- [ ] Awards: Case Closed, Sharpest Read, Most Thorough Investigation
- [ ] **No in-app mechanism needed for any of this**

## 12. Visual/design language

- [ ] The published prototype artifact ("Hollenbourne Case Review") already implements a strong version of this — IBM Plex Sans/Mono plus Special Elite (typewriter) for the case-file aesthetic, warm ink/cream palette — treat as the reference to reuse, not rebuild from scratch
- [ ] Suspect colours (also used on the evidence board, Section 8): Burgess red `#a13d2f`, Nigel blue `#3a5a78`, Swayne amber `#b7781e`

## 13. Content consistency fixes made this term (worth spot-checking post-revert)

- [ ] "Harrison Road," not "Harrison Street" (both the interim interview and established geography)
- [ ] "Paget Street, North Hollenbourne," not "Featherton doorbell canvass" (renamed throughout); Butt-night bus boarding is **8:52pm**, not 9:52pm (the Mason-night 9:52pm is a separate, correct, unrelated coincidence — do not "fix" that one)
- [ ] Nigel's dog is **Baxter**, not Maxwell, consistently
- [ ] **DS Ferris** conducts interviews throughout — the separately-published prototype artifact has a "DS Fenwick" for the Porterhouse arrests, which was flagged as a discrepancy to resolve, defaulting to Ferris unless deliberately overridden

---

*Thirteen sections. If Claude Code's current state is missing large parts of 5 through 11, that's consistent with a revert to somewhere around the original team-auth-only build — everything in those sections was designed and, where marked, built during this term's later sessions.*
