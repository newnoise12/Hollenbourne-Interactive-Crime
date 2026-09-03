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
    <div className="w-full max-w-sm mx-auto">
      <div className="flex mb-6 border border-neutral-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mode === "login" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mode === "register" ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"
          }`}
        >
          Create team
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
            Team name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            placeholder="e.g. The Reasonable Doubters"
          />
        </div>

        <div>
          <label htmlFor="passcode" className="block text-sm font-medium text-neutral-700 mb-1">
            Passcode
          </label>
          <input
            id="passcode"
            type="password"
            required
            minLength={mode === "register" ? 6 : undefined}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            placeholder={mode === "register" ? "At least 6 characters" : ""}
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
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create team"}
        </button>
      </form>
    </div>
  );
}
