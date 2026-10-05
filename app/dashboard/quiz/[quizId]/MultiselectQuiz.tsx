"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_ATTEMPTS, isPerfectAttempt, type MultiselectQuizDef } from "@/lib/quiz-catalog";
import type { GenericQuizAttempt } from "@/lib/quiz";

function SwitchStudentLink({ studentName }: { studentName: string }) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async () => {
    setSwitching(true);
    await fetch("/api/students/forget", { method: "POST" });
    router.refresh();
  };

  return (
    <p className="font-mono text-[11px] text-[#8A8A80] mb-6 mt-0">
      Answering as <span className="text-[#E8E1D0]">{studentName}</span> &mdash;{" "}
      <button
        onClick={handleSwitch}
        disabled={switching}
        className="underline bg-transparent border-none p-0 text-[#8A8A80] cursor-pointer disabled:opacity-50"
      >
        not you?
      </button>
    </p>
  );
}

export default function MultiselectQuiz({
  quiz,
  initialAttempts,
  studentName,
}: {
  quiz: MultiselectQuizDef;
  initialAttempts: GenericQuizAttempt[];
  studentName: string;
}) {
  const router = useRouter();
  const [attempts, setAttempts] = useState<GenericQuizAttempt[]>(initialAttempts);
  const [mode, setMode] = useState<"quiz" | "result">(initialAttempts.length > 0 ? "result" : "quiz");
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attemptsUsed = attempts.length;
  const attemptsRemaining = MAX_ATTEMPTS - attemptsUsed;
  const latestAttempt = attempts[attempts.length - 1];
  const complete = attempts.some(isPerfectAttempt);
  const bestScore = attempts.length ? Math.max(...attempts.map((a) => a.score)) : 0;

  const startNewAttempt = () => {
    setSelected([]);
    setError(null);
    setPendingSubmit(false);
    setMode("quiz");
  };

  const toggle = (id: string) => {
    if (pendingSubmit) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirmSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quiz.id, answers: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setAttempts((prev) => [...prev, data.attempt]);
      setMode("result");
      setPendingSubmit(false);
      // The trust bonus is derived on the server from every student's best
      // score — refresh so the Investigation tab and progress counts pick it
      // up now rather than after the next reload.
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "result" && latestAttempt) {
    const resultSelected = new Set(latestAttempt.answers as string[]);
    return (
      <div>
          <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0 border-b border-[#A6764A55] pb-4">
            Attempt {attemptsUsed} of {MAX_ATTEMPTS} &mdash; saved to your record, so it&apos;ll be here whenever you come back.
          </p>
          <SwitchStudentLink studentName={studentName} />

          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4 mb-6">
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#2F6B4F] font-semibold mb-2 mt-0">
              ✓ Submitted and saved
            </p>
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-[#2A2F27]">
                This attempt&apos;s score: {latestAttempt.correct} / {latestAttempt.total}
              </span>
              <span className="font-serif font-semibold text-xl text-[#2A2F27]">trust bonus +{latestAttempt.score}</span>
            </div>
          </div>

          {quiz.passage && (
            <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-5 py-4 mb-5">
              <p className="font-mono text-[13px] text-[#2A2F27] leading-relaxed italic m-0">{quiz.passage}</p>
            </div>
          )}

          {quiz.options.map((opt) => {
            const picked = resultSelected.has(opt.id);
            const cls = opt.correct ? (picked ? "#2F6B4F" : "#93650F") : picked ? "#8B3226" : "#5B5A4E";
            return (
              <p key={opt.id} className="font-mono text-[13px] leading-relaxed mb-2" style={{ color: cls }}>
                {picked ? "☑" : "☐"} {opt.label} {opt.correct ? "— genuine flaw" : "— not a flaw"}
              </p>
            );
          })}

          {complete ? (
            <div className="bg-[#F4EFE1] border border-[#2F6B4F] px-5 py-4 mt-4">
              <p className="font-mono text-[13px] text-[#2F6B4F] font-semibold mb-1 mt-0">✓ Quiz complete — full marks</p>
              <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed m-0">
                Your trust bonus of +{bestScore} for Week {quiz.week} is set (your team&apos;s bonus is the average of everyone&apos;s best
                score). There&apos;s nothing left to retake.
              </p>
            </div>
          ) : attemptsRemaining > 0 ? (
            <button
              onClick={startNewAttempt}
              className="font-mono text-xs tracking-wide bg-transparent text-[#E8E1D0] px-5 py-2.5 border border-[#E8E1D0] mt-4"
            >
              TRY AGAIN ({attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} left)
            </button>
          ) : (
            <p className="font-mono text-xs text-[#8A8A80] mt-4">No attempts remaining &mdash; your best score is locked in as the trust bonus.</p>
          )}
      </div>
    );
  }

  return (
    <div>
        {quiz.intro && <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0">{quiz.intro}</p>}
        <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0 border-b border-[#A6764A55] pb-4">
          Attempt {attemptsUsed + 1} of {MAX_ATTEMPTS} &mdash; your best score across all attempts is averaged with your
          teammates&apos; to set the team&apos;s trust bonus for Week {quiz.week}.
          {attemptsUsed > 0 && " Your earlier attempt is already saved and counts — a retry can only improve your best score, never lower it."}
        </p>
        <SwitchStudentLink studentName={studentName} />

        {quiz.passage && (
          <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-5 py-4 mb-5">
            <p className="font-mono text-[13px] text-[#2A2F27] leading-relaxed italic m-0">{quiz.passage}</p>
          </div>
        )}

        <p className="font-serif font-semibold text-[15px] text-[#E8E1D0] mb-3 mt-0">{quiz.prompt}</p>

        {quiz.options.map((opt) => {
          const picked = selected.includes(opt.id);
          return (
            <label
              key={opt.id}
              className="flex items-start gap-2.5 bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3 mb-2 font-mono text-[13px] cursor-pointer"
              style={{ color: "#2A2F27" }}
            >
              <input type="checkbox" checked={picked} disabled={pendingSubmit} onChange={() => toggle(opt.id)} className="mt-1" />
              <span>{opt.label}</span>
            </label>
          );
        })}

        {pendingSubmit ? (
          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4 mt-3">
            <p className="font-mono text-[13px] text-[#2A2F27] mb-1 mt-0">This will be attempt {attemptsUsed + 1} of {MAX_ATTEMPTS}.</p>
            <p className="font-mono text-xs text-[#5B5A4E] mb-1 mt-0">
              Submitting saves your answers and sets your trust bonus — you&apos;ll see which were genuine flaws straight after.
            </p>
            <p className="font-mono text-xs text-[#5B5A4E] mb-4 mt-0">
              {attemptsRemaining - 1 > 0
                ? `You'll have ${attemptsRemaining - 1} attempt${attemptsRemaining - 1 === 1 ? "" : "s"} left after this one.`
                : "This is your last attempt — there won't be any more after this."}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={confirmSubmit}
                disabled={submitting}
                className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-5 py-2.5 border border-[#2A2F27] disabled:opacity-50"
              >
                {submitting ? "SUBMITTING…" : "YES, SUBMIT"}
              </button>
              <button
                onClick={() => setPendingSubmit(false)}
                disabled={submitting}
                className="font-mono text-xs tracking-wide bg-transparent text-[#5B5A4E] px-5 py-2.5 border border-[#5B5A4E] disabled:opacity-50"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setPendingSubmit(true)}
            disabled={selected.length === 0}
            className="font-mono text-xs tracking-wide bg-[#E8E1D0] text-[#2A2F27] px-5 py-2.5 border border-[#E8E1D0] disabled:opacity-50 disabled:cursor-not-allowed mt-3"
          >
            SUBMIT ANSWERS
          </button>
        )}
        {error && <p className="font-mono text-xs text-[#8B3226] mt-3">{error}</p>}
    </div>
  );
}
