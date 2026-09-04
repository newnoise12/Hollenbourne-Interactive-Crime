import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getTeamDetail } from "@/lib/instructor-data";
import { getEvidenceItem } from "@/lib/evidence-catalog";
import { BASELINE_ACTIONS, MAX_WEEK } from "@/lib/actions-catalog";
import { STAGE_1_ITEMS, STAGE_2_ITEMS, MAX_ATTEMPTS } from "@/lib/quiz-catalog";

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

  const { team, citations, weekState, log, quizAttempts } = detail;
  const quizBestScore = quizAttempts.length > 0 ? Math.max(...quizAttempts.map((a) => a.score)) : null;
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

      <section>
        <h2 className="text-lg font-semibold mb-3">Week 2 trust activity</h2>
        {quizAttempts.length === 0 ? (
          <p className="text-sm text-neutral-500">Not attempted yet.</p>
        ) : (
          <div>
            <p className="text-sm mb-5">
              Best score: <span className="font-semibold">{quizBestScore} / {quizAttempts[0].maxScore}</span> (applied
              as the Week 2 trust bonus) — {quizAttempts.length} of {MAX_ATTEMPTS} attempts used
            </p>
            {quizAttempts.map((attempt, attemptIdx) => (
              <div key={attemptIdx} className="mb-6">
                <p className="text-sm font-medium mb-2">
                  Attempt {attemptIdx + 1}: {attempt.score} / {attempt.maxScore} — completed{" "}
                  {attempt.completedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {[STAGE_1_ITEMS, STAGE_2_ITEMS].map((items, stageIdx) => {
                  const order = stageIdx === 0 ? attempt.answers.stage1Order : attempt.answers.stage2Order;
                  return (
                    <table key={stageIdx} className="w-full text-sm mb-4 border border-neutral-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-neutral-50 text-left text-neutral-500 border-b border-neutral-200">
                          <th className="px-4 py-2 font-medium">Stage {stageIdx + 1} item</th>
                          <th className="px-4 py-2 font-medium">Correct rank</th>
                          <th className="px-4 py-2 font-medium">Team&apos;s rank</th>
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
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
