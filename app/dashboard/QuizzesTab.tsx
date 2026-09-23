"use client";

import { useState } from "react";
import type { Student } from "@/lib/students";
import type { RankQuizAttempt, GenericQuizAttempt } from "@/lib/quiz";
import { STAGE_1_ITEMS, STAGE_2_ITEMS, QUIZ_TITLE, QUIZ_WEEK, QUIZ_DEFS } from "@/lib/quiz-catalog";
import WhoAreYou from "./quiz/WhoAreYou";
import TrustQuiz from "./quiz/TrustQuiz";
import McqQuiz from "./quiz/[quizId]/McqQuiz";
import MultiselectQuiz from "./quiz/[quizId]/MultiselectQuiz";

function QuizCard({
  title,
  weekLabel,
  status,
  children,
}: {
  title: string;
  weekLabel: string;
  status: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap bg-transparent"
      >
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
  return `best ${best}/${attempts[0].maxScore}`;
}

export default function QuizzesTab({
  validStudent,
  roster,
  week2Attempts,
  genericAttempts,
}: {
  validStudent: { id: string; name: string } | null;
  roster: Student[];
  week2Attempts: RankQuizAttempt[];
  genericAttempts: Record<string, GenericQuizAttempt[]>;
}) {
  if (!validStudent) {
    return <WhoAreYou students={roster} />;
  }

  return (
    <div>
      <p className="font-mono text-xs text-[#8A8A80] mb-4 mt-0 border-b border-[#A6764A55] pb-4">
        Answering as <span className="text-[#E8E1D0]">{validStudent.name}</span> &mdash; each quiz is scored per
        student, and your team&apos;s weekly trust bonus is the average of everyone&apos;s best score.
      </p>

      <QuizCard title={QUIZ_TITLE} weekLabel={`Week ${QUIZ_WEEK}`} status={rankStatus(week2Attempts)}>
        <TrustQuiz
          stage1Items={STAGE_1_ITEMS}
          stage2Items={STAGE_2_ITEMS}
          initialAttempts={week2Attempts}
          studentName={validStudent.name}
        />
      </QuizCard>

      {QUIZ_DEFS.map((quiz) => (
        <QuizCard key={quiz.id} title={quiz.title} weekLabel={`Week ${quiz.week}`} status={genericStatus(genericAttempts[quiz.id] ?? [])}>
          {quiz.kind === "mcq" ? (
            <McqQuiz quiz={quiz} initialAttempts={genericAttempts[quiz.id] ?? []} studentName={validStudent.name} />
          ) : (
            <MultiselectQuiz quiz={quiz} initialAttempts={genericAttempts[quiz.id] ?? []} studentName={validStudent.name} />
          )}
        </QuizCard>
      ))}
    </div>
  );
}
