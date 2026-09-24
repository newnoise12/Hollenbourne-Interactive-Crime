# Prompt for Claude Code — Recovery Verification Against the Checklist

*Copy-paste this into Claude Code.*

---

I've had an issue and the app appears to have reverted to an earlier state. I've added `hollenbourne-recovery-checklist.md` to the `hollenbourne-handoff/` folder — it's a comprehensive checklist of every feature and design decision across thirteen sections, covering the current state of everything we'd designed and built before this happened.

**The content files themselves (`case/`, `mechanics/`, `quizzes/`, `technical-briefs/`) are all intact and correct — you don't need to re-verify those.** The question is only whether the *app* currently reflects what they describe.

Please work through this in two passes, not one:

**Pass 1 — status check only, no changes yet.** Go through the checklist section by section (1 through 13) and report back, for each section, one of: *confirmed present and correct*, *partially present* (say what's there and what's missing), or *absent*. Don't fix anything yet — I want to see the actual damage before we start rebuilding, partly so we can figure out roughly how far back this reverted to.

One thing worth knowing before you do this pass: **Sections 8 (the evidence board) and 10 (the referencing AI-grading feature) were designed this term but may never have been built at all**, independent of whatever caused the revert — so if those come back "absent," don't treat that as confirmation of data loss on its own. Everything else in the checklist either predates this term's session (Section 1) or was actively being built during it, so absence there is more likely to actually be revert damage.

**Pass 2 — once I've seen the status report and confirmed what to do, work back through in checklist order, building or fixing whatever Pass 1 found missing.** For Sections 5, 6, and 7 especially (the property search mechanic, Burgess's two-tier interview structure, and the cell site exhibits' exact final states), match the checklist precisely — those sections specifically call out final states that were reached after several earlier versions were tried and deliberately reverted, so if you find an *older* version of any of that logic already sitting in the code, replace it with what the checklist specifies rather than assuming what's there is closer to correct just because it already exists.

Flag anything in the checklist that's ambiguous or that you need a decision on (Haddad's board colour is explicitly marked as not yet finalised, for instance) rather than guessing.
