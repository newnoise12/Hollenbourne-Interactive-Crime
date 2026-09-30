"use client";

import { useState } from "react";
import LogoutButton from "./LogoutButton";
import ActionEconomy from "./actions/ActionEconomy";
import EvidenceBoard from "./case-log/EvidenceBoard";
import WeeklyOverviewTab from "./WeeklyOverviewTab";
import type { ActionItem } from "@/lib/actions-catalog";
import type { WeekStateMap, LogEntry } from "@/lib/actions";
import type { EvidenceItem } from "@/lib/evidence-catalog";
import type { Board } from "@/lib/board";
import type { Student } from "@/lib/students";
import type { RankQuizAttempt, GenericQuizAttempt } from "@/lib/quiz";
import type { Cw2Draft } from "@/lib/cw2-practice";

type Tab = "overview" | "investigation" | "case-log";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "This Week" },
  { id: "investigation", label: "Investigation" },
  { id: "case-log", label: "Case Log" },
];

export default function DashboardShell({
  teamName,
  currentWeek,
  actions,
  initialWeekState,
  initialLog,
  quizStudentsAttemptedByWeek,
  baselineActions,
  initialReservePoints,
  evidence,
  initialBoard,
  validStudent,
  roster,
  week2Attempts,
  genericAttempts,
  cw2Draft,
}: {
  teamName: string;
  currentWeek: number;
  actions: ActionItem[];
  initialWeekState: WeekStateMap;
  initialLog: LogEntry[];
  quizStudentsAttemptedByWeek: Record<number, number>;
  baselineActions: number;
  initialReservePoints: number;
  evidence: EvidenceItem[];
  initialBoard: Board;
  validStudent: { id: string; name: string } | null;
  roster: Student[];
  week2Attempts: RankQuizAttempt[];
  genericAttempts: Record<string, GenericQuizAttempt[]>;
  cw2Draft: Cw2Draft | null;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="bg-[#23262B]/80 min-h-full px-6 py-8">
      <div className="max-w-[640px] mx-auto">
        <div className="flex justify-between items-start mb-1 pb-5 border-b-[3px] border-double border-[#A6764A]">
          <div>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#A6764A] m-0">
              Hollenbourne Police &middot; Case Review Panel
            </p>
            <h1 className="font-serif font-bold text-[26px] text-[#E8E1D0] m-0 mt-0.5">The Hollenbourne Case</h1>
            <p className="font-mono text-xs text-[#8A8A80] m-0 mt-1">Mason &middot; Wooley &middot; Porterhouse &middot; Butt &mdash; four deaths, one review</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="font-mono text-[11px] text-[#8A8A80] m-0">
              Team <span className="text-[#E8E1D0]">{teamName}</span>
            </p>
            <div className="mt-1.5">
              <LogoutButton />
            </div>
          </div>
        </div>

        <nav className="flex gap-1 border-b border-[#A6764A55] mb-6 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="font-mono text-xs tracking-wide px-3.5 py-2.5 border-b-2 -mb-px bg-transparent"
              style={{
                borderBottomColor: tab === t.id ? "#A6764A" : "transparent",
                color: tab === t.id ? "#E8E1D0" : "#8A8A80",
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div hidden={tab !== "overview"}>
          <WeeklyOverviewTab
            currentWeek={currentWeek}
            validStudent={validStudent}
            roster={roster}
            week2Attempts={week2Attempts}
            genericAttempts={genericAttempts}
            evidence={evidence}
            log={initialLog}
            reservePoints={initialReservePoints}
            cw2Draft={cw2Draft}
            onNavigate={setTab}
          />
        </div>
        <div hidden={tab !== "investigation"}>
          <ActionEconomy
            actions={actions}
            initialWeekState={initialWeekState}
            initialLog={initialLog}
            quizStudentsAttemptedByWeek={quizStudentsAttemptedByWeek}
            baselineActions={baselineActions}
            initialReservePoints={initialReservePoints}
            currentWeek={currentWeek}
          />
        </div>
        <div hidden={tab !== "case-log"}>
          <EvidenceBoard
            evidence={evidence}
            initialBoard={initialBoard}
            currentWeek={currentWeek}
            completedActionIds={new Set(initialLog.map((e) => e.actionId))}
            actions={actions}
          />
        </div>
      </div>
    </div>
  );
}
