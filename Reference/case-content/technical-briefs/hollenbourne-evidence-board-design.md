# Evidence Board Design Spec — Corkboard and Connections

*Consolidates a full design conversation into one spec. Two zones on one page: an organised "filing cabinet" of everything unlocked so far, and a bounded, freely-arrangeable "corkboard" below it where students pin what they think matters and draw labelled connections between items. Built on React Flow (xyflow) rather than a custom canvas — it already solves drag physics, edges that follow moving nodes, and connection-creation UX, so this is wiring up a library, not building one.*

---

## The two zones

**Top: organised sections, one per case (Mason / Wooley / Porterhouse / Butt).** Every unlocked evidence item lives here, permanently, in the same structure students already know from how evidence has been organised throughout. This is the reliable reference — nothing here ever moves or disappears.

**Bottom: a bounded corkboard.** Students choose to pin items down here — an explicit, deliberate action, not automatic. Pinning **copies** the item; the original stays in its case section above. The corkboard is where students do actual reasoning: arranging spatially, grouping, and drawing connections.

Bounded, not infinite — a fixed-size pannable/zoomable canvas (React Flow supports this natively), closer to how a real corkboard works and prevents the board sprawling into something unmanageable once a lot has been pinned.

## Evidence cards — two-tier interaction

Cards on the board (and arguably in the organised sections too, for consistency) are small — a symbol, a colour cue, and a short label, not the full document:

- **Icon indicates evidence type**: a speech-bubble for interviews, a document icon for reports, a phone/signal icon for cell site or ANPR data
- **Colour indicates suspect**, reusing the palette already established in the cell site exhibits: Burgess red, Nigel blue, Swayne amber. Haddad needs a fourth colour to complete the set — suggest a muted teal/green, distinct from the other three and not clashing with any of them. Evidence that isn't suspect-specific (initial forensic reports, policy logs, the missing person report) stays neutral grey rather than being forced into one of the four.
- **Label**: person plus a brief descriptor (e.g. "Burgess — interim interview"), not the full title

**Hover** shows a quick preview: title, a one-line summary, and a thumbnail for image-based exhibits (cell site maps, charts). Fast enough to scan the whole board without committing to opening anything.

**Click** opens the full document in a panel or modal — the actual interview transcript, report, or exhibit image at full size. Nothing is harder to read than it already is; the small card is purely a board-scanning aid, not a replacement for the real document.

## Connections

Students draw a connection by dragging from one card to another. Creating a connection **prompts for a short text label** — "same weapon type," "alibi conflict," "worth checking together." The annotation belongs to the *relationship*, not just floating text on the board, which keeps the board meaningful rather than decorative.

## Card-level notes

Each pinned card can optionally take a short sticky-note-style comment of its own — separate from connection labels, just a note-to-self on that one piece of evidence.

## Sync model: save-and-reload, not live

**Decided: not true real-time sync.** Changes save and everyone sees the current state on reload, rather than watching a teammate drag a card live. True live sync needs websockets and meaningfully more engineering complexity; for a team of 4–5 working mostly asynchronously, save-and-reload delivers nearly all the real value at a fraction of the build cost. Revisit only if playtesting shows the lack of live presence is actually a problem in practice, rather than building for it pre-emptively.

## Data model implications, for whoever builds this

- A **pin** is a reference to an evidence item plus board position (x/y coordinates) plus which team it belongs to — not a duplicate of the underlying content, so edits to the source document don't need to propagate to N copies.
- A **connection** is its own record: two pin IDs plus a label string.
- A **card note** is a pin-level optional text field.
- Team-scoped throughout — one board per team, not shared globally.

## What this deliberately doesn't do

No automated evidence-appears-on-board behaviour — pinning is always a manual, deliberate student action, per the earlier decision that curation itself should be a small moment of judgement. No live cursors or presence indicators, per the sync decision above. No AI-assisted connection suggestions — this is a space for students' own reasoning, not something the system should pre-empt.
