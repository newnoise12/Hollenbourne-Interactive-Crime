// Shared helper for every AI-graded feedback feature (Week 3 Stage 2's
// referencing practice, the Mock CW2 practice tool) — calls the Anthropic
// Messages API and parses a strict-JSON response.
//
// Extracted after a real bug: claude-sonnet-5, given a long enough prompt,
// returns a "thinking" content block *before* the "text" block, so
// assuming content[0] is always the text block returns undefined. Finds
// the text block by type instead. Also strips a markdown code fence
// defensively, in case the model wraps the JSON despite being told not to.

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

/** One call to Claude, requesting strict-JSON output. Throws on any failure — no retry here, see callClaudeForJsonWithRetry. */
export async function callClaudeForJson<T>(prompt: string, isValid: (value: unknown) => value is T, maxTokens = 1024): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API returned ${res.status}`);
  }

  const data = await res.json();
  // A "thinking" block, when present, comes before the "text" block — find
  // the text block by type rather than assuming it's content[0].
  const content = Array.isArray(data?.content) ? data.content : [];
  const textBlock = content.find((block: { type?: string; text?: unknown }) => block?.type === "text");
  const text = textBlock?.text;
  if (typeof text !== "string") {
    throw new Error("Unexpected Anthropic response shape.");
  }

  const parsed = extractJson(text);
  if (!isValid(parsed)) {
    throw new Error("Grading response did not match the expected shape.");
  }
  return parsed;
}

/** callClaudeForJson with one retry on any failure — low-volume, asynchronous practice tools don't need more than that. */
export async function callClaudeForJsonWithRetry<T>(prompt: string, isValid: (value: unknown) => value is T, maxTokens = 1024): Promise<T> {
  try {
    return await callClaudeForJson(prompt, isValid, maxTokens);
  } catch (firstError) {
    try {
      return await callClaudeForJson(prompt, isValid, maxTokens);
    } catch (secondError) {
      console.error("AI grading failed twice:", firstError, secondError);
      throw secondError;
    }
  }
}
