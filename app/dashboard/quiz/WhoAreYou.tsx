"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Student } from "@/lib/students";

export default function WhoAreYou({ students }: { students: Student[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identify = async (body: { studentId: string } | { name: string }) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/students/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[480px]">
        <h3 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-1.5 mt-0">Who&apos;s answering?</h3>
        <p className="font-mono text-xs text-[#8A8A80] mb-6 mt-0 border-b border-[#A6764A55] pb-4">
          Quizzes are scored per student &mdash; your team&apos;s trust bonus is the average of everyone&apos;s
          best score. Pick your name, or add it if this is your first time.
        </p>

        {students.length > 0 && (
          <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-5 py-4 mb-4">
            <label className="font-mono text-[11px] text-[#5B5A4E] block mb-2">I&apos;ve answered before</label>
            <div className="flex gap-2">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-2 text-[#2A2F27] outline-none"
              >
                <option value="">&mdash; select your name &mdash;</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => selectedId && identify({ studentId: selectedId })}
                disabled={!selectedId || submitting}
                className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-4 py-2 border border-[#2A2F27] disabled:opacity-50"
              >
                GO
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-5 py-4 mb-4">
          <label className="font-mono text-[11px] text-[#5B5A4E] block mb-2">
            {students.length > 0 ? "New here?" : "First time answering for this team"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Your name"
              className="flex-1 font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-2 text-[#2A2F27] outline-none placeholder:text-[#A8A08A]"
            />
            <button
              onClick={() => newName.trim() && identify({ name: newName })}
              disabled={!newName.trim() || submitting}
              className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-4 py-2 border border-[#2A2F27] disabled:opacity-50"
            >
              GO
            </button>
          </div>
        </div>

        {error && <p className="font-mono text-xs text-[#8B3226] mt-2">{error}</p>}
    </div>
  );
}
