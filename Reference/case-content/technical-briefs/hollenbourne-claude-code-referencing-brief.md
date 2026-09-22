# Technical Brief for Claude Code: Referencing Practice Component

*For the Week 3 referencing quiz specifically (hollenbourne-week3-referencing-quiz.md) — the full teaching moment, not the lighter refreshers built into the Prisons and Dark Figure of Crime quizzes, which deliberately stay multiple choice (see below). The core problem: students should type a full Harvard reference from raw source facts, not select from multiple choice — but free-text citation checking can't reliably use exact string matching (acceptable minor variation in URLs, access dates, spacing) or simple regex (too brittle for something this structurally varied). This needs AI-assisted grading.*

---

## The feature

For each reference-practice item, students see:
1. **Raw source facts**, presented as a plain list (not pre-formatted) — e.g. "Author: Robinson, K., Ahmed, S. and Clarke, T. | Year: 2019 | Title: [article title] | Journal: International Journal of Offender Therapy and Comparative Criminology | Volume/Issue: 63(4) | Pages: 512–530"
2. **A single free-text input box** where the student types their attempted full Harvard reference, assembled from those facts
3. **A submit button**, which sends the student's attempt for grading
4. **Structured feedback**, returned per-element rather than a single pass/fail — see data shape below

## Why AI-assisted grading, not rule-based

Harvard references have five structural elements (author, year, title, publication details, access details), but the *exact* acceptable formatting varies enough — spacing, punctuation choices, how "et al." is handled, whether students write "pp." or "p.", minor URL formatting — that:
- **Exact string matching** would fail valid answers constantly
- **Regex/rule-based parsing** could check for the *presence* of elements reasonably well (is there a four-digit year in parentheses somewhere?) but can't reliably assess whether they're in the *right place*, correctly *formatted relative to each other*, or whether something present is actually *correct* (right author order, right title) rather than just present

An LLM call, given the raw facts, the correct reference, and the student's attempt, can assess all of this the way a human marker would — checking each element's presence, correctness, and formatting — while still being lenient on genuinely inconsequential variation (a trailing full stop, "and" vs "&").

## API call structure

Use the Anthropic Messages API (`claude-sonnet-4-6`), called server-side (never client-side — this needs the API key kept off the frontend). One call per submission.

**System/prompt should instruct the model to:**
1. Compare the student's submitted text against the known-correct reference for this item
2. Assess each of the five elements independently: author, year, title, publication details, access details (where applicable — not every source type needs all five, e.g. a print book has no access details)
3. For each element, return: whether it's correct, present-but-flawed, or missing, plus a one-sentence note on what's wrong if not fully correct
4. Be lenient on inconsequential formatting variation (spacing, "and" vs "&", trailing punctuation) but strict on structurally meaningful errors (wrong italicisation, missing required element, authors in wrong order, wrong date format)
5. Return **strictly structured JSON**, nothing else — no prose outside the JSON object, so the frontend can parse it reliably

**Requested JSON shape:**

```json
{
  "elements": {
    "author": { "status": "correct" | "flawed" | "missing", "note": "string" },
    "year": { "status": "correct" | "flawed" | "missing", "note": "string" },
    "title": { "status": "correct" | "flawed" | "missing", "note": "string" },
    "publication_details": { "status": "correct" | "flawed" | "missing", "note": "string" },
    "access_details": { "status": "correct" | "flawed" | "missing" | "not_applicable", "note": "string" }
  },
  "overall": "correct" | "mostly_correct" | "needs_work",
  "summary": "one or two sentence overall comment"
}
```

**Prompt template (fill in the bracketed parts per item):**

```
You are checking a student's attempt at a Harvard-style reference against the correct version, for a UK criminology module.

Raw source facts:
[raw facts for this item]

Correct reference:
[the correct reference, as given in the quiz document]

Student's submitted reference:
[student's raw text input]

Assess the student's submission against the five Harvard reference elements (author, year, title, publication details, access details — mark access details as "not_applicable" if this source type doesn't need them, e.g. a print book).

Be lenient on inconsequential formatting variation (spacing, "and" vs "&", trailing punctuation, minor capitalisation that doesn't change meaning). Be strict on structurally meaningful errors: missing elements, wrong italicisation, authors in the wrong order or incomplete, incorrect date format, missing "Available at"/"Accessed" for online sources.

Return ONLY the JSON object specified, no other text.
```

## Data needed — the four Stage 1 items and three Stage 2 tasks, ready to use

Pull these directly from hollenbourne-week3-referencing-quiz.md rather than re-deriving them:

1. **Journal article** — Robinson, K., Ahmed, S. and Clarke, T. (2019), International Journal of Offender Therapy and Comparative Criminology, 63(4), pp.512–530
2. **Book** — Newburn, T. (2017) *Criminology*, 3rd edn, Routledge, Abingdon
3. **Government report (online)** — Crown Prosecution Service (2024) *The Code for Crown Prosecutors*
4. **Internal institutional memo** — Ferris, H. (2025), internal memorandum — the awkward, no-clean-template case; grading here should accept any reasonable, honestly-labelled treatment rather than a single fixed correct string (see the quiz document's own Q4 answer for what counts as defensible)
5. **Newspaper article** — Chen, S. (2025) The Guardian, 14 March 2025
6. **Undated website** — Crown Prosecution Service, no date, explaining how the CPS works
7. **Book chapter in an edited collection** — Okafor, R. (2022) in Patel-Singh, J. (ed.) *Contemporary Approaches to Sentencing*, pp.88–104, Palgrave Macmillan, London

Item 4 needs a slightly different grading approach from the others — since the quiz's own answer for it is "there's no single correct format, only defensible vs indefensible treatment," the prompt for this one specifically should ask the model to assess *whether the student correctly identified this as an internal/personal-communication-style source and handled it honestly*, not check it against one fixed correct string.

## Reuse for the other two quizzes

**Decided: no.** The Prisons week and Dark Figure of Crime quizzes' referencing sections stay as multiple choice. Week 3 is where the skill is taught properly and deserves the full typed, AI-graded treatment; the later two are deliberately lighter-touch refreshers consolidating what was already learned, not a second full teaching moment — multiple choice is the right amount of friction for that job, and building the AI-grading component twice more for a refresher role isn't worth the added cost, latency, and rate-limit surface area for what it would add pedagogically.

## Cost and reliability implications, worked through

**Cost itself is trivial** — roughly £1 in API spend for one full class attempt at all 7 Week 3 items, even generously estimated (short prompts, short structured JSON responses). Not a meaningful constraint even accounting for retries.

**What actually matters instead:**
- **Claude Pro ≠ API access.** This needs proper Anthropic API credentials (console.anthropic.com, with billing set up) — a Claude Pro subscription login won't work for a server-side API call. Worth setting this up before the build starts.
- **Rate limits: not a real concern here.** This is a post-class activity, not a live synchronous one — students submit over hours or days in their own time, not all within the same few minutes of a classroom session. Basic error handling (retry once on failure) is still sensible practice, but there's no need to over-engineer a queue or burst-handling system for a concurrent-load scenario that won't actually occur.
- **Latency, not cost, is the UX concern.** Each submission is a genuine API round-trip (~1–3 seconds) — needs an honest loading state in the UI rather than feeling broken while it waits.
