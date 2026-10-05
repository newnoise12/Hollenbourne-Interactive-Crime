# Hollenbourne — The Unlock Tree

> **Superseded in part (2026-10-05, evidence gating pass).** Eight prerequisites were added that this document does not show: comparative forensic review ← pathology reports Mason AND Wooley; DNA retest ← Wooley pathology report; high street CCTV ← bus records; Paget Street canvass ← high street CCTV; Hollen Marsh 2019 ANPR sweep ← traffic camera; Featherton 2022 ANPR sweep ← Haddad Marsh Road ANPR check; Nigel and Swayne cell site ← their initial interviews. `lib/actions-catalog.ts` is the source of truth; `npm run check:actions` validates it.

*Every costed action in the game, pulled from across the action economy document into one place, organised by actual dependency rather than by which narrative thread it belongs to. This is the structure a "prerequisite gating" system needs to be built against. Three real inconsistencies turned up while consolidating — flagged inline, resolved with a reasonable default, but worth you confirming rather than treating as settled.*

---

## Tier 0 — no prerequisites, available from week one

These need no other action first. Some carry a nominal "gated behind X already being a suspect" note in the source document, but X is true from the start of the game for these specific people (Nigel and Swayne are original suspects; Haddad becomes a person of interest through the baseline Porterhouse case materials, not through an unlockable action) — so functionally, these are Tier 0 too, not real gates.

**Note: the four general re-interview actions (Nigel, Swayne, Haddad, and the Butt-evening Nigel interview) have moved out of this tier** — they now require pulling the relevant initial interview first. See Tier 1.

| Action | Cost | Unlocks |
|---|---|---|
| Pull initial interview — Martin Burgess (2019, Mason case) | 1 | → Contributes to gating the interim interview |
| Pull initial interview — Nigel Wooley (2022, Wooley case) | 1 | → Both Nigel re-interviews |
| Pull initial interview — Khalid Haddad (2023, Porterhouse case) | 1 | → General Haddad re-interview; further Wooley interview |
| Pull initial interview — Colin Swayne (2023, Porterhouse case) | 1 | → General Swayne re-interview |
| Retest DNA — Wooley scene | 2 | — |
| Pull phone data | 1 | — |
| Pull case-prioritisation memo | 2 | — |
| Witness canvass — Boresfield/Featherton | 1 | — |
| Re-interview homeowner after Wooley | 2 | — *(new witness, never previously interviewed — no initial-interview gate applies)* |
| Request traffic camera footage, Hollen Marsh access roads | 2 | → Run vehicle registration |
| Comparative forensic review — Mason/Wooley wound patterns | 3 | → Search a named suspect's property |
| Request bus operator CCTV/payment records | 2 | *(endgame prerequisite)* |
| Request Hollenbourne high street CCTV | 1 | *(supporting, see note below)* |
| Canvass Paget Street, North Hollenbourne, for doorbell footage | 2 | *(endgame prerequisite)* |
| Request full ANPR sweep — Hollen Marsh access roads, 8 Oct 2019 | 3 | — |
| Request full ANPR sweep — Featherton, 6 Jan 2022 | 2 | — |
| Pull forensic pathology report — Mason / Wooley / Porterhouse / Butt (initial) | 1 each | — *(available Week 9; see institutional inertia note below)* |
| Pull Sara Butt's follow-up forensic report (strangulation finding) | 1 | Time-gated to Week 10/11, not points-gated |
| Cell site — Nigel Wooley, 22 May 2025 | 1 | — |
| Cell site — Colin Swayne, 29 May 2023 | 2 | — |
| Operation Riverbank liaison — Colin Swayne | 2 | — |
| Haddad historical record (PNC/NRM) | 1 | — |
| ANPR check — Haddad's vehicle, Marsh Road, 6 Jan 2022 | 1 | — |
| Cross-reference Haddad's movement data against Wooley timeframe | 2 | → Further interview, Haddad re: Wooley |

---

## Tier 1 — gated behind one Tier 0 action

| Action | Cost | Gated behind | Unlocks |
|---|---|---|---|
| Run the vehicle registration | 1 | Traffic camera footage | → ANPR history for that vehicle; contributes to naming Burgess |
| Search a named suspect's property (home and workplace) — Burgess, Nigel, or Swayne, each 2 pts | 2 each | Comparative forensic review | If Burgess is named: object matches, → interim interview, → all three Burgess cell site reports. If Nigel or Swayne: a plausible object turns up but is forensically ruled out — no further unlock, the comparison itself is the point |

**Renamed from "search named suspect's toolkit"** — the old name told students what they were looking for before they'd looked. Now a genuine three-way property search: Nigel (a surveyor's levelling pole, *and* an ordinary household toolkit with a spanner ruled out on wear pattern rather than shape) and Swayne (an old claw hammer) both have something plausible that turns out not to match, so running this against only Burgess is a real, costly choice rather than the only sensible option — full detail in the action economy.
| Re-interview Nigel Wooley | 1 | Pull initial Nigel interview | — |
| Re-interview Nigel re: the Butt evening | 1 | Pull initial Nigel interview | — |
| Re-interview Colin Swayne | 1 | Pull initial Swayne interview | — |
| Re-interview Khalid Haddad | 2 | Pull initial Haddad interview | — |
| Further interview — Haddad re: Wooley | 1 | Cross-reference action; **and** pull initial Haddad interview | — |

**Burgess has two interview tiers, correctly — not three.** The interim interview (Appendix L, Tier 2 below) already is the low-evidence tier: voluntary, gated only on the tool-mark chain, well before arrest-level evidence. The arrest interview (Appendix H, Tier 3) is full evidence. The generic "Re-interview Martin Burgess" action from the source document is retired rather than kept as a third tier — it would have duplicated the interim interview's job rather than doing a distinct one.

---

## Tier 2 — gated behind naming Burgess specifically

**Consolidation note:** the source document listed several cell site actions as gated behind "Burgess already named via any other route," treated as a separate condition from the tool-mark chain. On inspection there's really only one established route to naming him — the property search above, once it's run against his name specifically. I've collapsed these into one clear gate rather than two vaguely-worded ones. If you want a genuinely separate second route to naming him, that's worth designing deliberately rather than leaving as an unspecified "any other route."

| Action | Cost | Gated behind |
|---|---|---|
| Interim interview — Martin Burgess, voluntary under caution | 1 | Toolkit search, naming Burgess; **and** pull initial Burgess interview |
| Cell site — Martin Burgess, 6 Jan 2022 (Wooley) | 3 | Toolkit search, naming Burgess |
| Cell site — Martin Burgess, 8 Oct 2019 (Mason) | 2 | Toolkit search, naming Burgess |
| Cell site — Martin Burgess, 22 May 2025 (Butt) | 2 | Toolkit search, naming Burgess |
| ANPR history for named vehicle, wider date range | 2 | Vehicle registration |

---

## Tier 3 — the endgame

| Action | Cost | Gated behind |
|---|---|---|
| Arrest and interview Burgess — Butt case | 2 | **All of:** bus records, Paget Street doorbell canvass, comparative tool-mark review, property search (naming Burgess), vehicle registration |

**A second inconsistency, worth a decision:** the endgame gate as written in the source names five prerequisites, but says "Featherton doorbell canvass" — the action itself was renamed to "Paget Street, North Hollenbourne" a while back and the gate description was never updated to match. I've corrected it above. Separately, "Request Hollenbourne high street CCTV" sits in the Butt movements chain but was never actually listed among the five official endgame prerequisites — it reads as a supporting/flavour action rather than a hard gate. Worth confirming that's intentional, since if it *should* be a sixth prerequisite, the endgame's total cost changes.

**Total cost to reach the endgame interview: 12 points** (10 across the five prerequisites, plus 2 for the action itself) — unchanged by the correction above, since it was always five items, just one had a stale name.

---

## The two flagged-for-retirement early actions

The source document flags two early, generic actions as likely superseded and recommends retiring them:

- ⚠️ Generic vehicle check — dark 4x4 (cost 1) — superseded by the properly-gated Mason movements chain (traffic camera → vehicle registration)
- ⚠️ Chase CCTV — Hollen Marsh car park (cost 1) — **retired (2026-10-05)**: it duplicated the now-built Mason traffic camera exhibit, and has been removed from the app

**Recommendation: retire both.** Keeping a cheap, ungated shortcut sitting alongside a properly-gated chain that reaches the same evidence undermines the whole point of the gating — a team would just take the cheap route. This is a genuine design decision rather than a consolidation fix, though, so flagging it here rather than just removing them.

---

## Shape of the whole tree, at a glance

- **~27 actions total** are genuinely Tier 0 (no real prerequisite) — five of these (the forensic reports) and four more (the initial interviews) carry a small institutional-friction cost despite having no investigative gating, distinct from the fully-free baseline material (policy logs, maps, missing person report)
- **7 actions** sit at Tier 1 (one prerequisite each) — up from 3, now that the four general re-interviews require their initial interview to be pulled first
- **5 actions** sit at Tier 2, all sharing the single "Burgess named" gate — the interim interview now carries a second gate too (the initial Burgess interview)
- **1 action** — the endgame itself — sits at Tier 3, gated behind five separate items converging

The practical implication for a gating system: most of the tree is flat and open from week one. The real *structure* — the part that needs an actual prerequisite engine rather than just a cost list — is small and concentrated: the Mason chain (2 steps), the tool-mark chain (which fans out into 5 Tier 2 unlocks once Burgess is named), the Haddad/Wooley cross-reference (2 steps), and the endgame's five-way convergence. Worth knowing that scope precisely before starting the build — this is a much smaller engineering problem than the total action count makes it look.
