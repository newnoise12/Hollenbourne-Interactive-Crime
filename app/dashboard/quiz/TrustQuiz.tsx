"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuizItem } from "@/lib/quiz-catalog";
import type { QuizAttempt } from "@/lib/quiz";

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

export default function TrustQuiz({
  stage1Items,
  stage2Items,
  initialAttempt,
}: {
  stage1Items: QuizItem[];
  stage2Items: QuizItem[];
  initialAttempt: QuizAttempt | null;
}) {
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
  const [attempt, setAttempt] = useState<QuizAttempt | null>(initialAttempt);

  const rankOf = (order: string[], id: string) => (order.includes(id) ? order.indexOf(id) + 1 : null);

  const stage1Done = stage1Order.length === stage1Items.length;
  const stage2Done = stage2Order.length === stage2Items.length;

  const pick1 = (id: string) => setStage1Order((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const pick2 = (id: string) => setStage2Order((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const submit = async () => {
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
      setAttempt(data.attempt);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  if (attempt) {
    // Recompute per-stage correctness for the two feedback banners below —
    // attempt.score is only the combined total (0-3), not split by stage.
    const stage1Correct = stage1Items.every((item) => attempt.answers.stage1Order[item.correctRank - 1] === item.id);
    const anchor2A = stage2Items.find((i) => i.id === "2A")!;
    const anchor2E = stage2Items.find((i) => i.id === "2E")!;
    const stage2Correct =
      attempt.answers.stage2Order[anchor2A.correctRank - 1] === anchor2A.id &&
      attempt.answers.stage2Order[anchor2E.correctRank - 1] === anchor2E.id;

    return (
      <div className="bg-[#23262B] min-h-full px-6 py-8">
        <div className="max-w-[640px] mx-auto">
          <div className="flex justify-between items-end mb-1.5">
            <h1 className="font-serif font-semibold text-2xl text-[#E8E1D0] m-0">Week 2 trust activity</h1>
            <Link href="/dashboard" className="font-mono text-[11px] text-[#8A8A80] underline shrink-0 ml-4">
              back to dashboard
            </Link>
          </div>
          <p className="font-mono text-xs text-[#8A8A80] mb-6 mt-0 border-b border-[#A6764A55] pb-4">
            Completed &mdash; here&apos;s how your team ranked each source, and why.
          </p>

          <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4 mb-6 flex justify-between items-center">
            <span className="font-mono text-sm text-[#2A2F27]">Score</span>
            <span className="font-serif font-semibold text-xl text-[#2A2F27]">
              {attempt.score} / {attempt.maxScore}
            </span>
          </div>
          <p className="font-mono text-xs text-[#8A8A80] mb-6 -mt-2">
            This score has been applied as your team&apos;s trust bonus for{" "}
            <Link href="/dashboard/actions" className="underline text-[#A6764A]">
              Week 2 investigation actions
            </Link>
            .
          </p>

          <StageResults items={stage1Items} order={attempt.answers.stage1Order} points={stage1Correct ? 1 : 0} />
          <StageResults items={stage2Items} order={attempt.answers.stage2Order} points={stage2Correct ? 2 : 0} />
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
        <p className="font-mono text-xs text-[#8A8A80] mb-6 mt-0 border-b border-[#A6764A55] pb-4">
          Ranking sources by trustworthiness. Click each item below in the order you&apos;d rank it, most trustworthy
          first. This is a one-time task &mdash; your score (0&ndash;3) becomes your team&apos;s trust bonus for Week 2.
        </p>

        <div className="mb-8">
          <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-1 mt-0">Stage 1 of 2</h2>
          <p className="font-mono text-xs text-[#8A8A80] mb-4 mt-0">
            Rank these three sources, most trustworthy first ({stage1Order.length}/{stage1Items.length} ranked).
          </p>
          {display1.map((item) => (
            <ItemCard key={item.id} item={item} rank={rankOf(stage1Order, item.id)} onClick={() => pick1(item.id)} disabled={false} />
          ))}
          {stage1Order.length > 0 && !stage1Done && (
            <button
              onClick={() => setStage1Order([])}
              className="font-mono text-[11px] text-[#8A8A80] underline bg-transparent border-none cursor-pointer p-0"
            >
              start stage 1 over
            </button>
          )}
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
            {stage2Order.length > 0 && !stage2Done && (
              <button
                onClick={() => setStage2Order([])}
                className="font-mono text-[11px] text-[#8A8A80] underline bg-transparent border-none cursor-pointer p-0"
              >
                start stage 2 over
              </button>
            )}
          </div>
        )}

        {stage1Done && stage2Done && (
          <div className="flex items-center gap-4">
            <button
              onClick={submit}
              disabled={submitting}
              className="font-mono text-xs tracking-wide bg-[#E8E1D0] text-[#2A2F27] px-5 py-2.5 border border-[#E8E1D0] disabled:opacity-50"
            >
              {submitting ? "SUBMITTING…" : "SUBMIT RANKING"}
            </button>
            {error && <p className="font-mono text-xs text-[#8B3226] m-0">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
