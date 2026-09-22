"use client";

import { useState } from "react";
import type { EvidenceItem } from "@/lib/evidence-catalog";

export default function PinDetailModal({
  evidence,
  note,
  onClose,
  onSaveNote,
}: {
  evidence: EvidenceItem;
  note: string | null;
  onClose: () => void;
  onSaveNote: (note: string) => void;
}) {
  const [draftNote, setDraftNote] = useState(note ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[#F4EFE1] border border-[#A6764A] shadow-xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] text-[#5B5A4E] mb-1 mt-0">{evidence.exhibit}</p>
            <h3 className="font-serif font-semibold text-lg text-[#2A2F27] m-0">{evidence.title}</h3>
          </div>
          <button onClick={onClose} className="font-mono text-xs text-[#5B5A4E] hover:text-[#2A2F27]">
            Close
          </button>
        </div>
        <p className="mt-3 font-mono text-[13px] text-[#2A2F27] leading-relaxed whitespace-pre-line">{evidence.snippet}</p>

        <div className="mt-5 border-t border-dotted border-[#A6764A] pt-4">
          <label className="block font-mono text-[11px] text-[#5B5A4E] mb-1">Your note on this card</label>
          <textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            rows={2}
            className="w-full font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-1.5 text-[#2A2F27] outline-none"
            placeholder="A note to yourself about this piece of evidence…"
          />
          <button
            onClick={() => onSaveNote(draftNote)}
            className="mt-2 font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-3.5 py-1.5 border border-[#2A2F27]"
          >
            SAVE NOTE
          </button>
        </div>
      </div>
    </div>
  );
}
