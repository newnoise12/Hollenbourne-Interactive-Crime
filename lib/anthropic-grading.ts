// Shared helper for every AI-graded feedback feature (Week 3 Stage 2's
// referencing practice, the Mock CW2 practice tool) — calls the Anthropic
// Messages API and parses a strict-JSON response.
//
// Extracted after a real bug: claude-sonnet-5, given a long enough prompt,
// returns a "thinking" content block *before* the "text" block, so
// assuming content[0] is always the text block returns undefined. Finds
// the text block by type instead. Also strips a markdown code fence
// defensively, in case the model wraps the JSON despite being told not to.
//
// Reliability (found when "check my reference" kept erroring, 2026-10-05):
// - The org's API key has a cap on *concurrent* requests (it tripped at
//   roughly 25 in flight, "across all models"). A class pressing "check" at
//   once exceeds that, and the old retry fired instantly, so it was rejected
//   too. Calls now queue behind a small in-process limit, and a 429 / 5xx /
//   timeout is retried with back-off (honouring Retry-After) instead.
// - thinking + JSON sometimes ran past max_tokens, giving cut-off JSON. That
//   is now detected from stop_reason, and the retry gets a bigger budget.
// - Failures are logged with their real cause, so a generic "try again"
//   message to the student no longer hides what actually went wrong.

export class GradingError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
    readonly retryAfterMs?: number,
    readonly truncated = false
  ) {
    super(message);
  }
  /** Rate-limited or the API is overloaded — as opposed to a bug or a bad request. */
  get busy(): boolean {
    return this.status === 429 || this.status === 529;
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

// A simple counting semaphore. One Node process serves the whole site (a
// single Railway instance), so a process-level limit is enough to keep us
// under the org's concurrency cap; requests beyond it wait their turn rather
// than failing.
const MAX_CONCURRENT_CALLS = 10;
let inFlight = 0;
const waiters: (() => void)[] = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (inFlight < MAX_CONCURRENT_CALLS) {
    inFlight++;
  } else {
    await new Promise<void>((resolve) => waiters.push(resolve)); // the slot is handed straight to us
  }
  try {
    return await fn();
  } finally {
    const next = waiters.shift();
    if (next) next();
    else inFlight--;
  }
}

const REQUEST_TIMEOUT_MS = 120_000;

/** One call to Claude, requesting strict-JSON output. Throws a GradingError on any failure — retry is callClaudeForJsonWithRetry's job. */
export async function callClaudeForJson<T>(prompt: string, isValid: (value: unknown) => value is T, maxTokens = 1024, system?: string): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new GradingError("ANTHROPIC_API_KEY is not configured.", false);
  }

  return withSlot(async () => {
    let res: Response;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: maxTokens,
          ...(system ? { system } : {}),
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (e) {
      throw new GradingError(`Network error or timeout calling Anthropic: ${e instanceof Error ? e.message : String(e)}`, true);
    }

    if (!res.ok) {
      const retryAfterHeader = Number(res.headers.get("retry-after"));
      const retryAfterMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader * 1000 : undefined;
      // 429 (rate limit), 529 (overloaded) and 5xx are worth another go; a
      // 400/401/403/404 is a bug or a bad key and retrying can't fix it.
      const retryable = res.status === 429 || res.status >= 500;
      throw new GradingError(`Anthropic API returned ${res.status}`, retryable, res.status, retryAfterMs);
    }

    const data = await res.json();

    if (data?.stop_reason === "max_tokens") {
      throw new GradingError(`Response hit the ${maxTokens}-token limit and was cut off.`, true, undefined, undefined, true);
    }

    // A "thinking" block, when present, comes before the "text" block — find
    // the text block by type rather than assuming it's content[0].
    const content = Array.isArray(data?.content) ? data.content : [];
    const textBlock = content.find((block: { type?: string; text?: unknown }) => block?.type === "text");
    const text = textBlock?.text;
    if (typeof text !== "string") {
      throw new GradingError("Unexpected Anthropic response shape.", true);
    }

    let parsed: unknown;
    try {
      parsed = extractJson(text);
    } catch {
      throw new GradingError("Grading response wasn't valid JSON.", true);
    }
    if (!isValid(parsed)) {
      throw new GradingError("Grading response did not match the expected shape.", true);
    }
    return parsed;
  });
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * callClaudeForJson, retried on transient failures — default two attempts
 * (the technical brief's "one retry"), more where the caller's calls are
 * quick enough to afford it. Rate limits and overloads back off (honouring
 * Retry-After); a truncated response retries with double the token budget;
 * a non-retryable error (bad key, bad request) fails immediately.
 */
export async function callClaudeForJsonWithRetry<T>(
  prompt: string,
  isValid: (value: unknown) => value is T,
  maxTokens = 1024,
  system?: string,
  attempts = 2
): Promise<T> {
  let budget = maxTokens;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await callClaudeForJson(prompt, isValid, budget, system);
    } catch (e) {
      lastError = e;
      const err = e instanceof GradingError ? e : new GradingError(e instanceof Error ? e.message : String(e), true);
      const willRetry = err.retryable && attempt < attempts;
      console.error(`[ai-grading] attempt ${attempt}/${attempts} failed: ${err.message}${willRetry ? " — retrying" : ""}`);
      if (!willRetry) break;
      if (err.truncated) budget = Math.min(budget * 2, 16_000);
      const backoff = err.retryAfterMs ?? Math.min(8_000, 1_000 * 2 ** (attempt - 1));
      await sleep(backoff + Math.random() * 500);
    }
  }
  throw lastError;
}
