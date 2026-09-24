# Prompt for Claude Code — Building the Hollenbourne Case Review App

*Copy-paste this into Claude Code once the handoff folder is in place alongside the existing app repo.*

---

I'm building "The Hollenbourne Case" — a term-long interactive case-review game for a first-year criminology module (CRM_4_BCR) at LSBU. Students act as consultants reviewing a police force's handling of a connected set of unsolved and solved deaths. There's an existing partial Next.js app already in this repo (team registration, login, sessions — check `CLAUDE.md` and the current codebase for what's already built before assuming anything).

I've just added a `hollenbourne-handoff/` folder with everything needed to build the rest of it. Please read before writing any code:

- **`mechanics/hollenbourne-unlock-tree.md` first, above everything else.** This is the authoritative, consolidated breakdown of every costed action in the game and exactly how they gate each other. It also has an important finding worth knowing before you scope the work: most of the ~27 actions have no real prerequisite at all — the actual "prerequisite engine" problem is small and concentrated in a handful of chains (the Mason movements chain, the tool-mark/property-search chain, the Haddad/Wooley cross-reference, and the endgame's five-way convergence). Don't over-build a generic dependency system for what's mostly a flat list.
- **`prototype-reference/index.html`** is a working single-file prototype, already implementing team gating, a points/reserve strip, tabbed navigation, and a genuinely gated evidence board with real content. It's not the target architecture (no real persistence, single file) but it's a strong, tested reference for visual design, gating logic as actually-working JS, and UI copy — read its README first, then look at how it structures the evidence-gating before designing your own data model from scratch. Reuse its design language (the `IBM Plex Sans`/`Special Elite` typewriter aesthetic, the warm ink/cream palette) unless there's a good reason not to.
- **`mechanics/hollenbourne-action-economy.md`** and **`mechanics/hollenbourne-evidence-overview.md`** for the full cost/gating detail and the baseline-vs-costed-vs-time-released breakdown (some evidence is free from week one, some unlocks on a timer regardless of points, most costs points and is gated).
- **`case/`** for all narrative content — the case bible, interview transcripts, procedural documents, cell site/ANPR reports. This is what actually populates the evidence board.
- **`quizzes/`** for the seven quiz/activity documents that need building into the app (Week 2 through Prisons week — Probation is the one still-open gap, not included here).
- **`technical-briefs/hollenbourne-claude-code-referencing-brief.md`** is a fully-specified, ready-to-build feature: AI-graded free-text reference formatting, using the Anthropic API server-side. It includes the exact JSON response shape, prompt template, and all seven practice items already written out. API credentials are set up separately — ask if you need confirmation they're in place before wiring this in.
- **`visuals/`** — maps, cell site exhibits, quiz charts, already referenced by filename throughout the markdown docs.

**One content discrepancy to resolve, not a coding question:** the prototype has a "DS Fenwick" conducting the Haddad and Swayne Porterhouse arrest interviews, where `case/` consistently uses DS Ferris throughout. Default to Ferris for consistency with the authoritative case documents unless I tell you otherwise — flag it back to me rather than silently picking one if it matters for how you're structuring the data.

**What needs building, roughly in the order I'd prioritise it, though push back if you see a better sequence once you've looked at the existing codebase:**

1. The prerequisite-gating engine itself — small in scope per the unlock tree's own analysis, but nothing else works properly without it
2. The evidence board UI — the prototype is a strong direct reference
3. The action economy / points system (weekly baseline, trust bonus, banking, reserve — spec'd in the action economy doc)
4. Quiz integration for the seven built quizzes
5. The referencing AI-grading feature (fully spec'd, ready to build as its own contained piece)
6. Individual student identity within teams (needed for the trust-quiz bonus and the referencing feature to attribute submissions correctly)
7. Instructor dashboard

Before writing code: read the unlock tree and the prototype, then tell me your proposed build plan and ask whatever clarifying questions you have about the existing codebase's current state — I'd rather settle architecture questions up front than have you guess and rework later.
