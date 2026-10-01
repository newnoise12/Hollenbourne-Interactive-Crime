"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReferencePracticeDraft } from "@/lib/reference-practice";

type ElementStatus = "correct" | "flawed" | "missing" | "not_applicable";
type ElementFeedback = { status: ElementStatus; note: string };
type GradingResult = {
  elements: {
    author: ElementFeedback;
    year: ElementFeedback;
    title: ElementFeedback;
    publication_details: ElementFeedback;
    access_details: ElementFeedback;
  };
  overall: "correct" | "mostly_correct" | "needs_work";
  summary: string;
};

function isGradingResult(value: unknown): value is GradingResult {
  return !!value && typeof value === "object" && "elements" in value && "overall" in value;
}

const ELEMENT_LABELS: Record<keyof GradingResult["elements"], string> = {
  author: "Author",
  year: "Year",
  title: "Title",
  publication_details: "Publication details",
  access_details: "Access details",
};

const STATUS_COLORS: Record<ElementStatus, string> = {
  correct: "#2F6B4F",
  flawed: "#A6764A",
  missing: "#8B3226",
  not_applicable: "#8A8A80",
};

const STATUS_LABELS: Record<ElementStatus, string> = {
  correct: "Correct",
  flawed: "Flawed",
  missing: "Missing",
  not_applicable: "Not applicable",
};

const OVERALL_LABELS: Record<GradingResult["overall"], string> = {
  correct: "Correct",
  mostly_correct: "Mostly correct",
  needs_work: "Needs work",
};

type TaskDef = { id: string; title: string; facts: string };

const TASKS: TaskDef[] = [
  {
    id: "newspaper",
    title: "Task 1 — Newspaper article",
    facts:
      "Author: Sarah Chen | Publication: The Guardian | Date: 14 March 2025 | Headline: \"Rising prison populations and the sentencing debate\" | URL: https://www.theguardian.com/society/2025/mar/14/rising-prison-populations-and-the-sentencing-debate | Accessed: online",
  },
  {
    id: "undated-website",
    title: "Task 2 — Undated website",
    facts:
      "Author: none named (organisational) | Publisher: Crown Prosecution Service | Title: a UK government page explaining how the Crown Prosecution Service works | Publication date: not given on the page | URL: https://www.cps.gov.uk/about-cps | Accessed: on a date of your choosing",
  },
  {
    id: "book-chapter",
    title: "Task 3 — Chapter in an edited book",
    facts:
      "Chapter author: Okafor, R. | Chapter title: \"Community sentencing in practice\" | Pages: 88–104 | Book editor: Patel-Singh, J. | Book title: Contemporary Approaches to Sentencing | Year: 2022 | Publisher: Palgrave Macmillan | Place: London",
  },
];

function FeedbackPanel({ result }: { result: GradingResult }) {
  return (
    <div className="bg-[#F4EFE1] border border-[#A6764A] px-4 py-3.5 mt-3">
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E]">Feedback</span>
        <span className="font-mono text-xs font-semibold" style={{ color: STATUS_COLORS[result.overall === "correct" ? "correct" : result.overall === "mostly_correct" ? "flawed" : "missing"] }}>
          {OVERALL_LABELS[result.overall]}
        </span>
      </div>
      <div className="space-y-2 mb-3">
        {(Object.keys(ELEMENT_LABELS) as (keyof GradingResult["elements"])[]).map((key) => {
          const el = result.elements[key];
          return (
            <div key={key} className="flex items-start gap-2 font-mono text-xs">
              <span className="min-w-[130px] text-[#2A2F27]">{ELEMENT_LABELS[key]}</span>
              <span className="min-w-[95px] font-semibold" style={{ color: STATUS_COLORS[el.status] }}>
                {STATUS_LABELS[el.status]}
              </span>
              <span className="text-[#5B5A4E] leading-relaxed">{el.note}</span>
            </div>
          );
        })}
      </div>
      <p className="font-mono text-xs text-[#2A2F27] leading-relaxed mb-0 mt-0 border-t border-dotted border-[#D6CDB4] pt-2">
        {result.summary}
      </p>
    </div>
  );
}

function TaskCard({ task, initialResponse }: { task: TaskDef; initialResponse?: { text: string; feedback: unknown; submitted: boolean } }) {
  const [text, setText] = useState(initialResponse?.text ?? "");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradingResult | null>(isGradingResult(initialResponse?.feedback) ? initialResponse.feedback : null);
  // The exact text the current `result` is feedback for — submitting is only
  // ever enabled when the textarea still matches this, so a student can
  // never submit unchecked edits under an old check's feedback.
  const [lastCheckedText, setLastCheckedText] = useState<string | null>(result ? (initialResponse?.text ?? null) : null);
  const [submitted, setSubmitted] = useState(!!initialResponse?.submitted);

  const check = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/reference-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", taskId: task.id, text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      const draft = data.draft as ReferencePracticeDraft;
      const mine = draft[task.id];
      setResult(isGradingResult(mine?.feedback) ? mine.feedback : null);
      setLastCheckedText(text);
      setSubmitted(!!mine?.submitted);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (submitting || submitted || text !== lastCheckedText || !result) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/reference-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", taskId: task.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!result && text === lastCheckedText && !submitted;

  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3.5 mb-3">
      <h4 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1.5 mt-0">{task.title}</h4>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-3 mt-0">{task.facts}</p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (submitted) setSubmitted(false); // edited since submitting — no longer the submitted answer
        }}
        placeholder="Write your Harvard reference here..."
        rows={2}
        className="w-full font-mono text-[13px] text-[#2A2F27] bg-[#F4EFE1] border border-[#D6CDB4] px-3 py-2 mb-2.5 resize-y"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={check}
          disabled={loading || !text.trim() || submitted}
          className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-4 py-2 border border-[#2A2F27] disabled:opacity-50"
        >
          {loading ? "CHECKING…" : result ? "CHECK AGAIN" : "CHECK MY REFERENCE"}
        </button>
        <button
          onClick={submitAnswer}
          disabled={!canSubmit || submitting}
          className="font-mono text-xs tracking-wide bg-transparent px-4 py-2 border disabled:opacity-50"
          style={submitted ? { color: "#2F6B4F", borderColor: "#2F6B4F" } : { color: "#A6764A", borderColor: "#A6764A" }}
        >
          {submitted ? "✓ SUBMITTED" : submitting ? "SUBMITTING…" : "SUBMIT AS MY ANSWER"}
        </button>
        {result && !submitted && text !== lastCheckedText && (
          <span className="font-mono text-[11px] text-[#8A8A80]">Check your latest edit before submitting it.</span>
        )}
      </div>
      {error && <p className="font-mono text-xs text-[#8B3226] mt-2.5 mb-0">{error}</p>}
      {result && <FeedbackPanel result={result} />}
    </div>
  );
}

function SwitchStudentLink({ studentName }: { studentName: string }) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  return (
    <p className="font-mono text-[11px] text-[#8A8A80] mb-4 mt-0">
      Answering as <span className="text-[#2A2F27]">{studentName}</span> &mdash;{" "}
      <button
        onClick={async () => {
          setSwitching(true);
          await fetch("/api/students/forget", { method: "POST" });
          router.refresh();
        }}
        disabled={switching}
        className="underline bg-transparent border-none p-0 text-[#8A8A80] cursor-pointer disabled:opacity-50"
      >
        not you?
      </button>
    </p>
  );
}

export default function ReferencingPractice({ initialDraft, studentName }: { initialDraft: ReferencePracticeDraft; studentName: string }) {
  return (
    <div className="mt-5 pt-4 border-t border-[#D6CDB4]">
      <h3 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1 mt-0">Stage 2 — Write your own</h3>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-1 mt-0">
        The second half of this week&apos;s activity, now that Stage 1&apos;s multiple choice has covered the
        basics: write a full Harvard reference for each source below and get instant, structured feedback on each
        element. Not scored, but your work and feedback are saved — check and revise as many times as you like,
        then submit each one as your answer when you&apos;re happy with it.
      </p>
      <SwitchStudentLink studentName={studentName} />
      {TASKS.map((task) => (
        <TaskCard key={task.id} task={task} initialResponse={initialDraft[task.id]} />
      ))}
    </div>
  );
}
