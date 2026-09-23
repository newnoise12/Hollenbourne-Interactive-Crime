"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, passcode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full bg-[#E8E1D0] border border-[#D6CDB4] px-6 py-6">
      <div className="flex mb-5 border border-[#A6764A]">
        <button
          type="button"
          onClick={() => setMode("login")}
          className="flex-1 py-2 font-mono text-xs tracking-wide"
          style={{
            background: mode === "login" ? "#2A2F27" : "transparent",
            color: mode === "login" ? "#E8E1D0" : "#5B5A4E",
          }}
        >
          LOG IN
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className="flex-1 py-2 font-mono text-xs tracking-wide"
          style={{
            background: mode === "register" ? "#2A2F27" : "transparent",
            color: mode === "register" ? "#E8E1D0" : "#5B5A4E",
          }}
        >
          CREATE TEAM
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-mono text-[11px] text-[#5B5A4E] mb-1">
            Team name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-2 text-[#2A2F27] outline-none placeholder:text-[#A8A08A]"
            placeholder="e.g. The Reasonable Doubters"
          />
        </div>

        <div>
          <label htmlFor="passcode" className="block font-mono text-[11px] text-[#5B5A4E] mb-1">
            Passcode
          </label>
          <input
            id="passcode"
            type="password"
            required
            minLength={mode === "register" ? 6 : undefined}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-2 text-[#2A2F27] outline-none placeholder:text-[#A8A08A]"
            placeholder={mode === "register" ? "At least 6 characters" : ""}
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
          {submitting ? "PLEASE WAIT…" : mode === "login" ? "LOG IN" : "CREATE TEAM"}
        </button>
      </form>
    </div>
  );
}
