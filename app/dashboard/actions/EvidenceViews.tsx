"use client";

import { useState } from "react";
import {
  CATEGORY_META,
  EVIDENCE_GROUP_META,
  EVIDENCE_GROUP_ORDER,
  type ActionItem,
  type CaseName,
} from "@/lib/actions-catalog";
import { CASE_META, isEvidenceUnlocked, type EvidenceItem } from "@/lib/evidence-catalog";
import { getEnquiryView, isTakeable, type EnquiryView } from "@/lib/action-graph";
import { OpensNextStrip } from "./OpensNext";

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

function OnFileTile({ item, unlocked, week, onOpen }: { item: EvidenceItem; unlocked: boolean; week: number; onOpen: () => void }) {
  if (!unlocked) {
    return (
      <div className="bg-[#3A3D3E] border border-dashed border-[#A6764A55] px-4 py-3 opacity-75">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="font-mono text-[11px] text-[#A6764A] tracking-wide">{item.exhibit}</span>
          <span className="font-mono text-[10px] text-[#8A8A80] border border-[#55554E] px-1.5 py-0.5">LOCKED</span>
        </div>
        <p className="font-mono text-[13px] text-[#6E6D64] tracking-[1.5px] mb-1 mt-0">{item.title.replace(/[A-Za-z0-9]/g, "█")}</p>
        <p className="font-mono text-[11px] text-[#8A8A80] m-0">
          {item.unlocksWeek && week < item.unlocksWeek ? `Unlocks in week ${item.unlocksWeek}` : "Locked"}
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
  view,
  completedActionIds,
  doneWeek,
  week,
  canAfford,
  canAffordFromReserve,
  justTaken,
  onTake,
  onOpenExhibit,
}: {
  view: EnquiryView;
  completedActionIds: ReadonlySet<string>;
  doneWeek: number | null;
  week: number;
  canAfford: boolean;
  canAffordFromReserve: boolean;
  justTaken: boolean;
  onTake: (action: ActionItem, useReserve: boolean) => void;
  onOpenExhibit: (exhibitId: string) => void;
}) {
  const { action, state } = view;
  const meta = CATEGORY_META[action.category];
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const resultOpen = manualOpen ?? justTaken;
  const takeable = isTakeable(view);
  const muted = state === "waiting" || (state === "available" && !takeable);
  const alsoRelates = (action.alsoRelatesTo ?? []).filter((c) => c !== action.case);

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
          {state === "available" && view.weekLocked && (
            <span className="font-mono text-[11px] text-[#5B5A4E] border border-[#8A8A80] px-2 py-0.5">
              AVAILABLE FROM WEEK {view.weekLocked}
            </span>
          )}
          {state !== "done" && (
            <span className="font-mono text-[11px] text-[#5B5A4E] border border-[#D6CDB4] px-2 py-0.5">cost: {action.cost}</span>
          )}
        </div>
      </div>

      <h4 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-1 mt-0">{action.label}</h4>
      {alsoRelates.length > 0 && (
        <p className="font-mono text-[10px] text-[#5B5A4E] mb-1.5 mt-0">
          also relates to: {alsoRelates.map((c) => CASE_META[c].label).join(", ")}
        </p>
      )}

      {/* A locked enquiry shows its title and what it is waiting on — never what it would reveal. */}
      {state === "available" && takeable && (
        <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-2.5 mt-0">{action.description}</p>
      )}

      {state === "waiting" && (
        <div className="mb-1 mt-2">
          <p className="font-mono text-[11px] uppercase tracking-wide text-[#8B3226] mb-1 mt-0">Waiting on</p>
          <ul className="m-0 pl-4 list-disc">
            {view.waitingOn.map((w) => (
              <li key={w.id} className="font-mono text-xs text-[#2A2F27] leading-relaxed">
                {w.title} &mdash; <span className={w.met ? "text-[#2F6B4F]" : "text-[#8B3226]"}>{w.met ? "✓ done" : "○ outstanding"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state === "available" && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onTake(action, false)}
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
              onClick={() => onTake(action, true)}
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
              onClick={() => onOpenExhibit(`ev-${action.id}`)}
              className="font-mono text-[11px] tracking-wide bg-transparent border border-[#A6764A] text-[#A6764A] px-3 py-1.5 cursor-pointer"
            >
              READ IN CASE LOG &rarr;
            </button>
          </div>
          {resultOpen && (
            <p className="font-mono text-[13px] text-[#2A2F27] leading-relaxed mt-3 mb-0 bg-[#FBF8F0] border border-[#D6CDB4] px-3.5 py-3">
              {action.outcome}
            </p>
          )}
          <OpensNextStrip actionId={action.id} completedActionIds={completedActionIds} week={week} />
        </>
      )}
    </div>
  );
}

export default function EvidenceViews({
  actions,
  evidence,
  completedActionIds,
  completedWeeks,
  week,
  moduleWeek,
  remaining,
  reservePoints,
  pending,
  justTakenId,
  onTake,
  onOpenExhibit,
}: {
  actions: ActionItem[];
  evidence: EvidenceItem[];
  completedActionIds: ReadonlySet<string>;
  completedWeeks: ReadonlyMap<string, number>;
  /** The week being acted in (the browsable week selector) — what week gates are checked against. */
  week: number;
  /** The module's current week — what free baseline documents unlock against. */
  moduleWeek: number;
  remaining: number;
  reservePoints: number;
  pending: boolean;
  justTakenId: string | null;
  onTake: (action: ActionItem, useReserve: boolean) => void;
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
          enquiries: actions.filter((a) => a.case === c),
        }))
      : EVIDENCE_GROUP_ORDER.map((g) => ({
          key: g as string,
          label: EVIDENCE_GROUP_META[g].label,
          onFile: onFile.filter((e) => e.group === g),
          enquiries: actions.filter((a) => a.group === g),
        }));

  const rendered = groups
    .map((g) => ({
      ...g,
      views: g.enquiries.map((a) => getEnquiryView(a, completedActionIds, week)).filter((v) => v.state !== "hidden"),
    }))
    .filter((g) => g.onFile.length > 0 || g.views.length > 0);

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
                  <OnFileTile
                    key={item.id}
                    item={item}
                    unlocked={isEvidenceUnlocked(item, moduleWeek, completedActionIds)}
                    week={moduleWeek}
                    onOpen={() => onOpenExhibit(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {group.views.length > 0 && (
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#A6764A] mb-2 mt-0">Enquiries</h4>
              {group.views.map((view) => (
                <EnquiryCard
                  key={view.action.id}
                  view={view}
                  completedActionIds={completedActionIds}
                  doneWeek={completedWeeks.get(view.action.id) ?? null}
                  week={week}
                  canAfford={remaining >= view.action.cost && !pending}
                  canAffordFromReserve={reservePoints >= view.action.cost && !pending}
                  justTaken={justTakenId === view.action.id}
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
