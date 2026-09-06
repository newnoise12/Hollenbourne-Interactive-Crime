"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentWithTeam } from "@/lib/students";

type TeamOption = { id: string; name: string };

function StudentRow({ student, teams }: { student: StudentWithTeam; teams: TeamOption[] }) {
  const router = useRouter();
  const otherTeams = teams.filter((t) => t.id !== student.teamId);
  const [targetTeamId, setTargetTeamId] = useState(otherTeams[0]?.id ?? "");
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const move = async () => {
    if (!targetTeamId) return;
    setError(null);
    setMoving(true);
    try {
      const res = await fetch("/api/instructor/reassign-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, newTeamId: targetTeamId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setMoving(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server.");
      setMoving(false);
    }
  };

  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="px-4 py-2.5 font-medium">{student.name}</td>
      <td className="px-4 py-2.5 text-neutral-500">{student.teamName}</td>
      <td className="px-4 py-2.5">
        {otherTeams.length === 0 ? (
          <span className="text-neutral-400">no other teams</span>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={targetTeamId}
              onChange={(e) => setTargetTeamId(e.target.value)}
              className="rounded border border-neutral-300 px-2 py-1 text-sm"
            >
              {otherTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={move}
              disabled={moving}
              className="rounded bg-neutral-900 text-white px-3 py-1 text-sm disabled:opacity-50"
            >
              {moving ? "Moving…" : "Move"}
            </button>
          </div>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </td>
    </tr>
  );
}

export default function StudentsPanel({ students, teams }: { students: StudentWithTeam[]; teams: TeamOption[] }) {
  if (students.length === 0) {
    return (
      <p className="text-sm text-neutral-500 border border-dashed border-neutral-300 rounded-lg p-8 text-center">
        No students have identified themselves yet — that happens the first time someone on a team answers the Week
        2 quiz.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-neutral-200 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 text-left text-neutral-500 border-b border-neutral-200">
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Current team</th>
            <th className="px-4 py-2.5 font-medium">Move to</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <StudentRow key={s.id} student={s} teams={teams} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
