# Technical Brief for Claude Code: CW2 Draft Feedback Tool (v2)

*Supersedes the earlier version — same core infrastructure and guardrails, now built against the full feedback philosophy worked out in hollenbourne-cw2-feedback-philosophy.md. Read that document first — this brief implements it, it doesn't restate it.*

---

## Unchanged from v1 — still non-negotiable

- **Formative only, never the grade.** Persistent banner on every screen. Never seen by whoever marks the real submission.
- **Fixed disclaimer string**, hardcoded by the app, never AI-generated: *"This is formative feedback only and does not indicate or predict your final grade."*
- Same Anthropic API setup as the Week 3 referencing checker — same account, same server-side call pattern, same JSON-only response instruction with parse-error fallback.

## What's new: the form structure itself

The mock pack (hollenbourne-mock-cw2-pack.md) is now three sequential data-type steps (statistical, textual, documentary — visual not yet included, see that document's note) followed by a synthesis step. Build the checkpoint logic around this exact structure, not the earlier single-submission model.

**Per-data-type checkpoint** — fires once per completed step (citation fields + description + interpretation together, one call):

1. **Citation** — check both the parenthetical and narrative in-text forms separately, plus the full bibliographic reference. Reuse the Week 3 checker's grading logic and JSON shape rather than rebuilding it.
2. **Description accuracy** — is the source read correctly on its own terms.
3. **Plausibility of the interpretation** — this is where Principle 9 matters most: the check must assess whether the reasoning connecting evidence to claim actually holds, not just detect hedging words. "This could suggest X" must still fail if X doesn't follow from the evidence, hedged language notwithstanding. Write this into the prompt explicitly — it's the easiest principle in the whole philosophy to accidentally implement wrong.
4. **Sufficiency statement, then Socratic prompt** — two structurally separate fields, never blended into one sentence (Principle 2).

**Synthesis checkpoint** — fires once, after all three data-type steps are complete:

1. **Relationship check** — connection-found and genuine-tension are both valid passes (Principle 7). The check should never require a clean connection to exist.
2. **Reasoning-gap check** — explicit here, not folded into plausibility the way it is at the per-data-type stage (Principle 8). Does each step from evidence to stated conclusion actually follow.
3. Same sufficiency-then-Socratic structure as above.

## Updated JSON shape

```json
{
  "checkpoint_type": "data_type" | "synthesis",
  "citation": { "parenthetical": "correct" | "flawed" | "missing", "narrative": "correct" | "flawed" | "missing", "bibliographic": "correct" | "flawed" | "missing", "note": "string" },
  "description_accuracy": { "status": "correct" | "flawed" | "missing", "note": "string" },
  "plausibility_or_reasoning": { "status": "sound" | "gap_found", "sufficiency_statement": "string", "socratic_prompt": "string" },
  "multiplicity": { "status": "present" | "absent", "note": "string" },
  "note": "This is formative feedback only and does not indicate or predict your final grade."
}
```

`citation` only applies to data-type checkpoints, not synthesis. `multiplicity` checks for genuine alternative readings per Principle 3 — reward holding two plausible claims open, don't penalise a hedge just because it's phrased cautiously (Principle 6 — read the full sentence, not a fragment, before deciding something's missing).

## The system prompt should include the two worked examples in full

Both examples in the philosophy document — including the corrected mistake in Worked Example 1 — should go into the model's system prompt as concrete calibration, not just be summarised as rules. The specific failure (isolating a fragment, missing the hedge sitting right next to it) is more instructive as a shown example than as an abstract instruction to "read carefully."

## Unchanged: rate/cost considerations

Same as v1 — longer text per submission than the Week 3 checker, still modest at this volume, multiple attempts encouraged with a sensible daily cap rather than an unlimited retry loop.
