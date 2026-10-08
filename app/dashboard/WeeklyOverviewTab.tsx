"use client";

import { useState } from "react";
import type { Student } from "@/lib/students";
import type { RankQuizAttempt, GenericQuizAttempt } from "@/lib/quiz";
import type { ClientEvidence } from "@/lib/team-view";
import type { LogEntry } from "@/lib/actions";
import type { Cw2Draft } from "@/lib/cw2-practice";
import type { ReferencePracticeDraft } from "@/lib/reference-practice";
import { STAGE_1_ITEMS, STAGE_2_ITEMS, QUIZ_TITLE, QUIZ_WEEK, QUIZ_DEFS, isPerfectAttempt } from "@/lib/quiz-catalog";
import { MOCK_CW2_WEEK } from "@/lib/cw2-items";
import WhoAreYou from "./quiz/WhoAreYou";
import TrustQuiz from "./quiz/TrustQuiz";
import McqQuiz from "./quiz/[quizId]/McqQuiz";
import MultiselectQuiz from "./quiz/[quizId]/MultiselectQuiz";
import ReferencingPractice, { REFERENCE_TASK_COUNT } from "./quiz/ReferencingPractice";
import MockCw2Practice from "./quiz/MockCw2Practice";

const EMPTY_CW2_DRAFT: Cw2Draft = { selectedItemIds: [], responses: {}, synthesis: null, synthesisFeedback: null, checksUsedToday: 0 };

function cw2Status(draft: Cw2Draft | null): string {
  const d = draft ?? EMPTY_CW2_DRAFT;
  if (d.synthesisFeedback) return "synthesis complete";
  const doneCount = d.selectedItemIds.filter((id) => d.responses[id]?.feedback).length;
  if (doneCount === 0) return "not started";
  return `${doneCount} of 3 data types done`;
}

function QuizCard({ title, weekLabel, status, defaultOpen, children }: {
  title: string;
  weekLabel: string;
  status: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] mb-3">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap bg-transparent">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-[#A6764A]">{weekLabel}</span>
          <h4 className="font-serif font-semibold text-[15px] text-[#2A2F27] m-0">{title}</h4>
        </div>
        <span className="font-mono text-xs text-[#5B5A4E]">{status} {open ? "−" : "+"}</span>
      </button>
      <div hidden={!open} className="px-5 pb-5 border-t border-[#D6CDB4]">
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

function rankStatus(attempts: RankQuizAttempt[]): string {
  if (attempts.length === 0) return "not started";
  const best = Math.max(...attempts.map((a) => a.score));
  return `best ${best}/${attempts[0].maxScore}`;
}

function genericStatus(attempts: GenericQuizAttempt[]): string {
  if (attempts.length === 0) return "not started";
  const best = Math.max(...attempts.map((a) => a.score));
  if (attempts.some(isPerfectAttempt)) return `✓ complete (+${best})`;
  // Not perfect yet, but handed in and saved — say so, rather than just a
  // bare "best 2/3" that reads as unfinished.
  const top = attempts.reduce((a, b) => (b.score > a.score || (b.score === a.score && b.correct > a.correct) ? b : a));
  return `✓ submitted — ${top.correct}/${top.total} correct (+${best})`;
}

// The Week 3 referencing quiz is two stages under one card: only Stage 1 is
// scored, but the card's status shows both so it's clear what's been done.
function referencingStatus(attempts: GenericQuizAttempt[], draft: ReferencePracticeDraft): string {
  const submitted = Object.values(draft).filter((r) => r.submitted).length;
  return `Stage 1: ${genericStatus(attempts)} · Stage 2: ${submitted}/${REFERENCE_TASK_COUNT} submitted`;
}

function statusFor(quizId: string, attempts: GenericQuizAttempt[], draft: ReferencePracticeDraft): string {
  return quizId === "week3-referencing" ? referencingStatus(attempts, draft) : genericStatus(attempts);
}

type Tab = "overview" | "investigation" | "case-log";

export default function WeeklyOverviewTab({
  currentWeek,
  validStudent,
  roster,
  week2Attempts,
  genericAttempts,
  evidence,
  totalEvidence,
  log,
  reservePoints,
  cw2Draft,
  referenceDraft,
  onNavigate,
}: {
  currentWeek: number;
  validStudent: { id: string; name: string } | null;
  roster: Student[];
  week2Attempts: RankQuizAttempt[];
  genericAttempts: Record<string, GenericQuizAttempt[]>;
  evidence: ClientEvidence[];
  totalEvidence: number;
  log: LogEntry[];
  reservePoints: number;
  cw2Draft: Cw2Draft | null;
  referenceDraft: ReferencePracticeDraft;
  onNavigate: (tab: Tab) => void;
}) {
  // Worked out on the server (lib/team-view.ts), which only sends what the team has unlocked.
  const unlockedCount = evidence.filter((e) => e.unlocked).length;
  const newlyUnlocked = evidence.filter((e) => e.unlocked && e.unlocksWeek === currentWeek);

  const thisWeekGeneric = QUIZ_DEFS.filter((q) => q.week === currentWeek);
  const hasWeek2Quiz = currentWeek === QUIZ_WEEK;
  const hasCw2ThisWeek = currentWeek === MOCK_CW2_WEEK;
  const hasAnyQuizThisWeek = hasWeek2Quiz || thisWeekGeneric.length > 0 || hasCw2ThisWeek;

  // Past weeks' activities only — future weeks stay hidden until the
  // instructor rolls the current week forward, per the game's own
  // week-gating design elsewhere (evidence, actions). Built as one list
  // and sorted by week so it reads in order, rather than three separate
  // un-interleaved blocks (week2 / generic / cw2) in catalog order.
  type PastActivity =
    | { kind: "week2"; week: number }
    | { kind: "generic"; week: number; quiz: (typeof QUIZ_DEFS)[number] }
    | { kind: "cw2"; week: number };
  const pastActivities: PastActivity[] = [
    ...(QUIZ_WEEK < currentWeek ? ([{ kind: "week2", week: QUIZ_WEEK }] as const) : []),
    ...QUIZ_DEFS.filter((q) => q.week < currentWeek).map((quiz) => ({ kind: "generic" as const, week: quiz.week, quiz })),
    ...(MOCK_CW2_WEEK < currentWeek ? ([{ kind: "cw2", week: MOCK_CW2_WEEK }] as const) : []),
  ].sort((a, b) => a.week - b.week);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1 pb-4 border-b border-[#A6764A55]">
        <h2 className="font-serif font-bold text-xl text-[#E8E1D0] m-0">Week {currentWeek}</h2>
      </div>

      <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4.5 my-5">
        <h3 className="font-serif font-semibold text-lg text-[#2A2F27] mb-2.5 mt-0">This week&apos;s activity</h3>
        {!validStudent ? (
          <>
            {!hasAnyQuizThisWeek && (
              <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mb-4 mt-0">
                No scored activity this week &mdash; identify yourself below if you want to review or catch up on
                another week&apos;s quiz.
              </p>
            )}
            <WhoAreYou students={roster} />
          </>
        ) : !hasAnyQuizThisWeek ? (
          <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mb-0 mt-0">
            No scored activity this week &mdash; spend the week on the Investigation and Case Log tabs instead.
          </p>
        ) : (
          <>
            <p className="font-mono text-xs text-[#8A8A80] mb-4 mt-0">
              Answering as <span className="text-[#2A2F27]">{validStudent.name}</span> &mdash; scored per student,
              averaged into your team&apos;s trust bonus.
            </p>
            {hasWeek2Quiz && (
              <QuizCard title={QUIZ_TITLE} weekLabel={`Week ${QUIZ_WEEK}`} status={rankStatus(week2Attempts)} defaultOpen>
                <TrustQuiz
                  stage1Items={STAGE_1_ITEMS}
                  stage2Items={STAGE_2_ITEMS}
                  initialAttempts={week2Attempts}
                  studentName={validStudent.name}
                />
              </QuizCard>
            )}
            {thisWeekGeneric.map((quiz) => (
              <QuizCard key={quiz.id} title={quiz.title} weekLabel={`Week ${quiz.week}`} status={statusFor(quiz.id, genericAttempts[quiz.id] ?? [], referenceDraft)} defaultOpen>
                {quiz.id === "week3-referencing" && (
                  <h3 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1 mt-0">Stage 1 — Multiple choice</h3>
                )}
                {quiz.kind === "mcq" ? (
                  <McqQuiz quiz={quiz} initialAttempts={genericAttempts[quiz.id] ?? []} studentName={validStudent.name} />
                ) : (
                  <MultiselectQuiz quiz={quiz} initialAttempts={genericAttempts[quiz.id] ?? []} studentName={validStudent.name} />
                )}
                {quiz.id === "week3-referencing" && <ReferencingPractice initialDraft={referenceDraft} studentName={validStudent.name} />}
              </QuizCard>
            ))}
            {hasCw2ThisWeek && (
              <QuizCard title="Mock CW2 Practice" weekLabel={`Week ${MOCK_CW2_WEEK}`} status={cw2Status(cw2Draft)} defaultOpen>
                <MockCw2Practice initialDraft={cw2Draft ?? EMPTY_CW2_DRAFT} studentName={validStudent.name} />
              </QuizCard>
            )}
          </>
        )}
      </div>

      {newlyUnlocked.length > 0 && (
        <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-5 py-4.5 mb-5">
          <h3 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-2 mt-0">Newly unlocked this week</h3>
          <ul className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed pl-4 my-0 space-y-1">
            {newlyUnlocked.map((item) => (
              <li key={item.id}>{item.exhibit} &mdash; {item.title}</li>
            ))}
          </ul>
          {currentWeek === 9 && (
            <p className="font-mono text-xs text-[#8A8A80] mt-3 mb-0">
              The full baseline case file lands for all four victims at once this week &mdash; the point is to spot a
              pattern across all of them together, not case by case.
            </p>
          )}
        </div>
      )}

      <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-5 py-4.5 mb-8">
        <h3 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-3 mt-0">Your team&apos;s progress</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[13px] text-[#5B5A4E] mb-4">
          <span>{unlockedCount} / {totalEvidence} evidence unlocked</span>
          <span>{log.length} action{log.length === 1 ? "" : "s"} taken</span>
          <span>{reservePoints} reserve pt{reservePoints === 1 ? "" : "s"}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onNavigate("investigation")}
            className="font-mono text-xs tracking-wide bg-transparent px-3.5 py-1.5 border border-[#2A2F27] text-[#2A2F27] cursor-pointer"
          >
            GO TO INVESTIGATION
          </button>
          <button
            onClick={() => onNavigate("case-log")}
            className="font-mono text-xs tracking-wide bg-transparent px-3.5 py-1.5 border border-[#2A2F27] text-[#2A2F27] cursor-pointer"
          >
            GO TO CASE LOG
          </button>
        </div>
      </div>

      {validStudent && pastActivities.length > 0 && (
        <div>
          <h3 className="font-serif font-semibold text-[15px] text-[#E8E1D0] mb-3 mt-0">Other weeks&apos; activities</h3>
          <p className="font-mono text-xs text-[#8A8A80] mb-4 mt-0">
            Past weeks only, in order &mdash; nothing from a week that hasn&apos;t arrived yet.
          </p>
          {pastActivities.map((activity) => {
            if (activity.kind === "week2") {
              return (
                <QuizCard key="week2" title={QUIZ_TITLE} weekLabel={`Week ${QUIZ_WEEK}`} status={rankStatus(week2Attempts)}>
                  <TrustQuiz
                    stage1Items={STAGE_1_ITEMS}
                    stage2Items={STAGE_2_ITEMS}
                    initialAttempts={week2Attempts}
                    studentName={validStudent.name}
                  />
                </QuizCard>
              );
            }
            if (activity.kind === "cw2") {
              return (
                <QuizCard key="cw2" title="Mock CW2 Practice" weekLabel={`Week ${MOCK_CW2_WEEK}`} status={cw2Status(cw2Draft)}>
                  <MockCw2Practice initialDraft={cw2Draft ?? EMPTY_CW2_DRAFT} studentName={validStudent.name} />
                </QuizCard>
              );
            }
            const quiz = activity.quiz;
            return (
              <QuizCard key={quiz.id} title={quiz.title} weekLabel={`Week ${quiz.week}`} status={statusFor(quiz.id, genericAttempts[quiz.id] ?? [], referenceDraft)}>
                {quiz.id === "week3-referencing" && (
                  <h3 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1 mt-0">Stage 1 — Multiple choice</h3>
                )}
                {quiz.kind === "mcq" ? (
                  <McqQuiz quiz={quiz} initialAttempts={genericAttempts[quiz.id] ?? []} studentName={validStudent.name} />
                ) : (
                  <MultiselectQuiz quiz={quiz} initialAttempts={genericAttempts[quiz.id] ?? []} studentName={validStudent.name} />
                )}
                {quiz.id === "week3-referencing" && <ReferencingPractice initialDraft={referenceDraft} studentName={validStudent.name} />}
              </QuizCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
