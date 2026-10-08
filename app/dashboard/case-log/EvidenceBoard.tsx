"use client";

import { useState, type ReactNode } from "react";
import { XIcon } from "@/components/icons";
import {
  TYPE_META,
  SUSPECT_META,
  CASE_META,
  getEvidenceColor,
  type EvidenceItem,
  type CaseName,
  type EvidenceBodySection,
} from "@/lib/evidence-meta";
import type { ClientEvidence } from "@/lib/team-view";
import type { Board, BoardPin } from "@/lib/board";
import Corkboard from "./Corkboard";
import PinDetailModal from "./PinDetailModal";
import { OpensNextStrip } from "../actions/OpensNext";

function redact(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, "█");
}

// Full-text reading: opens in place inside ExhibitDetail (no extra modal
// layer) so it reads as "the box just got bigger," not another dialog
// stacked on top. Shown for any unlocked item, whether it has a body or not
// (falls back to nothing — not every exhibit has a full source document).
export function FullTextReader({ sections }: { sections: EvidenceBodySection[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-[11px] tracking-wide bg-transparent border border-[#2A2F27] text-[#2A2F27] px-3 py-1.5 cursor-pointer"
      >
        {open ? "HIDE FULL TEXT ▲" : "READ IN FULL ▾"}
      </button>
      {open && (
        <div className="mt-2.5 bg-[#FBF8F0] border border-[#D6CDB4] px-4 py-3.5 max-h-[50vh] overflow-y-auto">
          {sections.map((section, si) => (
            <div key={si} className={si > 0 ? "mt-4 pt-4 border-t border-dotted border-[#D6CDB4]" : ""}>
              {section.heading && (
                <p className="font-mono text-[11px] uppercase tracking-wide text-[#A6764A] mb-2 mt-0">{section.heading}</p>
              )}
              {section.paragraphs.map((p, pi) => (
                <p key={pi} className="font-mono text-[13px] text-[#2A2F27] leading-relaxed mb-2.5 mt-0 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CASE_ORDER: CaseName[] = ["general", "mason", "wooley", "porterhouse", "butt"];

// Genuine full-size viewing — distinct from the 440px-wide reader panel,
// which is deliberately narrow for reading text but was squeezing exhibit
// images (the case maps, the cell-site overlays) down to a fraction of their
// real size. This renders at up to the full viewport, scrollable if the
// image is still larger than that.
export function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(10,9,7,0.9)] flex items-center justify-center p-4 z-[60] overflow-auto"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="fixed top-4 right-4 bg-transparent border-none cursor-pointer text-[#E8E1D0] z-10"
      >
        <XIcon size={24} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full w-auto h-auto cursor-zoom-out border border-[#A6764A]"
      />
    </div>
  );
}

// A clickable exhibit image — thumbnail-sized inside the reader panel, opens
// the same image at genuine full size in an ImageLightbox on click.
export function ExhibitImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="block bg-transparent border-none p-0 cursor-zoom-in mb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-w-full border border-[#A6764A]" />
      </button>
      {caption && <p className="font-mono text-[11px] text-[#5B5A4E] leading-relaxed mb-1 mt-0">{caption}</p>}
      <p className="font-mono text-[10px] text-[#8A8A80] mb-3 mt-0">Click the image to view it full size.</p>
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

// The reader-dialog overlay pattern from the recovered artifact prototype
// (see CLAUDE.md's "Repo location") — a backdrop-centred sheet, not an
// inline expanded card. Widened from the artifact's original 440px once
// full interview transcripts made that column too narrow to read
// comfortably — matches roughly the width of the dashboard shell itself
// (max-w-[640px]) rather than the artifact's much smaller dialog.
function Overlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-[rgba(20,18,14,0.72)] flex items-center justify-center p-5 z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#E8E1D0] border border-[#D6CDB4] max-w-[680px] w-full max-h-[85vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 bg-transparent border-none cursor-pointer text-[#5B5A4E] z-10"
        >
          <XIcon size={20} />
        </button>
        <div className="px-5 py-4.5">{children}</div>
      </div>
    </div>
  );
}

function ExhibitTile({
  item,
  unlocked,
  requirementLabel,
  pinned,
  onOpen,
}: {
  item: EvidenceItem;
  unlocked: boolean;
  requirementLabel: string | null;
  pinned: boolean;
  onOpen: () => void;
}) {
  const meta = TYPE_META[item.type];
  const suspectMeta = item.suspect ? SUSPECT_META[item.suspect] : null;

  if (!unlocked) {
    return (
      <div className="bg-[#3A3D3E] border border-dashed border-[#A6764A55] px-4 py-3.5 opacity-75">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-mono text-[11px] text-[#A6764A] tracking-wide">{item.exhibit}</span>
          <span className="font-mono text-[10px] text-[#8A8A80] border border-[#55554E] px-1.5 py-0.5">LOCKED</span>
        </div>
        <p className="font-mono text-[13px] text-[#6E6D64] tracking-[1.5px] mb-1.5 mt-0">{redact(item.title)}</p>
        <p className="font-mono text-[11px] text-[#8A8A80] m-0">{requirementLabel}</p>
      </div>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="text-left w-full bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 px-4 py-3.5 cursor-pointer hover:border-[#A6764A] transition-colors"
      style={{ borderLeftColor: getEvidenceColor(item) }}
    >
      <div className="flex justify-between items-baseline mb-1.5 gap-2">
        <span className="font-mono text-[11px] text-[#5B5A4E] tracking-wide">{item.exhibit}</span>
        {pinned && <span className="font-mono text-[10px] text-[#A6764A]">pinned</span>}
      </div>
      <h4 className="font-serif font-semibold text-[14px] leading-snug text-[#2A2F27] mb-1.5 mt-0">{item.title}</h4>
      <span className="font-mono text-[10px]" style={{ color: suspectMeta ? suspectMeta.color : meta.color }}>
        {suspectMeta ? suspectMeta.label : meta.label}
      </span>
    </button>
  );
}

function ExhibitDetail({
  item,
  pinned,
  currentWeek,
  onPin,
  onUnpin,
  onClose,
}: {
  item: ClientEvidence;
  pinned: boolean;
  currentWeek: number;
  onPin: (exhibitId: string) => void;
  onUnpin: (exhibitId: string) => void;
  onClose: () => void;
}) {
  const meta = TYPE_META[item.type];
  const suspectMeta = item.suspect ? SUSPECT_META[item.suspect] : null;

  return (
    <Overlay onClose={onClose}>
      <div className="flex justify-between items-baseline mb-2.5 flex-wrap gap-2 pr-6">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[13px] text-[#5B5A4E] tracking-wide">{item.exhibit}</span>
          <span className="font-mono text-xs" style={{ color: meta.color }}>
            {meta.label}
          </span>
          {suspectMeta && (
            <span className="font-mono text-[11px] border px-1.5 py-0.5" style={{ color: suspectMeta.color, borderColor: suspectMeta.color }}>
              {suspectMeta.label}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-serif font-semibold text-lg text-[#2A2F27] mb-3 mt-0">{item.title}</h3>

      <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mb-2.5 mt-0">{item.snippet}</p>

      {item.image && <ExhibitImage src={item.image} alt={item.title} caption={item.imageCaption} />}

      <FullTextReader
        sections={item.body ?? [{ paragraphs: ["No fuller record exists on file for this exhibit beyond the summary above."] }]}
      />

      {item.opensNext && item.opensNext.length > 0 && (
        <div className="mb-4">
          <OpensNextStrip entries={item.opensNext} week={currentWeek} />
        </div>
      )}

      {pinned ? (
        <button
          onClick={() => onUnpin(item.id)}
          className="font-mono text-[11px] tracking-wide bg-transparent border border-[#8B3226] text-[#8B3226] px-2.5 py-1"
        >
          remove from corkboard
        </button>
      ) : (
        <button
          onClick={() => onPin(item.id)}
          className="font-mono text-[11px] tracking-wide bg-transparent border border-[#A6764A] text-[#A6764A] px-2.5 py-1"
        >
          move to corkboard
        </button>
      )}
    </Overlay>
  );
}

export default function EvidenceBoard({
  evidence,
  initialBoard,
  currentWeek,
  exhibitRequest,
}: {
  evidence: ClientEvidence[];
  initialBoard: Board;
  currentWeek: number;
  exhibitRequest: { id: string } | null;
}) {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [openPin, setOpenPin] = useState<BoardPin | null>(null);
  const [openExhibitId, setOpenExhibitId] = useState<string | null>(exhibitRequest?.id ?? null);
  // The Investigation tab can ask for an exhibit to be opened here. Take each
  // new request once (this tab may mount for the first time because of it).
  const [seenRequest, setSeenRequest] = useState(exhibitRequest);
  if (exhibitRequest !== seenRequest) {
    setSeenRequest(exhibitRequest);
    if (exhibitRequest) setOpenExhibitId(exhibitRequest.id);
  }
  const [saveError, setSaveError] = useState(false);
  // A snapshot taken client-side right before "clear board" — nothing is
  // kept server-side, so undo only works for as long as this stays in
  // memory (i.e. until the page reloads or another clear overwrites it).
  const [clearSnapshot, setClearSnapshot] = useState<Board | null>(null);
  const [pendingClear, setPendingClear] = useState(false);
  const [undoBusy, setUndoBusy] = useState(false);

  const refreshBoard = async (promise: Promise<Response>) => {
    setSaveError(false);
    try {
      const res = await promise;
      const data = await res.json();
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      setBoard(data);
      return data as Board;
    } catch {
      setSaveError(true);
    }
  };

  const pinEvidence = (exhibitId: string) =>
    refreshBoard(
      fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitId, x: 40 + Math.random() * 200, y: 40 + Math.random() * 120 }),
      })
    );

  const movePin = (pinId: string, x: number, y: number) =>
    refreshBoard(fetch(`/api/board/pins/${pinId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ x, y }) }));

  const unpinPin = async (pinId: string) => {
    await refreshBoard(fetch(`/api/board/pins/${pinId}`, { method: "DELETE" }));
    setOpenPin((p) => (p?.id === pinId ? null : p));
  };

  const unpinByExhibitId = (exhibitId: string) => {
    const pin = board.pins.find((p) => p.evidence.id === exhibitId);
    if (pin) unpinPin(pin.id);
  };

  const saveNote = async (pinId: string, note: string) => {
    const data = await refreshBoard(
      fetch(`/api/board/pins/${pinId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) })
    );
    if (data) setOpenPin(data.pins.find((p) => p.id === pinId) ?? null);
  };

  const connectPins = (fromPinId: string, toPinId: string, label: string) =>
    refreshBoard(
      fetch("/api/board/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromPinId, toPinId, label }) })
    );

  const deleteConnection = (connectionId: string) => refreshBoard(fetch(`/api/board/connections/${connectionId}`, { method: "DELETE" }));

  const handleClearBoard = async () => {
    setPendingClear(false);
    setClearSnapshot(board);
    await refreshBoard(fetch("/api/board", { method: "DELETE" }));
  };

  // Replays a cleared board from the client-side snapshot: re-pins every
  // exhibit (new pin ids — the old ones are gone), then re-creates every
  // connection by mapping old pin ids to new ones via the shared exhibit id,
  // then re-applies any notes. Sequential, not parallel, since connections
  // depend on the pins existing first.
  const handleUndoClear = async () => {
    if (!clearSnapshot || undoBusy) return;
    setUndoBusy(true);
    setSaveError(false);
    try {
      let latestBoard: Board = board;
      for (const pin of clearSnapshot.pins) {
        const res = await fetch("/api/board", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exhibitId: pin.evidence.id, x: pin.x, y: pin.y }),
        });
        if (!res.ok) throw new Error("Couldn't restore a pin.");
        latestBoard = await res.json();
      }

      const exhibitToNewPinId = new Map<string, string>();
      for (const pin of clearSnapshot.pins) {
        const newPin = latestBoard.pins.find((p) => p.evidence.id === pin.evidence.id);
        if (newPin) exhibitToNewPinId.set(pin.evidence.id, newPin.id);
      }

      for (const pin of clearSnapshot.pins) {
        if (!pin.note) continue;
        const newPinId = exhibitToNewPinId.get(pin.evidence.id);
        if (!newPinId) continue;
        const res = await fetch(`/api/board/pins/${newPinId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: pin.note }),
        });
        if (res.ok) latestBoard = await res.json();
      }

      for (const connection of clearSnapshot.connections) {
        const fromExhibitId = clearSnapshot.pins.find((p) => p.id === connection.fromPinId)?.evidence.id;
        const toExhibitId = clearSnapshot.pins.find((p) => p.id === connection.toPinId)?.evidence.id;
        const newFromId = fromExhibitId && exhibitToNewPinId.get(fromExhibitId);
        const newToId = toExhibitId && exhibitToNewPinId.get(toExhibitId);
        if (!newFromId || !newToId) continue;
        const res = await fetch("/api/board/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromPinId: newFromId, toPinId: newToId, label: connection.label }),
        });
        if (res.ok) latestBoard = await res.json();
      }

      setBoard(latestBoard);
      setClearSnapshot(null);
    } catch {
      setSaveError(true);
    } finally {
      setUndoBusy(false);
    }
  };

  const pinnedExhibitIds = new Set(board.pins.map((p) => p.evidence.id));
  // Case Log lists baseline documents (time-released ones show as locked) and
  // findings the team has actually obtained. A finding not yet unlocked is not
  // listed at all — showing every locked one would reveal the whole action tree.
  // The server never sends a finding the team hasn't unlocked (lib/team-view.ts), so the list is
  // simply everything it was given; `unlocked` only distinguishes time-released stubs.
  const listed = evidence;
  const unlockedCount = listed.filter((e) => e.unlocked).length;
  const openItem = openExhibitId ? evidence.find((e) => e.id === openExhibitId) ?? null : null;
  const openItemUnlocked = openItem ? openItem.unlocked : false;

  const requirementFor = (item: EvidenceItem): string | null => {
    if (item.unlocksWeek && currentWeek < item.unlocksWeek) {
      return `Unlocks in week ${item.unlocksWeek}`;
    }
    return null;
  };

  // The "filing cabinet": every unlocked-or-not item lives permanently in
  // its case's section, per Reference/case-content's evidence-board-design
  // spec — general/force-wide material first, then one section per victim.
  const groups = CASE_ORDER.map((caseName) => ({
    caseName,
    items: listed.filter((e) => e.case === caseName),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
        <div className="flex justify-between items-center mb-6 border-b border-[#A6764A55] pb-4">
          <p className="font-mono text-xs text-[#8A8A80] m-0">
            Evidentiary register &mdash; Boresfield review. Unlocked exhibits can be read in full and pinned to the
            corkboard.
          </p>
          <span className="font-mono text-xs text-[#A6764A] shrink-0 ml-4">
            {unlockedCount} of {listed.length} on file
          </span>
        </div>
        {groups.map(({ caseName, items }) => (
          <div key={caseName} className="mb-8">
            <h3 className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#A6764A] mb-3 mt-0">
              {CASE_META[caseName].label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => {
                const unlocked = item.unlocked;
                return (
                  <ExhibitTile
                    key={item.id}
                    item={item}
                    unlocked={unlocked}
                    requirementLabel={unlocked ? null : requirementFor(item)}
                    pinned={pinnedExhibitIds.has(item.id)}
                    onOpen={() => setOpenExhibitId(item.id)}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {saveError && (
          <p className="font-mono text-[11px] text-[#8B3226] mt-2">Couldn&apos;t save &mdash; try again.</p>
        )}
        {openItem && openItemUnlocked && (
          <ExhibitDetail
            item={openItem}
            pinned={pinnedExhibitIds.has(openItem.id)}
            currentWeek={currentWeek}
            onPin={pinEvidence}
            onUnpin={unpinByExhibitId}
            onClose={() => setOpenExhibitId(null)}
          />
        )}

        <div className="mt-8">
          <div className="flex justify-between items-start gap-3 mb-3">
            <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] m-0">Corkboard</h2>
            <div className="flex gap-2 shrink-0">
              {clearSnapshot && (
                <button
                  onClick={handleUndoClear}
                  disabled={undoBusy}
                  className="font-mono text-[11px] tracking-wide bg-transparent border border-[#A6764A] text-[#A6764A] px-2.5 py-1 disabled:opacity-50"
                >
                  {undoBusy ? "RESTORING…" : "UNDO CLEAR"}
                </button>
              )}
              {board.pins.length > 0 && (
                <button
                  onClick={() => setPendingClear(true)}
                  className="font-mono text-[11px] tracking-wide bg-transparent border border-[#8B3226] text-[#8B3226] px-2.5 py-1"
                >
                  clear board
                </button>
              )}
            </div>
          </div>
          <p className="font-mono text-xs text-[#8A8A80] mb-3 mt-0">
            Use &quot;move to corkboard&quot; on an unlocked exhibit above to lay out the case visually and connect
            related threads &mdash; drag cards here to arrange them, not to add them.
          </p>
          {pendingClear && (
            <div className="mb-3 bg-[#E8E1D0] border border-[#8B3226] px-4 py-3.5">
              <p className="font-mono text-xs text-[#2A2F27] mb-3 mt-0">
                Clear the whole corkboard? This removes every pinned card and connection for the team &mdash; you can
                undo it right after, but not once you&apos;ve navigated away or reloaded the page.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearBoard}
                  className="font-mono text-xs tracking-wide bg-[#8B3226] text-[#F4EFE1] px-3.5 py-1.5 border border-[#8B3226]"
                >
                  CLEAR BOARD
                </button>
                <button
                  onClick={() => setPendingClear(false)}
                  className="font-mono text-xs tracking-wide bg-transparent text-[#5B5A4E] px-3.5 py-1.5 border border-[#5B5A4E]"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
          <Corkboard
            pins={board.pins}
            connections={board.connections}
            onMovePin={movePin}
            onOpenPin={setOpenPin}
            onUnpin={unpinPin}
            onConnect={connectPins}
            onDeleteConnection={deleteConnection}
          />
        </div>

      {openPin && (
        <PinDetailModal
          evidence={openPin.evidence}
          note={openPin.note}
          onClose={() => setOpenPin(null)}
          onSaveNote={(note) => saveNote(openPin.id, note)}
          onUnpin={() => unpinPin(openPin.id)}
        />
      )}
    </div>
  );
}
