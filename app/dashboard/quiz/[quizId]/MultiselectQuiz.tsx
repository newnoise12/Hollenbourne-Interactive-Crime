"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MAX_ATTEMPTS, type MultiselectQuizDef } from "@/lib/quiz-catalog";
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
  const [attempts, setAttempts] = useState<GenericQuizAttempt[]>(initialAttempts);
  const [mode, setMode] = useState<"quiz" | "result">(initialAttempts.length > 0 ? "result" : "quiz");
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attemptsUsed = attempts.length;
  const attemptsRemaining = MAX_ATTEMPTS - attemptsUsed;
  const latestAttempt = attempts[attempts.length - 1];

  const startNewAttempt = () => {
    setSelected([]);
    setRevealed(false);
    setError(null);
    setPendingSubmit(false);
    setMode("quiz");
  };

  const toggle = (id: string) => {
    if (revealed) return;
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
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "result" && latestAttempt) {
    const resultSelected = new Set(latestAttempt.answers as string[]);
    return (
      <div className="bg-[#23262B] min-h-full px-6 py-8">
        <div className="max-w-[640px] mx-auto">
          <div className="flex justify-between items-end mb-1.5">
            <h1 className="font-serif font-semibold text-2xl text-[#E8E1D0] m-0">{quiz.title}</h1>
            <Link href="/dashboard" className="font-mono text-[11px] text-[#8A8A80] underline shrink-0 ml-4">
              back to dashboard
            </Link>
          </div>
          <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0 border-b border-[#A6764A55] pb-4">
            Attempt {attemptsUsed} of {MAX_ATTEMPTS}
          </p>
          <SwitchStudentLink studentName={studentName} />

          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4 mb-6 flex justify-between items-center">
            <span className="font-mono text-sm text-[#2A2F27]">
              This attempt&apos;s score: {latestAttempt.correct} / {latestAttempt.total}
            </span>
            <span className="font-serif font-semibold text-xl text-[#2A2F27]">trust bonus +{latestAttempt.score}</span>
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

          {attemptsRemaining > 0 ? (
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
      </div>
    );
  }

  return (
    <div className="bg-[#23262B] min-h-full px-6 py-8">
      <div className="max-w-[640px] mx-auto">
        <div className="flex justify-between items-end mb-1.5">
          <h1 className="font-serif font-semibold text-2xl text-[#E8E1D0] m-0">{quiz.title}</h1>
          <Link href="/dashboard" className="font-mono text-[11px] text-[#8A8A80] underline shrink-0 ml-4">
            back to dashboard
          </Link>
        </div>
        {quiz.intro && <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0">{quiz.intro}</p>}
        <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0 border-b border-[#A6764A55] pb-4">
          Attempt {attemptsUsed + 1} of {MAX_ATTEMPTS} &mdash; your best score across all attempts is averaged with your
          teammates&apos; to set the team&apos;s trust bonus for Week {quiz.week}.
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
          const revealCls = revealed ? (opt.correct ? (picked ? "#2F6B4F" : "#93650F") : picked ? "#8B3226" : "#5B5A4E") : "#2A2F27";
          return (
            <label
              key={opt.id}
              className="flex items-start gap-2.5 bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3 mb-2 font-mono text-[13px] cursor-pointer"
              style={{ color: revealCls }}
            >
              <input type="checkbox" checked={picked} disabled={revealed} onChange={() => toggle(opt.id)} className="mt-1" />
              <span>
                {opt.label}
                {revealed && <span className="ml-2 text-xs">{opt.correct ? "— genuine flaw" : "— not a flaw"}</span>}
              </span>
            </label>
          );
        })}

        {pendingSubmit ? (
          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4 mt-3">
            <p className="font-mono text-[13px] text-[#2A2F27] mb-1 mt-0">This will be attempt {attemptsUsed + 1} of {MAX_ATTEMPTS}.</p>
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
        ) : revealed ? (
          <button
            onClick={() => setPendingSubmit(true)}
            className="font-mono text-xs tracking-wide bg-[#E8E1D0] text-[#2A2F27] px-5 py-2.5 border border-[#E8E1D0] mt-3"
          >
            FINISH QUIZ
          </button>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            disabled={selected.length === 0}
            className="font-mono text-xs tracking-wide bg-[#E8E1D0] text-[#2A2F27] px-5 py-2.5 border border-[#E8E1D0] disabled:opacity-50 disabled:cursor-not-allowed mt-3"
          >
            SUBMIT
          </button>
        )}
        {error && <p className="font-mono text-xs text-[#8B3226] mt-3">{error}</p>}
      </div>
    </div>
  );
}
