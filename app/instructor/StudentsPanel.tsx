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
    <tr className="border-b border-[#D6CDB4] last:border-0 text-[#2A2F27]">
      <td className="px-4 py-2.5 font-semibold">{student.name}</td>
      <td className="px-4 py-2.5 text-[#5B5A4E]">{student.teamName}</td>
      <td className="px-4 py-2.5">
        {otherTeams.length === 0 ? (
          <span className="text-[#8A8A80]">no other teams</span>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={targetTeamId}
              onChange={(e) => setTargetTeamId(e.target.value)}
              className="font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2 py-1 text-[#2A2F27]"
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
              className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-3 py-1 border border-[#2A2F27] disabled:opacity-50"
            >
              {moving ? "MOVING…" : "MOVE"}
            </button>
          </div>
        )}
        {error && <p className="font-mono text-[11px] text-[#8B3226] mt-1">{error}</p>}
      </td>
    </tr>
  );
}

export default function StudentsPanel({ students, teams }: { students: StudentWithTeam[]; teams: TeamOption[] }) {
  if (students.length === 0) {
    return (
      <p className="font-mono text-xs text-[#8A8A80] bg-[#E8E1D0] border border-dashed border-[#A6764A] px-8 py-8 text-center">
        No students have identified themselves yet &mdash; that happens the first time someone on a team answers a
        quiz.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#E8E1D0] border border-[#A6764A]">
      <table className="w-full font-mono text-[13px]">
        <thead>
          <tr className="text-left text-[#5B5A4E] border-b border-[#D6CDB4]">
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
