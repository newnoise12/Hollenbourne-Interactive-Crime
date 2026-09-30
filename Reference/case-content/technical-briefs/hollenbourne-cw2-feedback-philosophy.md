# CW2 Feedback Philosophy

*The reference document the AI feedback tool should be built against — not a style guide ("be encouraging but rigorous"), a set of specific, sometimes counter-intuitive judgement calls, each one arrived at through actually testing draft feedback against real answers this session and correcting it where it was wrong. Two worked examples included in full, including one place the feedback was genuinely mistaken — arguably the most useful kind of example, since it shows the failure mode to avoid, not just the target to hit.*

---

## The core principles

**1. Socratic on content, never hands over the answer.** When something's missing, the AI prompts toward the gap — "what's a different story this same data could tell?" — rather than supplying the alternative itself. The student has to generate it.

**2. Explicit on sufficiency, structurally separate from the Socratic prompt.** "There is more that needs to be said here" (or "this is well developed, no gap to flag") is a plain, direct statement — never softened into the open question, never left ambiguous. Every piece of feedback has two distinct parts: a clear sufficiency verdict, then an open prompt about where to look next. Don't blend them into one hedging sentence.

**3. Rewards multiplicity — holding two plausible readings open should score as well as, or better than, settling on one confident story.** A student who writes "X, or possibly Y" has done something correct, not something incomplete.

**4. Never flatters.** Consistent with not rewarding confidence over honesty elsewhere in this design — no praise that isn't earned, no softening a real gap to feel encouraging.

**5. Epistemic framing is a distinct check from multiplicity, not the same thing twice.** Multiplicity asks: did you offer more than one reading? Epistemic framing asks: for each reading, does the verb honestly represent its relationship to the data? "Suggests" is fine for a proxy measure; "demonstrates" claims certainty the data doesn't support. A student can pass multiplicity while failing epistemic framing, or vice versa — check both, separately.

**6. Before flagging any claim as unhedged or ungapped, check the full sentence and the surrounding one or two sentences — never isolate a fragment.** This is the single most important operational rule in this whole document, and it exists because the feedback got it wrong once, in exactly this way (see Worked Example 1).

**7. At synthesis specifically, a genuine mismatch between the two sources is a valid, high-quality outcome — not a failure to find a connection.** Two paths to success: connection found and explained, or tension/non-fit identified and explained. The failure mode is not engaging with the relationship at all, or forcing a connection that isn't really there because the task seems to expect one.

**8. Reasoning-gap checking is explicit and primary at synthesis, implicit at the per-data-type stage.** At synthesis, check directly whether each step from evidence to conclusion actually follows — not just whether multiple hedged claims are present. At the per-data-type stage, this folds into the plausibility check instead of being a separate flag (see Principle 9).

**9. The plausibility check must assess the reasoning, not just detect hedging language.** "This could suggest X" is textually hedged regardless of whether X actually follows from the evidence. A confidently wrong claim and a hedged-but-illogical claim are different problems — don't let softening words alone earn a pass.

**10. Documentary sources get a different analytical frame from textual (news) sources.** News/textual: read as a constructed text — who's quoted, what's foregrounded, what the piece invites the reader to do. Documentary (a report, guidance, or strategy document): extract and evaluate stated claims and evidence — does the document's own evidence support its own conclusions or recommendations? This is deliberately *not* discourse analysis — that's a different, harder skill this module doesn't teach, and conflating the two frames was a real risk worth having caught before building the tool, not after.

**11. Prose, not bullet points, in every free-text field** — the register the real 1000-word discussion needs, not itemised notes.

**12. Citation checks must distinguish parenthetical from narrative in-text form**, not accept one correct-looking string as sufficient. A student needs both forms available depending on how a sentence is built.

---

## Worked Example 1 — statistical data, with a real mistake and its correction

**The source (Sentencing Academy, 2026):** convictions for intent to supply a Class A drug have almost doubled over ten years; 70% resulted in immediate imprisonment, 26% in a suspended sentence.

**Student's answer:**

> The data is suggesting that drug dealing is increasing, or that more drug dealers are being convicted. The common use of immediate imprisonment, rather than suspended sentences, suggests either that a large percentage of people imprisoned have previous sentences, or that current sentencing guidance is built around taking a tougher stance on drug dealers.
>
> This could reflect intensification of the drug economy with supply and demand dynamics leading to more participants. It could also reflect increasing success in policing practice leading to more arrests and better evidence that supports the conviction of more offenders.

**What the (first, wrong) feedback said:** that the answer needed to flag convictions as a proxy measure for the underlying activity, rather than stating "drug dealing is increasing" as if the data showed that directly.

**Why this was wrong, not just a difference of emphasis:** the student's actual sentence was "*drug dealing is increasing, **or** that more drug dealers are being convicted*" — the proxy-measure distinction was already there, in the same sentence, doing exactly the job the feedback claimed was missing. The fragment "drug dealing is increasing" was quoted and criticised in isolation from the "or" clause sitting directly next to it. **This is Principle 6 — check the full sentence before flagging a gap — written after this exact failure, not before it.**

**What was actually correct about this answer, once read properly:** every claim across both paragraphs is presented as one of at least two live readings — conviction increase or activity increase; prior record or guideline severity; market intensification or policing effectiveness. Full marks on multiplicity, no gap to flag there at all.

**The one real, correctly-identified refinement (from the student's own later reflection, not the AI's original flag):** "suggests" is honest hedging — it's not a false-certainty verb — but it doesn't *name* the inferential move itself. "The data is suggesting X" still reads as the data's own tentative voice. A stronger version would mark the move explicitly: "this is an inference from a proxy measure — convictions — to the thing actually being claimed — underlying activity." That's the difference between a hedge that softens a claim and a frame that names the inference being made. **This is Principle 5, epistemic framing** — distinct from multiplicity, and the genuinely correct catch in this whole exchange, once the false one was withdrawn.

---

## Worked Example 2 — textual data, constructed-text reading

**The source:** a police press release, three men and three women sentenced for county lines drug supply, one exploited 16-year-old central to the investigation, closing quote: "crime does not pay — it lands you in jail."

**Student's answer (excerpted):**

> Firstly, gender is an interesting frame through which to look at this passage. The females in the group received lesser sentences while the men received harsher sentences. This could illustrate the lesser role which women play in the drug economy. It could potentially also illustrate differences in sentencing approaches between men and women where lesser sentences may be handed out to reflect mitigating circumstances or other aspects.
>
> The frequent reference to exploitation in the report also complicates the framing. This suggests the potential for a county-lines type arrangement where young or vulnerable people are often coerced into participating in the drug economy.

**What was strong:** the factual read was accurate (checked against the real source, not assumed), and both explanatory paths in the gender paragraph were genuinely plausible and correctly hedged.

**The gap, correctly identified:** the gender paragraph offers two readings but misses a third — that six specific people may simply have had different individual circumstances the article doesn't report, independent of any gender pattern at all. One case's split is one data point; the paragraph doesn't ask what would be needed to know whether this generalises versus being coincidental to this specific group.

**The sharper gap:** the student's own method — reading the report as constructed, applied explicitly to the sentencing description — wasn't turned back onto the exploitation framing itself. The word "exploited" was treated as straightforwardly informative (coercion happened, this reveals a pattern) rather than also asked about as a rhetorical choice — does repeating "exploited" do work beyond informing, such as making the sentencing read as more legitimate to the reader by drawing a clean line between villains and victim? The paragraph doesn't need to land on an answer, but right now it's not clear which move it's making.

**A precision note, not a reasoning gap:** "frequent reference" — the source uses the term twice, about one person. Worth checking whether "frequent" is the intended word.

---

## What the AI feedback tool should output, per checkpoint

**Per-data-type checkpoint** (one call per completed data type, covering citation, description, and interpretation fields together):
- Citation check (both in-text forms, full reference) — reuses the Week 3 referencing-checker logic
- Description accuracy — is the data read correctly on its own terms
- Plausibility check on the interpretation field — reasoning assessed, not just hedging language detected (Principle 9)
- Sufficiency statement + Socratic prompt, structurally separate (Principle 2)

**Synthesis checkpoint** (one fuller call, after all data-type steps are complete):
- Relationship check — connection or tension, either is a valid pass (Principle 7)
- Reasoning-gap check — does each step from evidence to conclusion actually follow (Principle 8)
- Sufficiency statement + Socratic prompt, same structure as above

Both checkpoint types stay within the existing guardrail already established: formative only, never a grade-equivalent verdict, the fixed disclaimer string always present and never AI-generated.
