import type { OpensNextView } from "@/lib/team-view";

const points = (n: number) => `${n} pt${n === 1 ? "" : "s"}`;

/**
 * "Opens next" — what a completed action has just made available, and what is
 * still waiting on something else. Immediate dependents only, title and cost
 * only (never a total for a chain). Renders nothing when nothing depends on the
 * action, rather than a placeholder. The entries are worked out on the server
 * (lib/team-view.ts) so this component never needs the action catalog.
 */
export function OpensNextStrip({ entries, week }: { entries: OpensNextView[] | undefined; week: number }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="mt-3 pt-2.5 border-t border-dotted border-[#A6764A]">
      <p className="font-mono text-[11px] uppercase tracking-wide text-[#A6764A] mb-1.5 mt-0">Opens next</p>
      <ul className="m-0 pl-4 list-disc">
        {entries.map((entry) => (
          <li key={entry.id} className="font-mono text-xs text-[#2A2F27] leading-relaxed mb-1 last:mb-0">
            {entry.kind === "available" ? (
              <>
                Now available: <strong className="font-semibold">{entry.label}</strong> ({points(entry.cost)})
                {entry.weekGate && week < entry.weekGate ? ` — from Week ${entry.weekGate}` : ""}
              </>
            ) : (
              <>
                <strong className="font-semibold">{entry.label}</strong> ({points(entry.cost)}): still needs{" "}
                {entry.stillNeeds.map((title, i) => (
                  <span key={i}>
                    {i > 0 ? " and " : ""}
                    {title}
                  </span>
                ))}
                .
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
