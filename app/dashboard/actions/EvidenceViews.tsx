"use client";

import { useState } from "react";
import { CATEGORY_META, EVIDENCE_GROUP_META, EVIDENCE_GROUP_ORDER, type CaseName } from "@/lib/actions-meta";
import { CASE_META } from "@/lib/evidence-meta";
import type { ClientEnquiry, ClientEvidence } from "@/lib/team-view";
import { OpensNextStrip } from "./OpensNext";

// Everything on this page comes from the per-team view the server prepared
// (lib/team-view.ts): enquiries the team can't see yet are simply absent, and a
// waiting enquiry carries only its title and what it waits on. This component
// deliberately imports nothing from the case catalogs.

type ViewMode = "case" | "type";

// Spec order for the "By case" view: the four victims, then everything that
// belongs to none of them.
const CASE_VIEW_ORDER: CaseName[] = ["mason", "wooley", "porterhouse", "butt", "general"];
const CASE_VIEW_LABEL: Record<CaseName, string> = {
  mason: CASE_META.mason.label,
  wooley: CASE_META.wooley.label,
  porterhouse: CASE_META.porterhouse.label,
  butt: CASE_META.butt.label,
  general: "General / cross-case",
};

function OnFileTile({ item, onOpen }: { item: ClientEvidence; onOpen: () => void }) {
  if (!item.unlocked) {
    return (
      <div className="bg-[#3A3D3E] border border-dashed border-[#A6764A55] px-4 py-3 opacity-75">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="font-mono text-[11px] text-[#A6764A] tracking-wide">{item.exhibit}</span>
          <span className="font-mono text-[10px] text-[#8A8A80] border border-[#55554E] px-1.5 py-0.5">LOCKED</span>
        </div>
        <p className="font-mono text-[13px] text-[#6E6D64] tracking-[1.5px] mb-1 mt-0">{item.title}</p>
        <p className="font-mono text-[11px] text-[#8A8A80] m-0">
          {item.unlocksWeek ? `Unlocks in week ${item.unlocksWeek}` : "Locked"}
        </p>
      </div>
    );
  }
  return (
    <button
      onClick={onOpen}
      className="text-left w-full bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 border-l-[#8A8A80] px-4 py-3 cursor-pointer hover:border-[#A6764A] transition-colors"
    >
      <div className="flex justify-between items-baseline mb-1 gap-2">
        <span className="font-mono text-[11px] text-[#5B5A4E] tracking-wide">{item.exhibit}</span>
        <span className="font-mono text-[10px] text-[#5B5A4E] border border-[#D6CDB4] px-1.5 py-0.5">ON FILE</span>
      </div>
      <h4 className="font-serif font-semibold text-[14px] leading-snug text-[#2A2F27] mb-1 mt-0">{item.title}</h4>
      <span className="font-mono text-[10px] text-[#A6764A]">Read in the Case Log &rarr;</span>
    </button>
  );
}

function EnquiryCard({
  enquiry,
  doneWeek,
  week,
  canAfford,
  canAffordFromReserve,
  justTaken,
  onTake,
  onOpenExhibit,
}: {
  enquiry: ClientEnquiry;
  doneWeek: number | null;
  week: number;
  canAfford: boolean;
  canAffordFromReserve: boolean;
  justTaken: boolean;
  onTake: (enquiry: ClientEnquiry, useReserve: boolean) => void;
  onOpenExhibit: (exhibitId: string) => void;
}) {
  const { state } = enquiry;
  const meta = CATEGORY_META[enquiry.category];
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const resultOpen = manualOpen ?? justTaken;
  // A time-gated enquiry can be "available" (every prerequisite met) yet not takeable yet.
  const weekLocked = enquiry.availableFromWeek && week < enquiry.availableFromWeek ? enquiry.availableFromWeek : null;
  const takeable = state === "available" && weekLocked === null;
  const muted = state === "waiting" || (state === "available" && !takeable);
  const alsoRelates = (enquiry.alsoRelatesTo ?? []).filter((c) => c !== enquiry.case);

  return (
    <div
      className="bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 px-4 py-3.5 mb-3"
      style={{ borderLeftColor: muted ? "#8A8A80" : meta.color, opacity: muted ? 0.65 : 1 }}
    >
      <div className="flex justify-between items-baseline mb-1.5 flex-wrap gap-2">
        <span className="font-mono text-[11px]" style={{ color: muted ? "#5B5A4E" : meta.color }}>
          {meta.label}
        </span>
        <div className="flex gap-2 flex-wrap justify-end">
          {state === "done" && (
            <span className="font-mono text-[11px] text-[#2F6B4F] border border-[#2F6B4F] px-2 py-0.5">
              ✓ DONE{doneWeek ? ` · WEEK ${doneWeek}` : ""}
            </span>
          )}
          {state === "waiting" && (
            <span className="font-mono text-[11px] text-[#5B5A4E] border border-[#8A8A80] px-2 py-0.5">WAITING</span>
          )}
          {state === "available" && weekLocked && (
            <span className="font-mono text-[11px] text-[#5B5A4E] border border-[#8A8A80] px-2 py-0.5">
              AVAILABLE FROM WEEK {weekLocked}
            </span>
          )}
          {state !== "done" && (
            <span className="font-mono text-[11px] text-[#5B5A4E] border border-[#D6CDB4] px-2 py-0.5">cost: {enquiry.cost}</span>
          )}
        </div>
      </div>

      <h4 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-1 mt-0">{enquiry.label}</h4>
      {alsoRelates.length > 0 && (
        <p className="font-mono text-[10px] text-[#5B5A4E] mb-1.5 mt-0">
          also relates to: {alsoRelates.map((c) => CASE_META[c].label).join(", ")}
        </p>
      )}

      {/* A locked enquiry shows its title and what it is waiting on — never what it would reveal. */}
      {takeable && enquiry.description && (
        <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-2.5 mt-0">{enquiry.description}</p>
      )}

      {state === "waiting" && (
        <div className="mb-1 mt-2">
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#8B3226] mb-1 mt-0">Waiting on</p>
          <ul className="m-0 pl-4 list-disc">
            {enquiry.waitingOn.map((w, i) => (
              <li key={i} className="font-mono text-xs text-[#2A2F27] leading-relaxed">
                {w.title} &mdash; <span className={w.met ? "text-[#2F6B4F]" : "text-[#8B3226]"}>{w.met ? "✓ done" : "○ outstanding"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state === "available" && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onTake(enquiry, false)}
            disabled={!takeable || !canAfford}
            className="font-mono text-xs tracking-wide bg-transparent px-3.5 py-1.5 border"
            style={{
              borderColor: !takeable || !canAfford ? "#D6CDB4" : "#2A2F27",
              color: !takeable || !canAfford ? "#8A8A80" : "#2A2F27",
              cursor: !takeable || !canAfford ? "not-allowed" : "pointer",
            }}
          >
            {!takeable ? "NOT YET AVAILABLE" : canAfford ? "TAKE ACTION" : "NOT ENOUGH ACTIONS"}
          </button>
          {takeable && !canAfford && canAffordFromReserve && (
            <button
              onClick={() => onTake(enquiry, true)}
              className="font-mono text-xs tracking-wide bg-transparent px-3.5 py-1.5 border border-[#93650F] text-[#93650F] cursor-pointer"
              title="Uses your team's shared, permanent case reserve instead of this week's budget"
            >
              PAY WITH RESERVE
            </button>
          )}
        </div>
      )}

      {state === "done" && (
        <>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setManualOpen(!resultOpen)}
              aria-expanded={resultOpen}
              className="font-mono text-[11px] tracking-wide bg-transparent border border-[#2A2F27] text-[#2A2F27] px-3 py-1.5 cursor-pointer"
            >
              {resultOpen ? "HIDE RESULT ▲" : "VIEW RESULT ▾"}
            </button>
            <button
              onClick={() => onOpenExhibit(`ev-${enquiry.id}`)}
              className="font-mono text-[11px] tracking-wide bg-transparent border border-[#A6764A] text-[#A6764A] px-3 py-1.5 cursor-pointer"
            >
              READ IN CASE LOG &rarr;
            </button>
          </div>
          {resultOpen && (
            <p className="font-mono text-[13px] text-[#2A2F27] leading-relaxed mt-3 mb-0 bg-[#FBF8F0] border border-[#D6CDB4] px-3.5 py-3">
              {enquiry.outcome}
            </p>
          )}
          <OpensNextStrip entries={enquiry.opensNext} week={week} />
        </>
      )}
    </div>
  );
}

export default function EvidenceViews({
  enquiries,
  evidence,
  completedWeeks,
  week,
  remaining,
  reservePoints,
  pending,
  justTakenId,
  onTake,
  onOpenExhibit,
}: {
  enquiries: ClientEnquiry[];
  evidence: ClientEvidence[];
  completedWeeks: ReadonlyMap<string, number>;
  /** The week being acted in (the browsable week selector) — what week gates are checked against. */
  week: number;
  remaining: number;
  reservePoints: number;
  pending: boolean;
  justTakenId: string | null;
  onTake: (enquiry: ClientEnquiry, useReserve: boolean) => void;
  onOpenExhibit: (exhibitId: string) => void;
}) {
  // Not remembered between visits: the app has no per-user preference store,
  // and this isn't worth adding one for.
  const [mode, setMode] = useState<ViewMode>("case");

  // "On file": the free baseline documents. The documents an enquiry produces
  // are reached through the enquiry itself (and the Case Log), not listed twice.
  const onFile = evidence.filter((e) => !e.unlockedByActionId);

  const groups =
    mode === "case"
      ? CASE_VIEW_ORDER.map((c) => ({
          key: c as string,
          label: CASE_VIEW_LABEL[c],
          onFile: onFile.filter((e) => e.case === c),
          enquiries: enquiries.filter((a) => a.case === c),
        }))
      : EVIDENCE_GROUP_ORDER.map((g) => ({
          key: g as string,
          label: EVIDENCE_GROUP_META[g].label,
          onFile: onFile.filter((e) => e.group === g),
          enquiries: enquiries.filter((a) => a.group === g),
        }));

  const rendered = groups.filter((g) => g.onFile.length > 0 || g.enquiries.length > 0);

  const toggleClass = (active: boolean) =>
    `font-mono text-xs tracking-wide px-3.5 py-2 border cursor-pointer ${
      active ? "bg-[#E8E1D0] text-[#2A2F27] border-[#E8E1D0]" : "bg-transparent text-[#C9C4B3] border-[#A6764A]"
    }`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap" role="group" aria-label="Organise the evidence page">
        <button onClick={() => setMode("case")} aria-pressed={mode === "case"} className={toggleClass(mode === "case")}>
          By case
        </button>
        <button onClick={() => setMode("type")} aria-pressed={mode === "type"} className={toggleClass(mode === "type")}>
          By evidence type
        </button>
      </div>

      {rendered.map((group) => (
        <section key={group.key} className="mb-8" aria-label={group.label}>
          <h3 className="font-serif font-semibold text-base text-[#E8E1D0] mb-3 mt-0 pb-1.5 border-b border-[#A6764A55]">
            {group.label}
          </h3>

          {group.onFile.length > 0 && (
            <div className="mb-4">
              <h4 className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#A6764A] mb-2 mt-0">On file</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.onFile.map((item) => (
                  <OnFileTile key={item.id} item={item} onOpen={() => onOpenExhibit(item.id)} />
                ))}
              </div>
            </div>
          )}

          {group.enquiries.length > 0 && (
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#A6764A] mb-2 mt-0">Enquiries</h4>
              {group.enquiries.map((enquiry) => (
                <EnquiryCard
                  key={enquiry.id}
                  enquiry={enquiry}
                  doneWeek={completedWeeks.get(enquiry.id) ?? null}
                  week={week}
                  canAfford={remaining >= enquiry.cost && !pending}
                  canAffordFromReserve={reservePoints >= enquiry.cost && !pending}
                  justTaken={justTakenId === enquiry.id}
                  onTake={onTake}
                  onOpenExhibit={onOpenExhibit}
                />
              ))}
            </div>
          )}
        </section>
      ))}
      <p className="font-mono text-[11px] text-[#8A8A80] mt-0">
        Finished an enquiry? Its full document is filed in the Case Log, ready to read and pin to the corkboard.
      </p>
    </div>
  );
}
