import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { getAllTeamsSummary } from "@/lib/instructor-data";
import { getAllStudentsWithTeams } from "@/lib/students";
import LogoutButton from "./LogoutButton";
import StudentsPanel from "./StudentsPanel";

export default async function InstructorDashboardPage() {
  const sessionId = (await cookies()).get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (!(await isValidInstructorSession(sessionId))) {
    redirect("/instructor/login");
  }

  const [teams, students] = await Promise.all([getAllTeamsSummary(), getAllStudentsWithTeams()]);

  return (
    <main className="flex-1 px-4 py-10 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-neutral-500">Instructor view</p>
          <h1 className="text-2xl font-semibold">All teams</h1>
        </div>
        <LogoutButton />
      </div>

      {teams.length === 0 ? (
        <p className="text-sm text-neutral-500 border border-dashed border-neutral-300 rounded-lg p-8 text-center">
          No teams have registered yet.
        </p>
      ) : (
        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-neutral-500 border-b border-neutral-200">
                <th className="px-4 py-2.5 font-medium">Team</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
                <th className="px-4 py-2.5 font-medium">Exhibits cited</th>
                <th className="px-4 py-2.5 font-medium">Week 2 quiz</th>
                <th className="px-4 py-2.5 font-medium">Actions taken</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5 font-medium">{team.name}</td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {team.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-2.5">
                    {team.citedCount} / {team.citableCount}
                  </td>
                  <td className="px-4 py-2.5">
                    {team.quizAverage === null ? (
                      <span className="text-neutral-400">not attempted</span>
                    ) : (
                      <>
                        avg {team.quizAverage} / 3
                        <span className="text-neutral-400">
                          {" "}
                          ({team.quizStudentsAttempted} student{team.quizStudentsAttempted === 1 ? "" : "s"})
                        </span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-2.5">{team.totalActionsSpent}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/instructor/teams/${team.id}`} className="text-neutral-900 underline">
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
        <h2 className="text-xl font-semibold mb-1">Students</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Move a student to a different team. This only changes where they show up going forward — past quiz
          attempts stay attributed to whichever team they were on when they took them, so moving someone doesn&apos;t
          change any earlier week&apos;s trust bonus for either team.
        </p>
        <StudentsPanel students={students} teams={teams.map((t) => ({ id: t.id, name: t.name }))} />
      </div>
    </main>
  );
}
