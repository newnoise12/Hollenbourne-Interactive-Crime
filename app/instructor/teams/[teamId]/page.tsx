import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getTeamDetail } from "@/lib/instructor-data";
import { MAX_WEEK } from "@/lib/actions-catalog";
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

  const { team, currentWeek, unlockedEvidence, weekState, log, quizWeeks, baselineActions } = detail;
  const weeksWithActivity = Object.keys(weekState)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <main className="flex-1 bg-[#23262B] px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/instructor" className="font-mono text-[11px] text-[#8A8A80] underline">
          &larr; all teams
        </Link>
        <div className="mt-2 mb-6 pb-5 border-b-[3px] border-double border-[#A6764A]">
          <h1 className="font-serif font-bold text-2xl text-[#E8E1D0] m-0">{team.name}</h1>
          <p className="font-mono text-xs text-[#8A8A80] mb-0.5 mt-1.5">
            Registered {team.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p className="font-mono text-xs text-[#8A8A80] m-0">
            Case reserve: <span className="text-[#E8E1D0]">{team.reservePoints} pt{team.reservePoints === 1 ? "" : "s"}</span>
            {" "}&middot; Module currently at Week {currentWeek}
          </p>
        </div>

        <section className="mb-10">
          <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-3 mt-0">
            Evidence unlocked ({unlockedEvidence.length})
          </h2>
          {unlockedEvidence.length === 0 ? (
            <p className="font-mono text-xs text-[#8A8A80]">Nothing unlocked yet.</p>
          ) : (
            <div className="space-y-3">
              {unlockedEvidence.map((item) => (
                <div key={item.id} className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3.5">
                  <p className="font-mono text-[11px] text-[#5B5A4E] mb-1 mt-0">{item.exhibit}</p>
                  <p className="font-mono text-[13px] text-[#2A2F27] m-0">{item.title}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-3 mt-0">Investigation actions</h2>
          {weeksWithActivity.length === 0 ? (
            <p className="font-mono text-xs text-[#8A8A80] mb-4">No actions taken in any week (max week {MAX_WEEK}).</p>
          ) : (
            <div className="overflow-x-auto bg-[#E8E1D0] border border-[#A6764A] mb-4">
              <table className="w-full font-mono text-[13px]">
                <thead>
                  <tr className="text-left text-[#5B5A4E] border-b border-[#D6CDB4]">
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
                      <tr key={week} className="border-b border-[#D6CDB4] last:border-0 text-[#2A2F27]">
                        <td className="px-4 py-2">Week {week}</td>
                        <td className="px-4 py-2">+{state.trustBonus}</td>
                        <td className="px-4 py-2">{state.actionsSpent}</td>
                        <td className="px-4 py-2">{baselineActions + state.trustBonus}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="font-mono text-xs text-[#8A8A80] uppercase tracking-wide mb-2 mt-4">Permanent action log</h3>
          {log.length === 0 ? (
            <p className="font-mono text-xs text-[#8A8A80]">No actions taken yet.</p>
          ) : (
            <div className="space-y-2">
              {log.map((entry, i) => (
                <div key={i} className="border-l-2 border-[#A6764A] pl-3">
                  <p className="font-mono text-[11px] text-[#A6764A] mb-0.5 mt-0">
                    Week {entry.week} &middot; {entry.label}
                  </p>
                  <p className="font-mono text-[13px] text-[#C9C4B3] m-0">{entry.outcome}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {quizWeeks.map((qw) => (
          <QuizWeekSection key={qw.week} quizWeek={qw} />
        ))}
      </div>
    </main>
  );
}

function QuizWeekSection({ quizWeek }: { quizWeek: TeamQuizWeekDetail }) {
  const { week, average, breakdown } = quizWeek;
  const isRankingWeek = week === QUIZ_WEEK;
  const quizTitle = isRankingWeek ? "Week 2 ranking activity" : `Week ${week} quiz`;

  return (
    <section className="mb-10">
      <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-3 mt-0">{quizTitle}</h2>
      {breakdown.length === 0 ? (
        <p className="font-mono text-xs text-[#8A8A80]">No students have attempted this yet.</p>
      ) : (
        <div>
          <p className="font-mono text-[13px] text-[#E8E1D0] mb-2 mt-0">
            Team average: <span className="font-semibold">{average} / 3</span> (applied as the Week {week} trust
            bonus) &mdash; {breakdown.length} student{breakdown.length === 1 ? "" : "s"} contributing
          </p>
          <p className="font-mono text-[11px] text-[#8A8A80] mb-5 mt-0">
            This reflects who was on the team when they took it, not who&apos;s on it now &mdash; a student moved to
            another team afterwards still counts here, and this average never changes as a result of a later move.
          </p>
          {breakdown.map((student) => {
            const bestScore = Math.max(...student.attempts.map((a) => a.score));
            return (
              <div key={student.studentId} className="mb-8 border-t border-[#A6764A55] pt-4 first:border-0 first:pt-0">
                <p className="font-mono text-[13px] text-[#E8E1D0] mb-3 mt-0">
                  {student.studentName} &mdash; best {bestScore} / {student.attempts[0].maxScore} (
                  {student.attempts.length} of {MAX_ATTEMPTS} attempts used)
                </p>
                {student.attempts.map((attempt, attemptIdx) =>
                  isRankingWeek ? (
                    <div key={attemptIdx} className="mb-4">
                      <p className="font-mono text-[11px] text-[#8A8A80] mb-2 mt-0">
                        Attempt {attemptIdx + 1}: {attempt.score} / {attempt.maxScore} &mdash; completed{" "}
                        {attempt.completedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {[STAGE_1_ITEMS, STAGE_2_ITEMS].map((items, stageIdx) => {
                        const rankAnswers = attempt.answers as { stage1Order: string[]; stage2Order: string[] };
                        const order = stageIdx === 0 ? rankAnswers.stage1Order : rankAnswers.stage2Order;
                        return (
                          <table key={stageIdx} className="w-full font-mono text-[13px] mb-3 bg-[#E8E1D0] border border-[#D6CDB4]">
                            <thead>
                              <tr className="text-left text-[#5B5A4E] border-b border-[#D6CDB4]">
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
                                    <tr key={item.id} className="border-b border-[#D6CDB4] last:border-0 text-[#2A2F27]">
                                      <td className="px-4 py-2">
                                        {item.id} &mdash; {item.sourceType}
                                      </td>
                                      <td className="px-4 py-2">{item.correctRank}</td>
                                      <td className="px-4 py-2" style={{ color: correct ? "#2F6B4F" : "#8B3226" }}>{yourRank}</td>
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
                        <p key={attemptIdx} className="font-mono text-[11px] text-[#8A8A80] mb-2 mt-0">
                          Attempt {attemptIdx + 1}: {attempt.score} / {attempt.maxScore} (raw {generic.correct} /{" "}
                          {generic.total}) &mdash; completed{" "}
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
