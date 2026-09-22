"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MAX_ATTEMPTS, type McqQuizDef } from "@/lib/quiz-catalog";
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

export default function McqQuiz({
  quiz,
  initialAttempts,
  studentName,
}: {
  quiz: McqQuizDef;
  initialAttempts: GenericQuizAttempt[];
  studentName: string;
}) {
  const [attempts, setAttempts] = useState<GenericQuizAttempt[]>(initialAttempts);
  const [mode, setMode] = useState<"quiz" | "result">(initialAttempts.length > 0 ? "result" : "quiz");

  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[][]>(quiz.stages.map((s) => s.questions.map(() => undefined)));
  const [stageRevealed, setStageRevealed] = useState<boolean[]>(quiz.stages.map(() => false));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const attemptsUsed = attempts.length;
  const attemptsRemaining = MAX_ATTEMPTS - attemptsUsed;
  const latestAttempt = attempts[attempts.length - 1];

  const startNewAttempt = () => {
    setAnswers(quiz.stages.map((s) => s.questions.map(() => undefined)));
    setStageRevealed(quiz.stages.map(() => false));
    setStageIndex(0);
    setError(null);
    setPendingSubmit(false);
    setMode("quiz");
  };

  const pick = (si: number, qi: number, optionIndex: number) => {
    if (stageRevealed[si]) return;
    setAnswers((prev) => {
      const next = prev.map((s) => [...s]);
      next[si][qi] = optionIndex;
      return next;
    });
  };

  const currentStage = quiz.stages[stageIndex];
  const currentAnswers = answers[stageIndex];
  const allAnsweredThisStage = currentAnswers.every((a) => a !== undefined);
  const isLastStage = stageIndex === quiz.stages.length - 1;

  const revealStage = () => {
    setStageRevealed((prev) => {
      const next = [...prev];
      next[stageIndex] = true;
      return next;
    });
  };

  const goNextStage = () => {
    if (isLastStage) {
      setPendingSubmit(true);
    } else {
      setStageIndex((i) => i + 1);
    }
  };

  const confirmSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quiz.id, answers }),
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
    const resultAnswers = latestAttempt.answers as (number | undefined)[][];
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
            Attempt {attemptsUsed} of {MAX_ATTEMPTS} &mdash; here&apos;s how you answered.
          </p>
          <SwitchStudentLink studentName={studentName} />

          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4 mb-6 flex justify-between items-center">
            <span className="font-mono text-sm text-[#2A2F27]">
              This attempt&apos;s score: {latestAttempt.correct} / {latestAttempt.total} correct
            </span>
            <span className="font-serif font-semibold text-xl text-[#2A2F27]">
              trust bonus +{latestAttempt.score}
            </span>
          </div>

          {quiz.stages.map((stage, si) => (
            <div key={si} className="mb-8">
              {stage.label && <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-1 mt-0">{stage.label}</h2>}
              {stage.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stage.image} alt={stage.label ?? quiz.title} className="max-w-full border border-[#A6764A] my-3" />
              )}
              {stage.questions.map((q, qi) => {
                const picked = resultAnswers[si]?.[qi];
                const ok = picked === q.correct;
                return (
                  <div key={qi} className="bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 px-5 py-4 mb-3" style={{ borderLeftColor: ok ? "#2F6B4F" : "#8B3226" }}>
                    <p className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-2 mt-0">
                      {qi + 1}. {q.q}
                    </p>
                    <p className="font-mono text-xs mb-1.5 mt-0" style={{ color: ok ? "#2F6B4F" : "#8B3226" }}>
                      Your answer: {picked !== undefined ? q.options[picked] : "—"} {ok ? "— correct" : `— correct answer: ${q.options[q.correct]}`}
                    </p>
                    <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-0 mt-2 border-t border-dotted border-[#D6CDB4] pt-2">{q.explain}</p>
                  </div>
                );
              })}
            </div>
          ))}

          {attemptsRemaining > 0 ? (
            <button
              onClick={startNewAttempt}
              className="font-mono text-xs tracking-wide bg-transparent text-[#E8E1D0] px-5 py-2.5 border border-[#E8E1D0]"
            >
              TRY AGAIN ({attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} left)
            </button>
          ) : (
            <p className="font-mono text-xs text-[#8A8A80] mt-2">No attempts remaining &mdash; your best score is locked in as the trust bonus.</p>
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

        {quiz.stages.length > 1 && (
          <p className="font-mono text-xs text-[#8A8A80] mb-4 mt-0">
            Stage {stageIndex + 1} of {quiz.stages.length}
          </p>
        )}
        {currentStage.label && <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-1 mt-0">{currentStage.label}</h2>}
        {currentStage.intro && <p className="font-mono text-xs text-[#8A8A80] mb-3 mt-0">{currentStage.intro}</p>}
        {currentStage.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentStage.image} alt={currentStage.label ?? quiz.title} className="max-w-full border border-[#A6764A] mb-4" />
        )}

        {currentStage.questions.map((q, qi) => {
          const revealed = stageRevealed[stageIndex];
          const picked = currentAnswers[qi];
          const ok = picked === q.correct;
          return (
            <div
              key={qi}
              className="bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 px-5 py-4 mb-3"
              style={{ borderLeftColor: revealed ? (ok ? "#2F6B4F" : "#8B3226") : "#D6CDB4" }}
            >
              <p className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-2 mt-0">
                {qi + 1}. {q.q}
              </p>
              {q.options.map((opt, oi) => (
                <label key={oi} className="flex items-start gap-2 font-mono text-[13px] text-[#2A2F27] py-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`q_${stageIndex}_${qi}`}
                    checked={picked === oi}
                    disabled={revealed}
                    onChange={() => pick(stageIndex, qi, oi)}
                    className="mt-1"
                  />
                  {opt}
                </label>
              ))}
              {revealed && (
                <>
                  <p className="font-mono text-xs mb-1.5 mt-2" style={{ color: ok ? "#2F6B4F" : "#8B3226" }}>
                    {ok ? "Correct" : `Correct answer: ${q.options[q.correct]}`}
                  </p>
                  <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-0 mt-0 border-t border-dotted border-[#D6CDB4] pt-2">{q.explain}</p>
                </>
              )}
            </div>
          );
        })}

        {pendingSubmit ? (
          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4">
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
        ) : stageRevealed[stageIndex] ? (
          <button
            onClick={goNextStage}
            className="font-mono text-xs tracking-wide bg-[#E8E1D0] text-[#2A2F27] px-5 py-2.5 border border-[#E8E1D0]"
          >
            {isLastStage ? "FINISH QUIZ" : "CONTINUE"}
          </button>
        ) : (
          <button
            onClick={revealStage}
            disabled={!allAnsweredThisStage}
            className="font-mono text-xs tracking-wide bg-[#E8E1D0] text-[#2A2F27] px-5 py-2.5 border border-[#E8E1D0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SUBMIT ANSWERS
          </button>
        )}
        {error && <p className="font-mono text-xs text-[#8B3226] mt-3">{error}</p>}
      </div>
    </div>
  );
}
