import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { ACTIONS, EVIDENCE_GROUP_META, MAX_WEEK } from "@/lib/actions-catalog";
import { CASE_META } from "@/lib/evidence-catalog";
import { buildEvidenceMap } from "@/lib/action-graph-layout";
import GatingMap from "./GatingMap";

// Instructor-only. A picture of the prerequisite rules, drawn from the live
// catalog (lib/actions-catalog.ts) — it is not a separate copy, so it changes the
// moment a prerequisite, cost or week gate does. Staff-only because it shows the
// whole tree and the total cost of the endgame, which students are never shown.

export default async function InstructorEvidenceMapPage() {
  const sessionId = (await cookies()).get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (!(await isValidInstructorSession(sessionId))) {
    redirect("/instructor/login");
  }

  const map = buildEvidenceMap();
  const byId = new Map(ACTIONS.map((a) => [a.id, a]));
  const routeActions = map.endgame.actionIds
    .map((id) => byId.get(id)!)
    .sort((a, b) => map.nodes.find((n) => n.id === a.id)!.layer - map.nodes.find((n) => n.id === b.id)!.layer);
  const timeGated = ACTIONS.filter((a) => a.availableFromWeek);

  const caseLabels = Object.fromEntries(Object.entries(CASE_META).map(([k, v]) => [k, k === "general" ? "General / cross-case" : v.label]));
  const groupLabels = Object.fromEntries(Object.entries(EVIDENCE_GROUP_META).map(([k, v]) => [k, v.label]));

  return (
    <main className="flex-1 bg-[#23262B]/80 px-6 py-8">
      <div className="max-w-[1500px] mx-auto">
        <Link href="/instructor" className="font-mono text-[11px] text-[#8A8A80] underline">
          &larr; all teams
        </Link>
        <div className="mt-2 mb-6 pb-5 border-b-[3px] border-double border-[#A6764A]">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#A6764A] m-0">Instructor view</p>
          <h1 className="font-serif font-bold text-2xl text-[#E8E1D0] m-0 mt-0.5">Evidence gating map</h1>
          <p className="font-mono text-xs text-[#8A8A80] mb-0 mt-2 max-w-[78ch]">
            Every investigation action ({ACTIONS.length}), left to right by how many steps in a team has to be before it opens. Drawn live from
            the catalog, so it always shows the rules the game is actually enforcing. Not shown to students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] m-0">All actions, total cost</p>
            <p className="font-serif font-semibold text-xl text-[#2A2F27] m-0 mt-1">{map.totalCost} pts</p>
            <p className="font-mono text-[11px] text-[#5B5A4E] m-0 mt-1">
              {map.layers.map((l) => `${l.count} at step ${l.index} (${l.cost} pts)`).join(" · ")}
            </p>
          </div>
          <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] m-0">Cheapest route to the endgame</p>
            <p className="font-serif font-semibold text-xl text-[#2A2F27] m-0 mt-1">
              {map.endgame.total} pts <span className="font-mono text-[12px] font-normal text-[#5B5A4E]">across {routeActions.length} actions</span>
            </p>
            <p className="font-mono text-[11px] text-[#5B5A4E] m-0 mt-1">
              Computed from the catalog. A team also needs {map.layers.length - 1} steps of progress in sequence, and the week gates below.
            </p>
          </div>
          <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] m-0">Held back by week, not prerequisites</p>
            <p className="font-serif font-semibold text-xl text-[#2A2F27] m-0 mt-1">{timeGated.length} actions</p>
            <p className="font-mono text-[11px] text-[#5B5A4E] m-0 mt-1">
              {timeGated.map((a) => `${(a.shortLabel ?? a.label).replace(/^./, (c) => c.toUpperCase())} (Wk ${a.availableFromWeek}+)`).join(" · ")}. Module runs to Week {MAX_WEEK}.
            </p>
          </div>
        </div>

        <GatingMap map={map} caseLabels={caseLabels} groupLabels={groupLabels} />

        <section className="mt-8">
          <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-3 mt-0">The cheapest route to the endgame, in order</h2>
          <ol className="m-0 pl-5 font-mono text-xs text-[#E8E1D0] leading-relaxed">
            {routeActions.map((a) => (
              <li key={a.id}>
                {a.shortLabel ? a.shortLabel.replace(/^./, (c) => c.toUpperCase()) : a.label} &mdash; {a.cost} pt{a.cost === 1 ? "" : "s"}
                {a.availableFromWeek ? ` (not before Week ${a.availableFromWeek})` : ""}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
