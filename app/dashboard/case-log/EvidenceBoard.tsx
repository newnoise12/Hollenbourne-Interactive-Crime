"use client";

import { useState, type ReactNode } from "react";
import { XIcon, FileTextIcon } from "@/components/icons";
import { TYPE_META, SUSPECT_META, CASE_META, type EvidenceItem, type CaseName } from "@/lib/evidence-catalog";
import {
  checkAssistedFields,
  checkFreeText,
  assembleCitation,
  extractTitleGuess,
  redact,
  type AssistedFields,
} from "@/lib/citation-validation";
import type { CitationMap } from "@/lib/evidence";
import type { Board, BoardPin } from "@/lib/board";
import Corkboard from "./Corkboard";
import PinDetailModal from "./PinDetailModal";

function renderCited(text: string, titleSpan: string | null): ReactNode {
  if (!titleSpan) return text;
  const idx = text.indexOf(titleSpan);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <em className="italic">{titleSpan}</em>
      {text.slice(idx + titleSpan.length)}
    </>
  );
}

function StampBadge({ verified }: { verified: boolean }) {
  return (
    <span
      key={verified ? "verified" : "inadmissible"}
      className={`font-mono font-bold text-xs tracking-wide border-2 px-2.5 py-0.5 inline-block -rotate-3 animate-[stampIn_0.25s_ease-out] ${
        verified ? "text-[#2F6B4F] border-[#2F6B4F]" : "text-[#8B3226] border-[#8B3226]"
      }`}
    >
      {verified ? "VERIFIED" : "INADMISSIBLE"}
    </span>
  );
}

function DocumentThumbnail({ title, onOpen }: { title: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label={`View document: ${title}`}
      className="flex items-center gap-2.5 bg-[#F4EFE1] border border-[#A6764A] px-3.5 py-2.5 mb-3.5 w-full text-left cursor-pointer"
    >
      <div className="w-8.5 h-11 bg-[#FBF8F0] border border-[#D6CDB4] flex items-center justify-center shrink-0">
        <FileTextIcon size={16} className="text-[#A6764A]" />
      </div>
      <div>
        <p className="font-mono text-xs text-[#2A2F27] m-0">View document</p>
        <p className="font-mono text-[11px] text-[#5B5A4E] mt-0.5 mb-0">Full details, enlarged</p>
      </div>
    </button>
  );
}

function DocumentModal({ item, onClose }: { item: EvidenceItem; onClose: () => void }) {
  const m = item.meta!;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(20,18,14,0.72)] flex items-center justify-center p-5 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F4EFE1] border border-[#A6764A] px-10 py-9 max-w-[440px] w-full relative"
      >
        <button
          onClick={onClose}
          aria-label="Close document"
          className="absolute top-3.5 right-3.5 bg-transparent border-none cursor-pointer text-[#5B5A4E]"
        >
          <XIcon size={20} />
        </button>

        <span className="absolute top-7.5 -left-1.5 -rotate-[8deg] font-mono font-bold text-[11px] tracking-wide text-[#8B3226] border-2 border-[#8B3226] px-2 py-0.5">
          EVIDENCE
        </span>

        <p className="font-mono text-[11px] text-[#5B5A4E] text-center mb-4.5 mt-0">{item.exhibit}</p>

        <div className="text-center border-b-2 border-[#A6764A] pb-3.5 mb-4.5">
          <p className="font-mono text-[10px] tracking-[3px] text-[#5B5A4E] mb-1.5 mt-0">case document</p>
          <p className="font-serif font-semibold text-xl text-[#2A2F27] m-0">{m.author}</p>
        </div>

        <p className="font-serif text-[17px] italic text-[#2A2F27] text-center mb-5.5 mt-0">{m.title}</p>

        <table className="w-full font-mono text-xs text-[#2A2F27] border-collapse">
          <tbody>
            <tr>
              <td className="text-[#5B5A4E] py-1.5 border-t border-dotted border-[#A6764A]">Document type</td>
              <td className="text-right py-1.5 border-t border-dotted border-[#A6764A]">
                {item.citeType === "report" ? "Published report" : "Unpublished force record"}
              </td>
            </tr>
            <tr>
              <td className="text-[#5B5A4E] py-1.5 border-t border-dotted border-[#A6764A]">
                {item.citeType === "report" ? "Year published" : "Year recorded"}
              </td>
              <td className="text-right py-1.5 border-t border-dotted border-[#A6764A]">{m.year}</td>
            </tr>
            {item.citeType === "report" && (
              <>
                <tr>
                  <td className="text-[#5B5A4E] py-1.5 border-t border-dotted border-[#A6764A]">Place of publication</td>
                  <td className="text-right py-1.5 border-t border-dotted border-[#A6764A]">{m.place}</td>
                </tr>
                <tr>
                  <td className="text-[#5B5A4E] py-1.5 border-t border-dotted border-[#A6764A]">Publisher</td>
                  <td className="text-right py-1.5 border-t border-dotted border-[#A6764A]">{m.publisher}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <p className="font-mono text-[11px] italic text-[#5B5A4E] text-center mt-5.5 mb-0">
          Use these details to reference this document.
        </p>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  onChange,
  widthClass,
  italic,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  widthClass?: string;
  italic?: boolean;
}) {
  return (
    <div className={widthClass ?? "flex-1 basis-[140px]"}>
      <label className="font-mono text-[10px] text-[#5B5A4E] block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className={`w-full font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-1.5 text-[#2A2F27] outline-none box-border ${
          italic ? "italic" : ""
        }`}
      />
    </div>
  );
}

const btnClass =
  "font-mono text-xs tracking-wide bg-transparent border border-[#2A2F27] text-[#2A2F27] px-4 py-2 cursor-pointer";
const errClass = "font-mono text-xs text-[#8B3226] mt-2 mb-0";

const CASE_ORDER: CaseName[] = ["general", "mason", "wooley", "porterhouse", "butt"];

// The reader-dialog overlay pattern from the recovered artifact prototype
// (see CLAUDE.md's "Repo location") — a small backdrop-centred sheet, not an
// inline expanded card. Exhibits sit as compact tiles in a grid; opening one
// shows the full citation exercise or the cited document inside this.
function Overlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div onClick={onClose} className="fixed inset-0 bg-[rgba(20,18,14,0.72)] flex items-center justify-center p-5 z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#E8E1D0] border border-[#D6CDB4] max-w-[440px] w-full max-h-[85vh] overflow-y-auto relative"
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
  citation,
  pinned,
  onOpen,
}: {
  item: EvidenceItem;
  citation: { text: string; title: string | null } | undefined;
  pinned: boolean;
  onOpen: () => void;
}) {
  const meta = TYPE_META[item.type];
  const suspectMeta = item.suspect ? SUSPECT_META[item.suspect] : null;
  const isCited = !!citation;

  if (item.locked) {
    return (
      <div className="bg-[#3A3D3E] border border-dashed border-[#A6764A55] px-4 py-3.5 opacity-75">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-mono text-[11px] text-[#A6764A] tracking-wide">{item.exhibit}</span>
          <span className="font-mono text-[10px] text-[#8A8A80] border border-[#55554E] px-1.5 py-0.5">LOCKED</span>
        </div>
        <p className="font-mono text-[13px] text-[#6E6D64] tracking-[1.5px] mb-1.5 mt-0">{redact(item.title)}</p>
        <p className="font-mono text-[11px] text-[#8A8A80] m-0">Unlocks in week {item.unlocksWeek}</p>
      </div>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="text-left w-full bg-[#E8E1D0] border border-[#D6CDB4] border-l-4 px-4 py-3.5 cursor-pointer hover:border-[#A6764A] transition-colors"
      style={{ borderLeftColor: isCited ? "#2F6B4F" : "#8B3226" }}
    >
      <div className="flex justify-between items-baseline mb-1.5 gap-2">
        <span className="font-mono text-[11px] text-[#5B5A4E] tracking-wide">{item.exhibit}</span>
        <span className="font-mono text-[10px] font-bold tracking-wide" style={{ color: isCited ? "#2F6B4F" : "#8B3226" }}>
          {isCited ? "VERIFIED" : "OPEN"}
        </span>
      </div>
      <h4 className="font-serif font-semibold text-[14px] leading-snug text-[#2A2F27] mb-1.5 mt-0">{item.title}</h4>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-mono text-[10px]" style={{ color: suspectMeta ? suspectMeta.color : meta.color }}>
          {suspectMeta ? suspectMeta.label : meta.label}
        </span>
        {pinned && <span className="font-mono text-[10px] text-[#A6764A]">&middot; pinned</span>}
      </div>
    </button>
  );
}

function ExhibitDetail({
  item,
  citation,
  onCite,
  pinned,
  onPin,
  onClose,
}: {
  item: EvidenceItem;
  citation: { text: string; title: string | null } | undefined;
  onCite: (id: string, payload: { text: string; title: string | null }) => Promise<void>;
  pinned: boolean;
  onPin: (exhibitId: string) => void;
  onClose: () => void;
}) {
  const [fields, setFields] = useState<AssistedFields>({ author: "", year: "", title: "", place: "", publisher: "" });
  const [freeText, setFreeText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const meta = TYPE_META[item.type];
  const suspectMeta = item.suspect ? SUSPECT_META[item.suspect] : null;
  const isCited = !!citation;

  const setField = (key: keyof AssistedFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields({ ...fields, [key]: e.target.value });

  const submitAssisted = () => {
    const err = checkAssistedFields(fields, item);
    if (err) {
      setMessage(err);
      return;
    }
    setMessage(null);
    const text = assembleCitation(fields, item);
    const titleSpan = item.citeType === "report" ? fields.title.trim() : null;
    onCite(item.id, { text, title: titleSpan });
  };

  const submitFreeText = () => {
    const err = checkFreeText(freeText, item);
    if (err) {
      setMessage(err);
      return;
    }
    setMessage(null);
    const text = freeText.trim();
    const titleSpan = extractTitleGuess(text, item);
    onCite(item.id, { text, title: titleSpan });
  };

  const showItalicHint = item.citeType === "report";

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
        <StampBadge verified={isCited} />
      </div>

      <h3 className="font-serif font-semibold text-lg text-[#2A2F27] mb-3 mt-0">{item.title}</h3>

      {isCited ? (
        <>
          <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mb-2.5 mt-0">{item.snippet}</p>
          <button
            onClick={() => setModalOpen(true)}
            className="font-mono text-[11px] bg-transparent border-none text-[#A6764A] cursor-pointer underline p-0 mb-2.5"
          >
            view document
          </button>
          <p className="font-mono text-xs text-[#2F6B4F] m-0 border-t border-dotted border-[#D6CDB4] pt-2.5 mb-2.5">
            cited: {renderCited(citation!.text, citation!.title)}
          </p>
          <button
            onClick={() => onPin(item.id)}
            disabled={pinned}
            className="font-mono text-[11px] tracking-wide bg-transparent border border-[#A6764A] text-[#A6764A] px-2.5 py-1 disabled:opacity-40 disabled:cursor-default"
          >
            {pinned ? "📌 pinned to corkboard" : "pin to corkboard"}
          </button>
        </>
      ) : item.assisted ? (
        <>
          <DocumentThumbnail title={item.title} onOpen={() => setModalOpen(true)} />
          <div className="flex gap-2 flex-wrap mb-2">
            <FieldRow label="author / organisation" value={fields.author} onChange={setField("author")} widthClass="flex-1 basis-full" />
          </div>
          <div className="flex gap-2 flex-wrap mb-1">
            <FieldRow label="year" value={fields.year} onChange={setField("year")} widthClass="flex-none basis-20" />
            <FieldRow label="title" value={fields.title} onChange={setField("title")} widthClass="flex-1 basis-[220px]" italic={showItalicHint} />
          </div>
          {showItalicHint && (
            <p className="font-mono text-[10px] text-[#5B5A4E] mb-2 mt-0">
              Report titles display in italics automatically — just type it normally.
            </p>
          )}
          {item.citeType === "report" && (
            <div className="flex gap-2 flex-wrap mb-2">
              <FieldRow label="place" value={fields.place} onChange={setField("place")} />
              <FieldRow label="publisher" value={fields.publisher} onChange={setField("publisher")} />
            </div>
          )}
          <button onClick={submitAssisted} className={btnClass}>
            CITE
          </button>
          {message && <p className={errClass}>{message}</p>}
        </>
      ) : (
        <>
          <DocumentThumbnail title={item.title} onOpen={() => setModalOpen(true)} />
          <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mb-3 mt-0">{item.hint}</p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Assemble the full citation yourself"
              className="flex-1 basis-[240px] font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-2 text-[#2A2F27] outline-none placeholder:text-[#A8A08A]"
            />
            <button onClick={submitFreeText} className={btnClass}>
              CITE
            </button>
          </div>
          {message && <p className={errClass}>{message}</p>}
        </>
      )}

      {modalOpen && <DocumentModal item={item} onClose={() => setModalOpen(false)} />}
    </Overlay>
  );
}

export default function EvidenceBoard({
  evidence,
  initialCitations,
  initialBoard,
}: {
  evidence: EvidenceItem[];
  initialCitations: CitationMap;
  initialBoard: Board;
}) {
  const [citations, setCitations] = useState<CitationMap>(initialCitations);
  const [board, setBoard] = useState<Board>(initialBoard);
  const [openPin, setOpenPin] = useState<BoardPin | null>(null);
  const [openExhibitId, setOpenExhibitId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);

  const handleCite = async (id: string, payload: { text: string; title: string | null }) => {
    setSaveError(false);
    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitId: id, text: payload.text, title: payload.title }),
      });
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      setCitations((prev) => ({ ...prev, [id]: payload }));
    } catch {
      setSaveError(true);
    }
  };

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

  const pinnedExhibitIds = new Set(board.pins.map((p) => p.evidence.id));
  const unlockedCount = evidence.filter((e) => !e.locked).length;
  const citedCount = Object.keys(citations).length;
  const openItem = openExhibitId ? evidence.find((e) => e.id === openExhibitId) ?? null : null;

  // The "filing cabinet": every unlocked-or-not item lives permanently in
  // its case's section, per Reference/case-content's evidence-board-design
  // spec — general/force-wide material first, then one section per victim.
  const groups = CASE_ORDER.map((caseName) => ({
    caseName,
    items: evidence.filter((e) => e.case === caseName),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <style>{`@keyframes stampIn { 0% { transform: scale(1.5) rotate(-3deg); opacity: 0; } 100% { transform: scale(1) rotate(-3deg); opacity: 1; } }`}</style>
        <div className="flex justify-between items-center mb-6 border-b border-[#A6764A55] pb-4">
          <p className="font-mono text-xs text-[#8A8A80] m-0">
            Evidentiary register &mdash; Boresfield review. Open each document, then cite it correctly to unlock it.
          </p>
          <span className="font-mono text-xs text-[#A6764A] shrink-0 ml-4">
            {citedCount} of {unlockedCount} accessed
          </span>
        </div>
        {groups.map(({ caseName, items }) => (
          <div key={caseName} className="mb-8">
            <h3 className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#A6764A] mb-3 mt-0">
              {CASE_META[caseName].label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <ExhibitTile
                  key={item.id}
                  item={item}
                  citation={citations[item.id]}
                  pinned={pinnedExhibitIds.has(item.id)}
                  onOpen={() => setOpenExhibitId(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
        {saveError && (
          <p className="font-mono text-[11px] text-[#8B3226] mt-2">Couldn&apos;t save &mdash; try again.</p>
        )}
        {openItem && !openItem.locked && (
          <ExhibitDetail
            item={openItem}
            citation={citations[openItem.id]}
            onCite={handleCite}
            pinned={pinnedExhibitIds.has(openItem.id)}
            onPin={pinEvidence}
            onClose={() => setOpenExhibitId(null)}
          />
        )}

        <div className="mt-8">
          <h2 className="font-serif font-semibold text-lg text-[#E8E1D0] mb-3 mt-0">Corkboard</h2>
          <p className="font-mono text-xs text-[#8A8A80] mb-3 mt-0">
            Pin cited exhibits here to lay out the case visually and connect related threads.
          </p>
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
        />
      )}
    </div>
  );
}
