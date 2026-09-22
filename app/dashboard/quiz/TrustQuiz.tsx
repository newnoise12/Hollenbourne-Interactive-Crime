"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MAX_ATTEMPTS, type QuizItem } from "@/lib/quiz-catalog";
import type { RankQuizAttempt } from "@/lib/quiz";

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

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ItemCard({
  item,
  rank,
  onClick,
  disabled,
}: {
  item: QuizItem;
  rank: number | null;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || rank !== null}
      className={`w-full text-left bg-[#E8E1D0] border px-5 py-4 mb-3 ${
        rank !== null ? "border-[#2F6B4F]" : "border-[#D6CDB4] cursor-pointer hover:border-[#A6764A]"
      } ${disabled && rank === null ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex justify-between items-baseline mb-2 gap-3">
        <span className="font-mono text-[11px] text-[#5B5A4E] tracking-wide uppercase">{item.sourceType}</span>
        {rank !== null && (
          <span className="font-mono text-xs font-bold text-[#2F6B4F] border border-[#2F6B4F] px-2 py-0.5 shrink-0">
            ranked {rank}
          </span>
        )}
      </div>
      {item.kicker && <p className="font-mono text-xs text-[#5B5A4E] mb-1.5 mt-0">{item.kicker}</p>}
      {item.heading && <h4 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-2 mt-0">{item.heading}</h4>}
      <div className="font-mono text-[13px] text-[#2A2F27] leading-relaxed">
        {item.body.split("\n\n").map((para, i) => (
          <p key={i} className="mb-2 last:mb-0 whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </button>
  );
}

function FeedbackCard({ item, yourRank }: { item: QuizItem; yourRank: number }) {
  const correct = yourRank === item.correctRank;
  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 px-5 py-4 mb-3" style={{ borderLeftColor: correct ? "#2F6B4F" : "#8B3226" }}>
      <div className="flex justify-between items-baseline mb-2 gap-3 flex-wrap">
        <span className="font-mono text-[11px] text-[#5B5A4E] tracking-wide uppercase">{item.sourceType}</span>
        <div className="flex gap-2">
          <span className="font-mono text-[11px] text-[#5B5A4E] border border-[#D6CDB4] px-2 py-0.5">
            correct rank: {item.correctRank}
          </span>
          <span
            className="font-mono text-[11px] px-2 py-0.5 border"
            style={{ color: correct ? "#2F6B4F" : "#8B3226", borderColor: correct ? "#2F6B4F" : "#8B3226" }}
          >
            your rank: {yourRank}
          </span>
        </div>
      </div>
      {item.heading && <h4 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-1.5 mt-0">{item.heading}</h4>}
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-0 mt-0 border-t border-dotted border-[#D6CDB4] pt-2">
        {item.trustMarkers}
      </p>
    </div>
  );
}

function StageResults({ items, order, points }: { items: QuizItem[]; order: string[]; points: number }) {
  const correct = points > 0;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif font-semibold text-lg text-[#E8E1D0] m-0">
          Stage {items[0].stage}
        </h3>
        <span className="font-mono text-xs font-bold px-2 py-0.5 border" style={{ color: correct ? "#2F6B4F" : "#8B3226", borderColor: correct ? "#2F6B4F" : "#8B3226" }}>
          {correct ? `correct (+${points})` : "not quite (+0)"}
        </span>
      </div>
      {[...items]
        .sort((a, b) => a.correctRank - b.correctRank)
        .map((item) => (
          <FeedbackCard key={item.id} item={item} yourRank={order.indexOf(item.id) + 1} />
        ))}
    </div>
  );
}

function stagePoints(stage1Items: QuizItem[], stage2Items: QuizItem[], attempt: RankQuizAttempt) {
  const stage1Correct = stage1Items.every((item) => attempt.answers.stage1Order[item.correctRank - 1] === item.id);
  const anchor2A = stage2Items.find((i) => i.id === "2A")!;
  const anchor2E = stage2Items.find((i) => i.id === "2E")!;
  const stage2Correct =
    attempt.answers.stage2Order[anchor2A.correctRank - 1] === anchor2A.id &&
    attempt.answers.stage2Order[anchor2E.correctRank - 1] === anchor2E.id;
  return { stage1Points: stage1Correct ? 1 : 0, stage2Points: stage2Correct ? 2 : 0 };
}

export default function TrustQuiz({
  stage1Items,
  stage2Items,
  initialAttempts,
  studentName,
}: {
  stage1Items: QuizItem[];
  stage2Items: QuizItem[];
  initialAttempts: RankQuizAttempt[];
  studentName: string;
}) {
  const [attempts, setAttempts] = useState<RankQuizAttempt[]>(initialAttempts);
  const [mode, setMode] = useState<"ranking" | "result">(initialAttempts.length > 0 ? "result" : "ranking");

  // Shuffled only after mount: shuffling during the initial render would run
  // once on the server and again on the client with a different result,
  // causing a hydration mismatch. Displaying in catalog order for one frame
  // before the client-only shuffle kicks in is an acceptable trade-off.
  const [display1, setDisplay1] = useState(stage1Items);
  const [display2, setDisplay2] = useState(stage2Items);
  useEffect(() => {
    // Intentional one-shot setState-in-effect: this is the standard
    // "randomize only after mount" pattern (see comment above) — there is
    // no render-time-only way to do this without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplay1(shuffle(stage1Items));
    setDisplay2(shuffle(stage2Items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [stage1Order, setStage1Order] = useState<string[]>([]);
  const [stage2Order, setStage2Order] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const rankOf = (order: string[], id: string) => (order.includes(id) ? order.indexOf(id) + 1 : null);

  const stage1Done = stage1Order.length === stage1Items.length;
  const stage2Done = stage2Order.length === stage2Items.length;
  const anyProgress = stage1Order.length > 0 || stage2Order.length > 0;

  const pick1 = (id: string) => setStage1Order((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const pick2 = (id: string) => setStage2Order((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const resetRanking = () => {
    setStage1Order([]);
    setStage2Order([]);
    setError(null);
    setPendingSubmit(false);
  };

  const attemptsUsed = attempts.length;
  const attemptsRemaining = MAX_ATTEMPTS - attemptsUsed;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;
  const latestAttempt = attempts[attempts.length - 1];

  const startNewAttempt = () => {
    resetRanking();
    setDisplay1(shuffle(stage1Items));
    setDisplay2(shuffle(stage2Items));
    setMode("ranking");
  };

  const remainingAfterThis = attemptsRemaining - 1;

  const confirmSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage1Order, stage2Order }),
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
    // Recompute per-stage correctness for the two feedback banners below —
    // attempt.score is only the combined total (0-3), not split by stage.
    const { stage1Points, stage2Points } = stagePoints(stage1Items, stage2Items, latestAttempt);

    return (
      <div className="bg-[#23262B] min-h-full px-6 py-8">
        <div className="max-w-[640px] mx-auto">
          <div className="flex justify-between items-end mb-1.5">
            <h1 className="font-serif font-semibold text-2xl text-[#E8E1D0] m-0">Week 2 trust activity</h1>
            <Link href="/dashboard" className="font-mono text-[11px] text-[#8A8A80] underline shrink-0 ml-4">
              back to dashboard
            </Link>
          </div>
          <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0 border-b border-[#A6764A55] pb-4">
            Attempt {attemptsUsed} of {MAX_ATTEMPTS} &mdash; here&apos;s how you ranked each source, and why.
          </p>
          <SwitchStudentLink studentName={studentName} />

          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4 mb-2 flex justify-between items-center">
            <span className="font-mono text-sm text-[#2A2F27]">This attempt&apos;s score</span>
            <span className="font-serif font-semibold text-xl text-[#2A2F27]">
              {latestAttempt.score} / {latestAttempt.maxScore}
            </span>
          </div>
          <p className="font-mono text-xs text-[#8A8A80] mb-6">
            Your best score so far: <span className="text-[#E8E1D0]">{bestScore} / {latestAttempt.maxScore}</span> &mdash;
            this is averaged with your teammates&apos; best scores to set the team&apos;s trust bonus for{" "}
            <Link href="/dashboard/actions" className="underline text-[#A6764A]">
              Week 2 investigation actions
            </Link>
            .
          </p>

          <StageResults items={stage1Items} order={latestAttempt.answers.stage1Order} points={stage1Points} />
          <StageResults items={stage2Items} order={latestAttempt.answers.stage2Order} points={stage2Points} />

          {attemptsRemaining > 0 ? (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={startNewAttempt}
                className="font-mono text-xs tracking-wide bg-transparent text-[#E8E1D0] px-5 py-2.5 border border-[#E8E1D0]"
              >
                TRY AGAIN ({attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} left)
              </button>
            </div>
          ) : (
            <p className="font-mono text-xs text-[#8A8A80] mt-2">
              No attempts remaining &mdash; your best score is locked in as the trust bonus.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#23262B] min-h-full px-6 py-8">
      <div className="max-w-[640px] mx-auto">
        <div className="flex justify-between items-end mb-1.5">
          <h1 className="font-serif font-semibold text-2xl text-[#E8E1D0] m-0">Week 2 trust activity</h1>
          <Link href="/dashboard" className="font-mono text-[11px] text-[#8A8A80] underline shrink-0 ml-4">
            back to dashboard
          </Link>
        </div>
        <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0">
          Ranking sources by trustworthiness. Click each item below in the order you&apos;d rank it, most trustworthy
          first.
        </p>
        <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0 border-b border-[#A6764A55] pb-4">
          Attempt {attemptsUsed + 1} of {MAX_ATTEMPTS} &mdash; your best score across all attempts is averaged with
          your teammates&apos; to set the team&apos;s trust bonus for Week 2.
        </p>
        <SwitchStudentLink studentName={studentName} />

        <div className="mb-8">
          <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-1 mt-0">Stage 1 of 2</h2>
          <p className="font-mono text-xs text-[#8A8A80] mb-4 mt-0">
            Rank these three sources, most trustworthy first ({stage1Order.length}/{stage1Items.length} ranked).
          </p>
          {display1.map((item) => (
            <ItemCard key={item.id} item={item} rank={rankOf(stage1Order, item.id)} onClick={() => pick1(item.id)} disabled={false} />
          ))}
        </div>

        {stage1Done && (
          <div className="mb-8">
            <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-1 mt-0">Stage 2 of 2</h2>
            <p className="font-mono text-xs text-[#8A8A80] mb-4 mt-0">
              Rank these five sources, most trustworthy first ({stage2Order.length}/{stage2Items.length} ranked).
            </p>
            {display2.map((item) => (
              <ItemCard key={item.id} item={item} rank={rankOf(stage2Order, item.id)} onClick={() => pick2(item.id)} disabled={false} />
            ))}
          </div>
        )}

        {pendingSubmit ? (
          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4">
            <p className="font-mono text-[13px] text-[#2A2F27] mb-1 mt-0">
              This will be attempt {attemptsUsed + 1} of {MAX_ATTEMPTS}.
            </p>
            <p className="font-mono text-xs text-[#5B5A4E] mb-4 mt-0">
              {remainingAfterThis > 0
                ? `You'll have ${remainingAfterThis} attempt${remainingAfterThis === 1 ? "" : "s"} left after this one. Your best score across all attempts becomes your team's Week 2 trust bonus.`
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
          <>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPendingSubmit(true)}
                disabled={!stage1Done || !stage2Done}
                className="font-mono text-xs tracking-wide bg-[#E8E1D0] text-[#2A2F27] px-5 py-2.5 border border-[#E8E1D0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SUBMIT RANKING
              </button>
              {anyProgress && (
                <button
                  onClick={resetRanking}
                  className="font-mono text-xs tracking-wide bg-transparent text-[#8A8A80] px-5 py-2.5 border border-[#5B5A4E]"
                >
                  RESET
                </button>
              )}
            </div>
            {(!stage1Done || !stage2Done) && (
              <p className="font-mono text-[11px] text-[#8A8A80] mt-2">
                Rank every item in both stages before you can submit.
              </p>
            )}
          </>
        )}
        {error && <p className="font-mono text-xs text-[#8B3226] mt-3">{error}</p>}
      </div>
    </div>
  );
}
