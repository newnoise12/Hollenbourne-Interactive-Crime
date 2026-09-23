"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InstructorLoginForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/instructor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push("/instructor");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full bg-[#E8E1D0] border border-[#D6CDB4] px-6 py-6 space-y-4">
      <div>
        <label htmlFor="passcode" className="block font-mono text-[11px] text-[#5B5A4E] mb-1">
          Passcode
        </label>
        <input
          id="passcode"
          type="password"
          required
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-2 text-[#2A2F27] outline-none"
        />
      </div>

      {error && (
        <p className="font-mono text-xs text-[#8B3226]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] py-2.5 border border-[#2A2F27] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "PLEASE WAIT…" : "ENTER"}
      </button>
    </form>
  );
}
