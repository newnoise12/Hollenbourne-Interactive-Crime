"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { CATEGORY_META, THREAD_META, THREAD_ORDER, MAX_TRUST_BONUS, MAX_WEEK, type ActionItem } from "@/lib/actions-catalog";
import { ALL_QUIZ_WEEKS } from "@/lib/quiz-catalog";
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

function ActionCard({
  action,
  canAfford,
  canAffordFromReserve,
  locked,
  requirementLabel,
  onTake,
}: {
  action: ActionItem;
  canAfford: boolean;
  canAffordFromReserve: boolean;
  locked: boolean;
  requirementLabel: string | null;
  onTake: (useReserve: boolean) => void;
}) {
  const meta = CATEGORY_META[action.category];
  const disabled = locked || !canAfford;
  return (
    <div
      className="bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 px-4 py-3.5 mb-3"
      style={{ borderLeftColor: locked ? "#8A8A80" : meta.color, opacity: locked ? 0.6 : 1 }}
    >
      <div className="flex justify-between items-baseline mb-1.5 flex-wrap gap-2">
        <span className="font-mono text-[11px]" style={{ color: locked ? "#8A8A80" : meta.color }}>
          {meta.label}
        </span>
        <div className="flex gap-2">
          {locked && (
            <span className="font-mono text-[11px] text-[#8A8A80] border border-[#8A8A80] px-2 py-0.5">LOCKED</span>
          )}
          <span className="font-mono text-[11px] text-[#5B5A4E] border border-[#D6CDB4] px-2 py-0.5">
            cost: {action.cost}
          </span>
        </div>
      </div>
      <h4 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-1 mt-0">{action.label}</h4>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-2.5 mt-0">{action.description}</p>
      {locked && requirementLabel && (
        <p className="font-mono text-xs text-[#8B3226] mb-2.5 mt-0">requires: {requirementLabel}</p>
      )}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onTake(false)}
          disabled={disabled}
          className="font-mono text-xs tracking-wide bg-transparent px-3.5 py-1.5 border"
          style={{
            borderColor: disabled ? "#D6CDB4" : "#2A2F27",
            color: disabled ? "#D6CDB4" : "#2A2F27",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {locked ? "LOCKED" : canAfford ? "TAKE ACTION" : "NOT ENOUGH ACTIONS"}
        </button>
        {!locked && !canAfford && canAffordFromReserve && (
          <button
            onClick={() => onTake(true)}
            className="font-mono text-xs tracking-wide bg-transparent px-3.5 py-1.5 border border-[#93650F] text-[#93650F] cursor-pointer"
            title="Uses your team's shared, permanent case reserve instead of this week's budget"
          >
            PAY WITH RESERVE
          </button>
        )}
      </div>
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
  quizStudentsAttemptedByWeek,
  baselineActions,
  initialReservePoints,
}: {
  actions: ActionItem[];
  initialWeekState: WeekStateMap;
  initialLog: LogEntry[];
  quizStudentsAttemptedByWeek: Record<number, number>;
  baselineActions: number;
  initialReservePoints: number;
}) {
  const [week, setWeek] = useState(1);
  const [weekStateMap, setWeekStateMap] = useState<WeekStateMap>(initialWeekState);
  const [log, setLog] = useState<LogEntry[]>(initialLog);
  const [reservePoints, setReservePoints] = useState(initialReservePoints);
  const [saveError, setSaveError] = useState(false);
  const [pending, setPending] = useState(false);
  const [pendingReserveAction, setPendingReserveAction] = useState<ActionItem | null>(null);

  const current: WeekState = weekStateMap[week] ?? { trustBonus: 0, actionsSpent: 0 };
  const totalAvailable = baselineActions + current.trustBonus;
  const remaining = totalAvailable - current.actionsSpent;
  const isQuizWeek = (ALL_QUIZ_WEEKS as number[]).includes(week);
  const quizStudentsAttempted = quizStudentsAttemptedByWeek[week] ?? 0;
  const canBank = current.trustBonus > 0 && remaining >= 2;

  // Prerequisites are permanent, not weekly — completed in any week, on any
  // team's own timeline, they stay completed. Derived from the live log
  // state so a just-taken prerequisite unlocks its follow-up immediately,
  // without needing a reload.
  const completedActionIds = new Set(log.map((entry) => entry.actionId));
  const actionsById = new Map(actions.map((a) => [a.id, a]));

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

  const isLocked = (action: ActionItem) =>
    (!!action.prerequisiteActionIds?.length && !action.prerequisiteActionIds.every((id) => completedActionIds.has(id))) ||
    (!!action.availableFromWeek && week < action.availableFromWeek);

  const takeAction = async (action: ActionItem, useReserve: boolean) => {
    if (isLocked(action) || pending) return;
    if (useReserve) {
      if (reservePoints < action.cost) return;
      setPendingReserveAction(action);
      return;
    }
    if (remaining < action.cost) return;
    await submitTakeAction(action, false);
  };

  const submitTakeAction = async (action: ActionItem, useReserve: boolean) => {
    setSaveError(false);
    setPending(true);
    try {
      const res = await fetch("/api/actions/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, actionId: action.id, useReserve }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      setWeekStateMap((prev) => ({ ...prev, [week]: data.weekState }));
      setReservePoints(data.reservePoints);
      setLog((prev) => [data.logEntry, ...prev]);
      setPendingReserveAction(null);
    } catch {
      setSaveError(true);
    } finally {
      setPending(false);
    }
  };

  const bank = async () => {
    if (!canBank || pending) return;
    setSaveError(false);
    setPending(true);
    try {
      const res = await fetch("/api/actions/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      setWeekStateMap((prev) => ({ ...prev, [week]: data.weekState }));
      setReservePoints(data.reservePoints);
    } catch {
      setSaveError(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
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
                ? `Trust bonus this week (average of ${quizStudentsAttempted} student${quizStudentsAttempted === 1 ? "'s" : "s'"} quiz scores)`
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
              {baselineActions} baseline + {current.trustBonus} trust = {totalAvailable} available &middot; {remaining} remaining
            </span>
            <Pips total={totalAvailable} used={current.actionsSpent} />
          </div>
        </div>

        <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4.5 mb-5 flex justify-between items-center flex-wrap gap-3">
          <div>
            <p className="font-mono text-xs text-[#5B5A4E] m-0">Case reserve (permanent, team-wide)</p>
            <p className="font-serif font-semibold text-lg text-[#2A2F27] m-0">{reservePoints} pt{reservePoints === 1 ? "" : "s"}</p>
          </div>
          <button
            onClick={bank}
            disabled={!canBank || pending}
            className="font-mono text-xs tracking-wide bg-transparent px-3.5 py-1.5 border"
            style={{
              borderColor: !canBank || pending ? "#D6CDB4" : "#93650F",
              color: !canBank || pending ? "#D6CDB4" : "#93650F",
              cursor: !canBank || pending ? "not-allowed" : "pointer",
            }}
            title="Convert 2 of this week's unspent points into 1 permanent case-reserve point"
          >
            BANK 2 POINTS &rarr; +1 RESERVE
          </button>
        </div>

        {THREAD_ORDER.map((thread) => {
          const threadActions = actions.filter((a) => a.thread === thread);
          if (threadActions.length === 0) return null;
          const meta = THREAD_META[thread];
          return (
            <div key={thread} className="mb-7">
              <div className="flex items-baseline gap-2.5 mb-1">
                <h3 className="font-serif font-semibold text-base text-[#E8E1D0] m-0">{meta.label}</h3>
                <span className="font-mono text-[11px] text-[#8A8A80]">
                  {threadActions.length} action{threadActions.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="font-mono text-xs text-[#8A8A80] mb-3 mt-0 max-w-[56ch]">{meta.note}</p>
              {threadActions.map((action) => {
                const locked = isLocked(action);
                const missingPrereqLabels = (action.prerequisiteActionIds ?? [])
                  .filter((id) => !completedActionIds.has(id))
                  .map((id) => {
                    const prerequisite = actionsById.get(id);
                    return prerequisite ? prerequisite.shortLabel ?? prerequisite.label : id;
                  });
                const weekLabel =
                  action.availableFromWeek && week < action.availableFromWeek ? `Week ${action.availableFromWeek}` : null;
                const requirementLabel = [...missingPrereqLabels, ...(weekLabel ? [weekLabel] : [])].join(", ") || null;
                return (
                  <ActionCard
                    key={action.id}
                    action={action}
                    canAfford={remaining >= action.cost && !pending}
                    canAffordFromReserve={reservePoints >= action.cost && !pending}
                    locked={locked}
                    requirementLabel={requirementLabel}
                    onTake={(useReserve) => takeAction(action, useReserve)}
                  />
                );
              })}
            </div>
          );
        })}

        {pendingReserveAction && (
          <div className="bg-[#F4EFE1] border border-[#93650F] px-5 py-4 mb-5">
            <p className="font-mono text-[13px] text-[#2A2F27] mb-1 mt-0">
              This will use your team&apos;s shared, permanent case reserve ({pendingReserveAction.cost} of {reservePoints}{" "}
              point{reservePoints === 1 ? "" : "s"}) instead of this week&apos;s budget.
            </p>
            <p className="font-mono text-xs text-[#5B5A4E] mb-4 mt-0">Do you have your team&apos;s agreement to spend it?</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => submitTakeAction(pendingReserveAction, true)}
                disabled={pending}
                className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-5 py-2.5 border border-[#2A2F27] disabled:opacity-50"
              >
                {pending ? "SUBMITTING…" : "YES, SPEND RESERVE"}
              </button>
              <button
                onClick={() => setPendingReserveAction(null)}
                disabled={pending}
                className="font-mono text-xs tracking-wide bg-transparent text-[#5B5A4E] px-5 py-2.5 border border-[#5B5A4E] disabled:opacity-50"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

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
  );
}
