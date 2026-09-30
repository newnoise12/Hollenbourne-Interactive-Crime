"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Cw2Draft, DataTypeFeedback, SynthesisFeedback, Reasoning, Multiplicity, EpistemicFraming } from "@/lib/cw2-practice";
import { CW2_ITEMS, DAILY_CHECK_CAP, FORMATIVE_DISCLAIMER, SYNTHESIS_PROMPTS, type Cw2Item } from "@/lib/cw2-items";

// Imports only lib/cw2-items.ts (student-facing content) and type-only from
// lib/cw2-practice.ts — never lib/cw2-grading.ts, which holds the answer key.

const STATUS_COLORS: Record<string, string> = {
  correct: "#2F6B4F",
  sound: "#2F6B4F",
  present: "#2F6B4F",
  well_framed: "#2F6B4F",
  connection_found: "#2F6B4F",
  tension_found: "#2F6B4F",
  flawed: "#A6764A",
  could_be_sharper: "#A6764A",
  missing: "#8B3226",
  gap_found: "#A6764A",
  absent: "#A6764A",
  not_engaged: "#8B3226",
};

const STATUS_LABELS: Record<string, string> = {
  correct: "Correct",
  flawed: "Flawed",
  missing: "Missing",
  sound: "Sound",
  gap_found: "Gap found",
  present: "Present",
  absent: "Absent",
  well_framed: "Well framed",
  could_be_sharper: "Could be sharper",
  connection_found: "Connection found",
  tension_found: "Tension found",
  not_engaged: "Not engaged",
};

function StatusRow({ label, status, note }: { label: string; status: string; note?: string }) {
  return (
    <div className="flex items-start gap-2 font-mono text-xs">
      <span className="min-w-[130px] text-[#2A2F27]">{label}</span>
      <span className="min-w-[110px] font-semibold" style={{ color: STATUS_COLORS[status] ?? "#5B5A4E" }}>
        {STATUS_LABELS[status] ?? status}
      </span>
      {note && <span className="text-[#5B5A4E] leading-relaxed">{note}</span>}
    </div>
  );
}

function ReasoningBlock({ label, reasoning }: { label: string; reasoning: Reasoning }) {
  return (
    <div className="border-t border-dotted border-[#D6CDB4] pt-3 mt-3">
      <StatusRow label={label} status={reasoning.status} />
      <p className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] mt-2.5 mb-1">Is there more to say?</p>
      <p className="font-mono text-xs text-[#2A2F27] leading-relaxed m-0">{reasoning.sufficiency_statement}</p>
      <p className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] mt-2.5 mb-1">Something to consider</p>
      <p className="font-mono text-xs text-[#2A2F27] leading-relaxed italic m-0">{reasoning.socratic_prompt}</p>
    </div>
  );
}

function FramingRows({ multiplicity, epistemic }: { multiplicity: Multiplicity; epistemic: EpistemicFraming }) {
  return (
    <div className="space-y-2 mt-3">
      <StatusRow label="Alternative readings" status={multiplicity.status} note={multiplicity.note} />
      <StatusRow label="Epistemic framing" status={epistemic.status} note={epistemic.note} />
    </div>
  );
}

function Disclaimer() {
  return <p className="font-mono text-[11px] text-[#8A8A80] leading-relaxed mt-3 mb-0 border-t border-dotted border-[#D6CDB4] pt-2">{FORMATIVE_DISCLAIMER}</p>;
}

function DataTypeFeedbackPanel({ feedback }: { feedback: DataTypeFeedback }) {
  return (
    <div className="bg-[#F4EFE1] border border-[#A6764A] px-4 py-3.5 mt-3">
      <span className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] block mb-2.5">Checkpoint feedback</span>
      <div className="space-y-2">
        <StatusRow label="Parenthetical citation" status={feedback.citation.parenthetical} />
        <StatusRow label="Narrative citation" status={feedback.citation.narrative} />
        <StatusRow label="Full reference" status={feedback.citation.bibliographic} />
      </div>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mt-2 mb-0">{feedback.citation.note}</p>
      <div className="mt-3">
        <StatusRow label="Reading of the source" status={feedback.description_accuracy.status} note={feedback.description_accuracy.note} />
      </div>
      <ReasoningBlock label="Interpretation" reasoning={feedback.plausibility_or_reasoning} />
      <FramingRows multiplicity={feedback.multiplicity} epistemic={feedback.epistemic_framing} />
      <Disclaimer />
    </div>
  );
}

function SynthesisFeedbackPanel({ feedback }: { feedback: SynthesisFeedback }) {
  return (
    <div className="bg-[#F4EFE1] border border-[#A6764A] px-4 py-3.5 mt-3">
      <span className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] block mb-2.5">Synthesis feedback</span>
      <StatusRow label="Relationship" status={feedback.relationship.status} note={feedback.relationship.note} />
      <ReasoningBlock label="Reasoning" reasoning={feedback.plausibility_or_reasoning} />
      <FramingRows multiplicity={feedback.multiplicity} epistemic={feedback.epistemic_framing} />
      <Disclaimer />
    </div>
  );
}

function SwitchStudentLink({ studentName }: { studentName: string }) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  return (
    <p className="font-mono text-[11px] text-[#8A8A80] mb-4 mt-0">
      Answering as <span className="text-[#2A2F27]">{studentName}</span> &mdash;{" "}
      <button
        onClick={async () => {
          setSwitching(true);
          await fetch("/api/students/forget", { method: "POST" });
          router.refresh();
        }}
        disabled={switching}
        className="underline bg-transparent border-none p-0 text-[#8A8A80] cursor-pointer disabled:opacity-50"
      >
        not you?
      </button>
    </p>
  );
}

async function postAction(body: object): Promise<{ draft?: Cw2Draft; error?: string }> {
  try {
    const res = await fetch("/api/quiz/mock-cw2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Something went wrong." };
    return { draft: data.draft };
  } catch {
    return { error: "Couldn't reach the server. Check your connection and try again." };
  }
}

const FIELD = "w-full font-mono text-[13px] text-[#2A2F27] bg-[#F4EFE1] border border-[#D6CDB4] px-3 py-2 mb-2.5";
const LABEL = "font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] block mb-1";
const HELP = "font-mono text-[11px] text-[#8A8A80] leading-relaxed mt-0 mb-1.5";
const BUTTON = "font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-4 py-2 border border-[#2A2F27] disabled:opacity-50";

function SelectionStep({ selectedIds, onSaved }: { selectedIds: string[]; onSaved: (draft: Cw2Draft) => void }) {
  const [checked, setChecked] = useState<Set<string>>(new Set(selectedIds));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const dirty = checked.size !== selectedIds.length || [...checked].some((id) => !selectedIds.includes(id));
  const valid = checked.size === 3 && checked.has("statistical");

  const save = async () => {
    setSaving(true);
    setError(null);
    const { draft, error: err } = await postAction({ action: "select", itemIds: [...checked] });
    if (err) setError(err);
    if (draft) onSaved(draft);
    setSaving(false);
  };

  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3.5 mb-3">
      <h4 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1.5 mt-0">Choose your three data types</h4>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-3 mt-0">
        Pick three of the four. As in the real assignment, one of them must be the statistical data.
      </p>
      <div className="space-y-1.5 mb-3">
        {CW2_ITEMS.map((item) => (
          <label key={item.id} className="flex items-start gap-2 font-mono text-[13px] text-[#2A2F27] cursor-pointer">
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={() => toggle(item.id)}
              disabled={!checked.has(item.id) && checked.size >= 3}
              className="mt-1"
            />
            <span>{item.kind}</span>
          </label>
        ))}
      </div>
      <button onClick={save} disabled={!valid || !dirty || saving} className={BUTTON}>
        {saving ? "SAVING…" : selectedIds.length === 3 ? "CHANGE SELECTION" : "SAVE SELECTION"}
      </button>
      {error && <p className="font-mono text-xs text-[#8B3226] mt-2.5 mb-0">{error}</p>}
    </div>
  );
}

function ItemCard({
  item,
  step,
  response,
  capReached,
  onSaved,
}: {
  item: Cw2Item;
  step: number;
  response: Cw2Draft["responses"][string] | undefined;
  capReached: boolean;
  onSaved: (draft: Cw2Draft) => void;
}) {
  const [parenthetical, setParenthetical] = useState(response?.parenthetical ?? "");
  const [narrative, setNarrative] = useState(response?.narrative ?? "");
  const [reference, setReference] = useState(response?.reference ?? "");
  const [description, setDescription] = useState(response?.description ?? "");
  const [interpretation, setInterpretation] = useState(response?.interpretation ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = [parenthetical, narrative, reference, description, interpretation].every((v) => v.trim());

  const submit = async () => {
    if (!complete || loading || capReached) return;
    setLoading(true);
    setError(null);
    const { draft, error: err } = await postAction({
      action: "item",
      itemId: item.id,
      parenthetical,
      narrative,
      reference,
      description,
      interpretation,
    });
    if (err) setError(err);
    if (draft) onSaved(draft);
    setLoading(false);
  };

  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3.5 mb-3">
      <h4 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1 mt-0">Data type {step} of 3 — {item.kind.replace(" data", "").toLowerCase()}</h4>
      <p className="font-mono text-[11px] text-[#A6764A] mb-2 mt-0">{item.sourceLine}</p>
      <blockquote className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-4 mt-0 mx-0 pl-3 border-l-2 border-[#A6764A] whitespace-pre-line">
        {item.content}
      </blockquote>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.kind} className="max-w-full border border-[#A6764A] mb-4" />
      )}

      <label className={LABEL}>In-text citation — parenthetical form</label>
      <p className={HELP}>e.g. &ldquo;{item.citationExamples.parenthetical}&rdquo;</p>
      <input value={parenthetical} onChange={(e) => setParenthetical(e.target.value)} className={FIELD} />

      <label className={LABEL}>In-text citation — narrative form (source as grammatical subject)</label>
      <p className={HELP}>e.g. &ldquo;{item.citationExamples.narrative}&rdquo;</p>
      <input value={narrative} onChange={(e) => setNarrative(e.target.value)} className={FIELD} />

      <label className={LABEL}>Bibliographic reference — full Harvard reference</label>
      <input value={reference} onChange={(e) => setReference(e.target.value)} className={FIELD} />

      <label className={LABEL}>What is this data saying?</label>
      <p className={HELP}>{item.descriptionPrompt}</p>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={`${FIELD} resize-y`} />

      <label className={LABEL}>What could explain this, and how does it connect to the wider social world?</label>
      <p className={HELP}>{item.interpretationPrompt}</p>
      <textarea value={interpretation} onChange={(e) => setInterpretation(e.target.value)} rows={4} className={`${FIELD} resize-y`} />

      <button onClick={submit} disabled={loading || !complete || capReached} className={BUTTON}>
        {loading ? "CHECKING…" : response?.feedback ? "CHECK AGAIN" : "CHECK THIS DATA TYPE"}
      </button>
      {error && <p className="font-mono text-xs text-[#8B3226] mt-2.5 mb-0">{error}</p>}
      {response?.feedback && <DataTypeFeedbackPanel feedback={response.feedback} />}
    </div>
  );
}

function SynthesisStep({
  synthesis,
  feedback,
  capReached,
  onSaved,
}: {
  synthesis: Cw2Draft["synthesis"];
  feedback: SynthesisFeedback | null;
  capReached: boolean;
  onSaved: (draft: Cw2Draft) => void;
}) {
  const [relationship, setRelationship] = useState(synthesis?.relationship ?? "");
  const [argument, setArgument] = useState(synthesis?.argument ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = relationship.trim() && argument.trim();

  const submit = async () => {
    if (!complete || loading || capReached) return;
    setLoading(true);
    setError(null);
    const { draft, error: err } = await postAction({ action: "synthesis", relationship, argument });
    if (err) setError(err);
    if (draft) onSaved(draft);
    setLoading(false);
  };

  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3.5 mb-3">
      <h4 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1 mt-0">Synthesis</h4>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-3 mt-0">{SYNTHESIS_PROMPTS.intro}</p>

      <label className={LABEL}>How do your sources relate to each other?</label>
      <p className={HELP}>{SYNTHESIS_PROMPTS.relationship.replace(/^How do your sources relate to each other\?\s*/, "")}</p>
      <textarea value={relationship} onChange={(e) => setRelationship(e.target.value)} rows={5} className={`${FIELD} resize-y`} />

      <label className={LABEL}>What&apos;s your argument about the broader picture?</label>
      <p className={HELP}>{SYNTHESIS_PROMPTS.argument.replace(/^What's your argument about the broader picture\?\s*/, "")}</p>
      <textarea value={argument} onChange={(e) => setArgument(e.target.value)} rows={6} className={`${FIELD} resize-y`} />

      <p className={`${HELP} italic`}>{SYNTHESIS_PROMPTS.note}</p>

      <button onClick={submit} disabled={loading || !complete || capReached} className={BUTTON}>
        {loading ? "CHECKING…" : feedback ? "CHECK AGAIN" : "CHECK MY SYNTHESIS"}
      </button>
      {error && <p className="font-mono text-xs text-[#8B3226] mt-2.5 mb-0">{error}</p>}
      {feedback && <SynthesisFeedbackPanel feedback={feedback} />}
    </div>
  );
}

export default function MockCw2Practice({ initialDraft, studentName }: { initialDraft: Cw2Draft; studentName: string }) {
  const [draft, setDraft] = useState(initialDraft);

  // The student's three, in catalog order.
  const chosen = CW2_ITEMS.filter((item) => draft.selectedItemIds.includes(item.id));
  const done = (index: number) => !!draft.responses[chosen[index].id]?.feedback;
  const allDone = chosen.length === 3 && chosen.every((_, i) => done(i));
  const checksLeft = Math.max(0, DAILY_CHECK_CAP - draft.checksUsedToday);
  const capReached = checksLeft === 0;

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[#F4EFE1] border border-[#A6764A] px-3 py-2 mb-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-[#A6764A] m-0">Formative practice only</p>
        <p className="font-mono text-[11px] text-[#2A2F27] leading-relaxed m-0 mt-0.5">
          {FORMATIVE_DISCLAIMER} It is never seen by whoever marks your real submission.
        </p>
      </div>

      <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0 border-b border-[#A6764A55] pb-4">
        A practice run of the real CW2 assignment, in stages: three data types of your choice, each with a checkpoint, then a
        synthesis. Your work is saved, so you can leave and come back. You have{" "}
        <span className="text-[#2A2F27]">{checksLeft}</span> of {DAILY_CHECK_CAP} feedback checks left today.
      </p>
      <SwitchStudentLink studentName={studentName} />

      <SelectionStep key={draft.selectedItemIds.join(",")} selectedIds={draft.selectedItemIds} onSaved={setDraft} />

      {chosen.map((item, i) =>
        i === 0 || done(i - 1) ? (
          <ItemCard key={item.id} item={item} step={i + 1} response={draft.responses[item.id]} capReached={capReached} onSaved={setDraft} />
        ) : null
      )}

      {allDone ? (
        <SynthesisStep synthesis={draft.synthesis} feedback={draft.synthesisFeedback} capReached={capReached} onSaved={setDraft} />
      ) : (
        <p className="font-mono text-xs text-[#8A8A80] mt-1 mb-0">
          Choose your three data types, then complete and check each in order; the synthesis unlocks after the third.
        </p>
      )}
    </div>
  );
}
