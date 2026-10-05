import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getAllTeamsSummary } from "@/lib/instructor-data";
import { getAllStudentsWithTeams } from "@/lib/students";
import { getCurrentWeek } from "@/lib/module-settings";
import LogoutButton from "./LogoutButton";
import StudentsPanel from "./StudentsPanel";
import CurrentWeekControl from "./CurrentWeekControl";

export default async function InstructorDashboardPage() {
  const sessionId = (await cookies()).get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (!(await isValidInstructorSession(sessionId))) {
    redirect("/instructor/login");
  }

  const [teams, students, currentWeek] = await Promise.all([
    getAllTeamsSummary(),
    getAllStudentsWithTeams(),
    getCurrentWeek(),
  ]);

  return (
    <main className="flex-1 bg-[#23262B]/80 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6 pb-5 border-b-[3px] border-double border-[#A6764A]">
          <div>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#A6764A] m-0">Instructor view</p>
            <h1 className="font-serif font-bold text-2xl text-[#E8E1D0] m-0 mt-0.5">All teams</h1>
          </div>
          <LogoutButton />
        </div>

        <CurrentWeekControl initialWeek={currentWeek} />

        <p className="font-mono text-xs text-[#8A8A80] mb-5 mt-0">
          <Link href="/instructor/evidence" className="text-[#A6764A] underline">
            Preview all evidence
          </Link>{" "}
          &mdash; every exhibit fully unlocked, read-only, for proofreading the case file.
        </p>

        {teams.length === 0 ? (
          <p className="font-mono text-xs text-[#8A8A80] bg-[#E8E1D0] border border-dashed border-[#A6764A] px-8 py-8 text-center">
            No teams have registered yet.
          </p>
        ) : (
          <div className="overflow-x-auto bg-[#E8E1D0] border border-[#A6764A]">
            <table className="w-full font-mono text-[13px]">
              <thead>
                <tr className="text-left text-[#5B5A4E] border-b border-[#D6CDB4]">
                  <th className="px-4 py-2.5 font-medium">Team</th>
                  <th className="px-4 py-2.5 font-medium">Created</th>
                  <th className="px-4 py-2.5 font-medium">Evidence unlocked</th>
                  <th className="px-4 py-2.5 font-medium">Week 2 quiz</th>
                  <th className="px-4 py-2.5 font-medium">Actions taken</th>
                  <th className="px-4 py-2.5 font-medium">Reserve</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="border-b border-[#D6CDB4] last:border-0 text-[#2A2F27]">
                    <td className="px-4 py-2.5 font-semibold">{team.name}</td>
                    <td className="px-4 py-2.5 text-[#5B5A4E]">
                      {team.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-2.5">
                      {team.unlockedCount} / {team.totalEvidenceCount}
                    </td>
                    <td className="px-4 py-2.5">
                      {team.quizAverage === null ? (
                        <span className="text-[#8A8A80]">not attempted</span>
                      ) : (
                        <>
                          avg {team.quizAverage} / 3
                          <span className="text-[#8A8A80]">
                            {" "}
                            ({team.quizStudentsAttempted} student{team.quizStudentsAttempted === 1 ? "" : "s"})
                          </span>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{team.totalActionsSpent}</td>
                    <td className="px-4 py-2.5">{team.reservePoints}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/instructor/teams/${team.id}`} className="text-[#A6764A] underline">
                        view details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-10">
          <h2 className="font-serif font-semibold text-xl text-[#E8E1D0] mb-1 mt-0">Students</h2>
          <p className="font-mono text-xs text-[#8A8A80] mb-4 mt-0">
            Move a student to a different team. This only changes where they show up going forward &mdash; past quiz
            attempts stay attributed to whichever team they were on when they took them, so moving someone
            doesn&apos;t change any earlier week&apos;s trust bonus for either team.
          </p>
          <StudentsPanel students={students} teams={teams.map((t) => ({ id: t.id, name: t.name }))} />
        </div>
      </div>
    </main>
  );
}
