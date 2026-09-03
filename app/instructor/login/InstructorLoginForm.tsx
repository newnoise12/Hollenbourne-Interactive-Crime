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
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4">
      <div>
        <label htmlFor="passcode" className="block text-sm font-medium text-neutral-700 mb-1">
          Passcode
        </label>
        <input
          id="passcode"
          type="password"
          required
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-neutral-900 text-white py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Please wait…" : "Enter"}
      </button>
    </form>
  );
}
