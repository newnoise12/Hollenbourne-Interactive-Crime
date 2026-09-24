"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { MAX_WEEK } from "@/lib/actions-catalog";

export default function CurrentWeekControl({ initialWeek }: { initialWeek: number }) {
  const router = useRouter();
  const [week, setWeek] = useState(initialWeek);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = async (delta: number) => {
    const next = Math.min(MAX_WEEK, Math.max(1, week + delta));
    if (next === week) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/instructor/set-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      setWeek(data.currentWeek);
      router.refresh();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  };

  const iconBtnClass = (disabled: boolean) =>
    `bg-transparent border p-1 flex items-center justify-center ${
      disabled ? "border-[#D6CDB4] text-[#D6CDB4] cursor-not-allowed" : "border-[#2A2F27] text-[#2A2F27] cursor-pointer"
    }`;

  return (
    <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4 mb-8 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="font-mono text-[11px] text-[#5B5A4E] m-0">Current module week (all teams)</p>
        <p className="font-mono text-[11px] text-[#8A8A80] mt-1 mb-0 max-w-[52ch]">
          Controls what every team&apos;s Case Log and Investigation tab can see &mdash; bump this forward as the
          term progresses, or back for an extension. Never advances on its own.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <button onClick={() => change(-1)} disabled={busy || week <= 1} aria-label="Previous week" className={iconBtnClass(busy || week <= 1)}>
          <MinusIcon size={14} />
        </button>
        <span className="font-serif font-semibold text-lg text-[#2A2F27] min-w-[80px] text-center">Week {week}</span>
        <button onClick={() => change(1)} disabled={busy || week >= MAX_WEEK} aria-label="Next week" className={iconBtnClass(busy || week >= MAX_WEEK)}>
          <PlusIcon size={14} />
        </button>
      </div>
      {error && <p className="font-mono text-[11px] text-[#8B3226] w-full m-0">{error}</p>}
    </div>
  );
}
