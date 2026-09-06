"use client";

import { useState } from "react";
import Link from "next/link";
import { MinusIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { CATEGORY_META, BASELINE_ACTIONS, MAX_TRUST_BONUS, MAX_WEEK, type ActionItem } from "@/lib/actions-catalog";
import { QUIZ_WEEK } from "@/lib/quiz-catalog";
import type { WeekState, WeekStateMap, LogEntry } from "@/lib/actions";

function Pips({ total, used }: { total: number; used: number }) {
  const pips = [];
  for (let i = 0; i < total; i++) {
    pips.push(
      <span
        key={i}
        className="w-3 h-3 rounded-full inline-block border-[1.5px]"
        style={{
          background: i < used ? "#8B3226" : "transparent",
          borderColor: i < used ? "#8B3226" : "#A6764A",
        }}
      />
    );
  }
  return <div className="flex gap-1.5">{pips}</div>;
}

function ActionCard({ action, canAfford, onTake }: { action: ActionItem; canAfford: boolean; onTake: () => void }) {
  const meta = CATEGORY_META[action.category];
  return (
    <div
      className="bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 px-4 py-3.5 mb-3"
      style={{ borderLeftColor: meta.color }}
    >
      <div className="flex justify-between items-baseline mb-1.5 flex-wrap gap-2">
        <span className="font-mono text-[11px]" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="font-mono text-[11px] text-[#5B5A4E] border border-[#D6CDB4] px-2 py-0.5">
          cost: {action.cost}
        </span>
      </div>
      <h4 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-1 mt-0">{action.label}</h4>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-2.5 mt-0">{action.description}</p>
      <button
        onClick={onTake}
        disabled={!canAfford}
        className="font-mono text-xs tracking-wide bg-transparent px-3.5 py-1.5 border"
        style={{
          borderColor: canAfford ? "#2A2F27" : "#D6CDB4",
          color: canAfford ? "#2A2F27" : "#D6CDB4",
          cursor: canAfford ? "pointer" : "not-allowed",
        }}
      >
        {canAfford ? "TAKE ACTION" : "NOT ENOUGH ACTIONS"}
      </button>
    </div>
  );
}

function iconBtnClass(disabled: boolean) {
  return `bg-transparent border p-1 flex items-center justify-center ${
    disabled ? "border-[#D6CDB4] text-[#D6CDB4] cursor-not-allowed" : "border-[#2A2F27] text-[#2A2F27] cursor-pointer"
  }`;
}

export default function ActionEconomy({
  actions,
  initialWeekState,
  initialLog,
  quizStudentsAttempted,
}: {
  actions: ActionItem[];
  initialWeekState: WeekStateMap;
  initialLog: LogEntry[];
  quizStudentsAttempted: number;
}) {
  const [week, setWeek] = useState(1);
  const [weekStateMap, setWeekStateMap] = useState<WeekStateMap>(initialWeekState);
  const [log, setLog] = useState<LogEntry[]>(initialLog);
  const [saveError, setSaveError] = useState(false);
  const [pending, setPending] = useState(false);

  const current: WeekState = weekStateMap[week] ?? { trustBonus: 0, actionsSpent: 0 };
  const totalAvailable = BASELINE_ACTIONS + current.trustBonus;
  const remaining = totalAvailable - current.actionsSpent;
  const isQuizWeek = week === QUIZ_WEEK;

  const changeWeek = (delta: number) => {
    setWeek((w) => Math.min(MAX_WEEK, Math.max(1, w + delta)));
  };

  const changeTrust = async (delta: number) => {
    const next = Math.min(MAX_TRUST_BONUS, Math.max(0, current.trustBonus + delta));
    if (next === current.trustBonus) return;
    setSaveError(false);
    try {
      const res = await fetch("/api/actions/trust", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, trustBonus: next }),
      });
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      const data = await res.json();
      setWeekStateMap((prev) => ({ ...prev, [week]: data.weekState }));
    } catch {
      setSaveError(true);
    }
  };

  const takeAction = async (action: ActionItem) => {
    if (remaining < action.cost || pending) return;
    setSaveError(false);
    setPending(true);
    try {
      const res = await fetch("/api/actions/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, actionId: action.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      setWeekStateMap((prev) => ({ ...prev, [week]: data.weekState }));
      setLog((prev) => [data.logEntry, ...prev]);
    } catch {
      setSaveError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-[#23262B] min-h-full px-6 py-8">
      <div className="max-w-[640px] mx-auto">
        <div className="flex justify-between items-end mb-1.5">
          <h1 className="font-serif font-semibold text-2xl text-[#E8E1D0] m-0">Investigation resources</h1>
          <Link href="/dashboard" className="font-mono text-[11px] text-[#8A8A80] underline shrink-0 ml-4">
            back to dashboard
          </Link>
        </div>
        <p className="font-mono text-xs text-[#8A8A80] mb-6 mt-0 border-b border-[#A6764A55] pb-4">
          Boresfield review &mdash; allocate your team&apos;s actions each week.
        </p>

        <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4.5 mb-5">
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-2.5">
              <button onClick={() => changeWeek(-1)} disabled={week <= 1} aria-label="Previous week" className={iconBtnClass(week <= 1)}>
                <ChevronLeftIcon size={16} />
              </button>
              <span className="font-serif font-semibold text-lg text-[#2A2F27] min-w-[70px] text-center">
                Week {week}
              </span>
              <button onClick={() => changeWeek(1)} disabled={week >= MAX_WEEK} aria-label="Next week" className={iconBtnClass(week >= MAX_WEEK)}>
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2.5">
            <span className="font-mono text-xs text-[#5B5A4E]">
              {isQuizWeek
                ? `Trust bonus this week (average of ${quizStudentsAttempted} student${quizStudentsAttempted === 1 ? "" : "s"}' quiz scores)`
                : "Trust bonus this week (from the institutional insight task)"}
            </span>
            {isQuizWeek ? (
              <span className="font-mono text-[13px] text-[#2A2F27] min-w-4 text-center">+{current.trustBonus}</span>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeTrust(-1)}
                  disabled={current.trustBonus <= 0}
                  aria-label="Decrease trust bonus"
                  className={iconBtnClass(current.trustBonus <= 0)}
                >
                  <MinusIcon size={14} />
                </button>
                <span className="font-mono text-[13px] text-[#2A2F27] min-w-4 text-center">+{current.trustBonus}</span>
                <button
                  onClick={() => changeTrust(1)}
                  disabled={current.trustBonus >= MAX_TRUST_BONUS}
                  aria-label="Increase trust bonus"
                  className={iconBtnClass(current.trustBonus >= MAX_TRUST_BONUS)}
                >
                  <PlusIcon size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-dotted border-[#A6764A] pt-3 flex justify-between items-center flex-wrap gap-2.5">
            <span className="font-mono text-xs text-[#5B5A4E]">
              {BASELINE_ACTIONS} baseline + {current.trustBonus} trust = {totalAvailable} available &middot; {remaining} remaining
            </span>
            <Pips total={totalAvailable} used={current.actionsSpent} />
          </div>
        </div>

        {actions.map((action) => (
          <ActionCard key={action.id} action={action} canAfford={remaining >= action.cost && !pending} onTake={() => takeAction(action)} />
        ))}

        <div className="mt-7">
          <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-3 mt-0">Case action log</h2>
          {log.length === 0 ? (
            <p className="font-mono text-xs text-[#8A8A80]">No actions taken yet.</p>
          ) : (
            log.map((entry, i) => (
              <div key={i} className="border-l-2 border-[#A6764A] pl-3.5 mb-3.5">
                <p className="font-mono text-[11px] text-[#A6764A] mb-0.5 mt-0">
                  Week {entry.week} &middot; {entry.label}
                </p>
                <p className="font-mono text-xs text-[#C9C4B3] leading-relaxed m-0">{entry.outcome}</p>
              </div>
            ))
          )}
        </div>

        {saveError && (
          <p className="font-mono text-[11px] text-[#8B3226] mt-4">Couldn&apos;t save &mdash; try again.</p>
        )}
      </div>
    </div>
  );
}
