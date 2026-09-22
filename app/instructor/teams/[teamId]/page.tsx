import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getTeamDetail } from "@/lib/instructor-data";
import { getEvidenceItem } from "@/lib/evidence-catalog";
import { BASELINE_ACTIONS, MAX_WEEK } from "@/lib/actions-catalog";
import { STAGE_1_ITEMS, STAGE_2_ITEMS, MAX_ATTEMPTS, QUIZ_WEEK } from "@/lib/quiz-catalog";
import type { TeamQuizWeekDetail } from "@/lib/instructor-data";

export default async function InstructorTeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const sessionId = (await cookies()).get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (!(await isValidInstructorSession(sessionId))) {
    redirect("/instructor/login");
  }

  const { teamId } = await params;
  const detail = await getTeamDetail(teamId);
  if (!detail) {
    notFound();
  }

  const { team, citations, weekState, log, quizWeeks } = detail;
  const weeksWithActivity = Object.keys(weekState)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <main className="flex-1 px-4 py-10 max-w-3xl mx-auto w-full">
      <Link href="/instructor" className="text-sm text-neutral-500 underline">
        ← all teams
      </Link>
      <h1 className="text-2xl font-semibold mt-2 mb-1">{team.name}</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Registered {team.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Case log citations</h2>
        {Object.keys(citations).length === 0 ? (
          <p className="text-sm text-neutral-500">No exhibits cited yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(citations).map(([exhibitId, citation]) => {
              const item = getEvidenceItem(exhibitId);
              return (
                <div key={exhibitId} className="border border-neutral-200 rounded-lg p-4">
                  <p className="text-xs text-neutral-500 mb-1">
                    {exhibitId.toUpperCase()} — {item?.title ?? "unknown exhibit"}
                  </p>
                  <p className="text-sm">{citation.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Investigation actions</h2>
        {weeksWithActivity.length === 0 ? (
          <p className="text-sm text-neutral-500 mb-4">No actions taken in any week (max week {MAX_WEEK}).</p>
        ) : (
          <div className="overflow-x-auto border border-neutral-200 rounded-lg mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left text-neutral-500 border-b border-neutral-200">
                  <th className="px-4 py-2 font-medium">Week</th>
                  <th className="px-4 py-2 font-medium">Trust bonus</th>
                  <th className="px-4 py-2 font-medium">Actions spent</th>
                  <th className="px-4 py-2 font-medium">Available</th>
                </tr>
              </thead>
              <tbody>
                {weeksWithActivity.map((week) => {
                  const state = weekState[week];
                  return (
                    <tr key={week} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-2">Week {week}</td>
                      <td className="px-4 py-2">+{state.trustBonus}</td>
                      <td className="px-4 py-2">{state.actionsSpent}</td>
                      <td className="px-4 py-2">{BASELINE_ACTIONS + state.trustBonus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <h3 className="text-sm font-semibold text-neutral-700 mb-2">Permanent action log</h3>
        {log.length === 0 ? (
          <p className="text-sm text-neutral-500">No actions taken yet.</p>
        ) : (
          <div className="space-y-2">
            {log.map((entry, i) => (
              <div key={i} className="border-l-2 border-neutral-300 pl-3">
                <p className="text-xs text-neutral-500">
                  Week {entry.week} · {entry.label}
                </p>
                <p className="text-sm text-neutral-700">{entry.outcome}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {quizWeeks.map((qw) => (
        <QuizWeekSection key={qw.week} quizWeek={qw} />
      ))}
    </main>
  );
}

function QuizWeekSection({ quizWeek }: { quizWeek: TeamQuizWeekDetail }) {
  const { week, average, breakdown } = quizWeek;
  const isRankingWeek = week === QUIZ_WEEK;
  const quizTitle = isRankingWeek ? "Week 2 ranking activity" : `Week ${week} quiz`;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{quizTitle}</h2>
      {breakdown.length === 0 ? (
        <p className="text-sm text-neutral-500">No students have attempted this yet.</p>
      ) : (
        <div>
          <p className="text-sm mb-2">
            Team average: <span className="font-semibold">{average} / 3</span> (applied as the Week {week} trust
            bonus) — {breakdown.length} student{breakdown.length === 1 ? "" : "s"} contributing
          </p>
          <p className="text-xs text-neutral-500 mb-5">
            This reflects who was on the team when they took it, not who&apos;s on it now — a student moved to
            another team afterwards still counts here, and this average never changes as a result of a later move.
          </p>
          {breakdown.map((student) => {
            const bestScore = Math.max(...student.attempts.map((a) => a.score));
            return (
              <div key={student.studentId} className="mb-8 border-t border-neutral-200 pt-4 first:border-0 first:pt-0">
                <p className="text-sm font-semibold mb-3">
                  {student.studentName} — best {bestScore} / {student.attempts[0].maxScore} ({student.attempts.length}{" "}
                  of {MAX_ATTEMPTS} attempts used)
                </p>
                {student.attempts.map((attempt, attemptIdx) =>
                  isRankingWeek ? (
                    <div key={attemptIdx} className="mb-4">
                      <p className="text-xs text-neutral-600 mb-2">
                        Attempt {attemptIdx + 1}: {attempt.score} / {attempt.maxScore} — completed{" "}
                        {attempt.completedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {[STAGE_1_ITEMS, STAGE_2_ITEMS].map((items, stageIdx) => {
                        const rankAnswers = attempt.answers as { stage1Order: string[]; stage2Order: string[] };
                        const order = stageIdx === 0 ? rankAnswers.stage1Order : rankAnswers.stage2Order;
                        return (
                          <table key={stageIdx} className="w-full text-sm mb-3 border border-neutral-200 rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-neutral-50 text-left text-neutral-500 border-b border-neutral-200">
                                <th className="px-4 py-2 font-medium">Stage {stageIdx + 1} item</th>
                                <th className="px-4 py-2 font-medium">Correct rank</th>
                                <th className="px-4 py-2 font-medium">Their rank</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...items]
                                .sort((a, b) => a.correctRank - b.correctRank)
                                .map((item) => {
                                  const yourRank = order.indexOf(item.id) + 1;
                                  const correct = yourRank === item.correctRank;
                                  return (
                                    <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                                      <td className="px-4 py-2">
                                        {item.id} — {item.sourceType}
                                      </td>
                                      <td className="px-4 py-2">{item.correctRank}</td>
                                      <td className={`px-4 py-2 ${correct ? "text-green-700" : "text-red-700"}`}>{yourRank}</td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        );
                      })}
                    </div>
                  ) : (
                    (() => {
                      const generic = attempt.answers as { correct: number; total: number };
                      return (
                        <p key={attemptIdx} className="text-xs text-neutral-600 mb-2">
                          Attempt {attemptIdx + 1}: {attempt.score} / {attempt.maxScore} (raw {generic.correct} /{" "}
                          {generic.total}) — completed{" "}
                          {attempt.completedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      );
                    })()
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
