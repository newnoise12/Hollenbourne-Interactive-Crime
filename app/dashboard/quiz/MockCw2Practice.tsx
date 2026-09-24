"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Cw2Draft, ItemFeedback, SynthesisFeedback } from "@/lib/cw2-practice";

// Public-facing subset of lib/cw2-sources.ts's CW2_ITEMS — deliberately
// duplicated rather than imported, since this is a client component and
// importing that module would bundle its server-only correctCitation/
// interpretationGuidance fields (the answer key) into client JS. Same
// precaution ReferencingPractice.tsx already takes with its own local
// TASKS array.
type ItemMeta = { id: string; kind: string; title: string; content: string; image?: string };

const ITEMS: ItemMeta[] = [
  {
    id: "statistical",
    kind: "Statistical data",
    title: "1. Statistical data — Intent to Supply (Class A Drug)",
    content:
      "Sentencing Academy (2026) Intent to Supply (Class A Drug). Data calculated from Ministry of Justice, Criminal Justice Statistics Quarterly: December 2025.\n\nConvictions for intent to supply a Class A drug have almost doubled over the last ten years, from under 6,000 in 2015 to over 10,500 in 2025. Of these convictions, 70% resulted in a term of immediate imprisonment, and a further 26% resulted in a Suspended Sentence Order.",
  },
  {
    id: "visual",
    kind: "Visual data",
    title: "2. Visual data — sentencing outcomes chart",
    content:
      "This chart shows the same sentencing outcomes as the statistical item, presented visually. The \"other disposal\" figure (4%) is inferred from the remainder of the two confirmed figures — it isn't separately broken down in the original source, which is itself worth thinking about when interpreting the chart.",
    image: "/quiz-charts/chart-mock-cw2-sentencing-outcomes.png",
  },
  {
    id: "textual",
    kind: "Textual data",
    title: "3. Textual data — police press release",
    content:
      "Three Wirral men jailed for County Lines drug supply\n\nThree men have been jailed and four women sentenced for their part in a conspiracy to supply drugs that exploited children.\n\nAfter guilty pleas at earlier hearings, three men and three women were sentenced at Liverpool Crown Court. Kieron Platt, 23, was sentenced to nine years in prison for conspiracy to supply Class A, B and C drugs as well as conspiracy to blackmail. Dylan Hamlet, 23, received five years for the same offences. Ben Smith, 22, received 28 months' custody. Abigail Pengelly, 30, received two years suspended for 18 months plus 240 hours' community service. Chloe Mitchell, 19, received 20 months suspended for 18 months plus 200 hours' community service. Millie Piercy, 21, received four months' custody suspended for 12 months plus a rehabilitation order.\n\nThe investigation began after a 16-year-old boy exploited by the group was arrested by officers; telecoms analysis subsequently identified Platt as the person who had involved him in a drugs line supplying cocaine, ketamine, cannabis and nitrous oxide. A senior officer commented that the sentencing \"shows that crime does not pay — it lands you in jail.\"\n\nRead it as a constructed text: notice who is named as an offender and who is described as exploited, even though several of those sentenced are themselves quite young; notice what the closing quote is doing rhetorically; notice what isn't discussed (what happened to the 16-year-old afterwards, for instance, isn't mentioned at all).",
  },
  {
    id: "documentary",
    kind: "Documentary data",
    title: "4. Documentary data — County Lines Programme evaluation",
    content:
      "Home Office (2025) Evaluation of the County Lines Programme (updated) (January 2020 to January 2025).\n\nThis evaluation assesses the impact of the government's County Lines Programme funding. It reports that county lines-flagged National Referral Mechanism (NRM) safeguarding referrals are tracked as a distinct outcome measure alongside law enforcement activity (drug and weapon possession offences) and acquisitive crime. Notably, the evaluation found no statistically significant impact of the Programme on acquisitive crime in either its 2024 or updated 2025 assessment, despite earlier evaluations reporting a reduction in offences in exporting areas.\n\nThis is a more technical, analytical document than the press release above — an evaluation written for policy audiences, weighing evidence about what the programme has and hasn't achieved, rather than reporting a single result.",
  },
];

const STATUS_COLORS: Record<string, string> = {
  correct: "#2F6B4F",
  strong: "#2F6B4F",
  yes: "#2F6B4F",
  flawed: "#A6764A",
  developing: "#A6764A",
  partially: "#A6764A",
  missing: "#8B3226",
  needs_work: "#8B3226",
  no: "#8B3226",
};

const STATUS_LABELS: Record<string, string> = {
  correct: "Correct",
  flawed: "Flawed",
  missing: "Missing",
  strong: "Strong",
  developing: "Developing",
  needs_work: "Needs work",
  yes: "Yes",
  partially: "Partially",
  no: "No",
};

function StatusRow({ label, status, note }: { label: string; status: string; note: string }) {
  return (
    <div className="flex items-start gap-2 font-mono text-xs">
      <span className="min-w-[130px] text-[#2A2F27]">{label}</span>
      <span className="min-w-[95px] font-semibold" style={{ color: STATUS_COLORS[status] ?? "#5B5A4E" }}>
        {STATUS_LABELS[status] ?? status}
      </span>
      <span className="text-[#5B5A4E] leading-relaxed">{note}</span>
    </div>
  );
}

function ItemFeedbackPanel({ feedback }: { feedback: ItemFeedback }) {
  return (
    <div className="bg-[#F4EFE1] border border-[#A6764A] px-4 py-3.5 mt-3">
      <span className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] block mb-2.5">Feedback</span>
      <div className="space-y-2 mb-3">
        <StatusRow label="In-text citation" status={feedback.citation.inText.status} note={feedback.citation.inText.note} />
        <StatusRow label="Full reference" status={feedback.citation.reference.status} note={feedback.citation.reference.note} />
        <StatusRow label="Interpretation" status={feedback.interpretation.status} note={feedback.interpretation.note} />
      </div>
      <p className="font-mono text-xs text-[#2A2F27] leading-relaxed mb-0 mt-0 border-t border-dotted border-[#D6CDB4] pt-2">{feedback.summary}</p>
    </div>
  );
}

function SynthesisFeedbackPanel({ feedback }: { feedback: SynthesisFeedback }) {
  return (
    <div className="bg-[#F4EFE1] border border-[#A6764A] px-4 py-3.5 mt-3">
      <span className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] block mb-2.5">Feedback</span>
      <div className="space-y-2 mb-3">
        <StatusRow label="Engages with tension" status={feedback.engagesWithTension.status} note={feedback.engagesWithTension.note} />
        <StatusRow label="Builds an argument" status={feedback.buildsArgument.status} note={feedback.buildsArgument.note} />
      </div>
      <p className="font-mono text-xs text-[#2A2F27] leading-relaxed mb-0 mt-0 border-t border-dotted border-[#D6CDB4] pt-2">{feedback.summary}</p>
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
      <h4 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1.5 mt-0">Choose 3 of the 4 items</h4>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-3 mt-0">
        Same rule as the real assignment: at least one statistical item. Pick the 3 you&apos;ll work through.
      </p>
      <div className="space-y-1.5 mb-3">
        {ITEMS.map((item) => (
          <label key={item.id} className="flex items-start gap-2 font-mono text-[13px] text-[#2A2F27] cursor-pointer">
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={() => toggle(item.id)}
              disabled={!checked.has(item.id) && checked.size >= 3}
              className="mt-1"
            />
            <span>{item.title.replace(/^\d+\.\s*/, "")}</span>
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={checked.size !== 3 || !dirty || saving}
        className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-4 py-2 border border-[#2A2F27] disabled:opacity-50"
      >
        {saving ? "SAVING…" : "SAVE SELECTION"}
      </button>
      {error && <p className="font-mono text-xs text-[#8B3226] mt-2.5 mb-0">{error}</p>}
    </div>
  );
}

function ItemCard({
  item,
  response,
  onSaved,
}: {
  item: ItemMeta;
  response: Cw2Draft["responses"][string] | undefined;
  onSaved: (draft: Cw2Draft) => void;
}) {
  const [citation, setCitation] = useState(response?.citation ?? "");
  const [reference, setReference] = useState(response?.reference ?? "");
  const [interpretation, setInterpretation] = useState(response?.interpretation ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!citation.trim() || !reference.trim() || !interpretation.trim() || loading) return;
    setLoading(true);
    setError(null);
    const { draft, error: err } = await postAction({ action: "item", itemId: item.id, citation, reference, interpretation });
    if (err) setError(err);
    if (draft) onSaved(draft);
    setLoading(false);
  };

  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3.5 mb-3">
      <h4 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1.5 mt-0">{item.title}</h4>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-3 mt-0 whitespace-pre-line">{item.content}</p>
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.title} className="max-w-full border border-[#A6764A] mb-3" />
      )}
      <label className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] block mb-1">In-text citation</label>
      <input
        value={citation}
        onChange={(e) => setCitation(e.target.value)}
        placeholder="e.g. (Author, Year)"
        className="w-full font-mono text-[13px] text-[#2A2F27] bg-[#F4EFE1] border border-[#D6CDB4] px-3 py-2 mb-2.5"
      />
      <label className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] block mb-1">Full reference</label>
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Write the full Harvard reference here..."
        className="w-full font-mono text-[13px] text-[#2A2F27] bg-[#F4EFE1] border border-[#D6CDB4] px-3 py-2 mb-2.5"
      />
      <label className="font-mono text-[11px] uppercase tracking-wide text-[#5B5A4E] block mb-1">
        What does this show, and how does it relate to broader social trends?
      </label>
      <textarea
        value={interpretation}
        onChange={(e) => setInterpretation(e.target.value)}
        rows={3}
        className="w-full font-mono text-[13px] text-[#2A2F27] bg-[#F4EFE1] border border-[#D6CDB4] px-3 py-2 mb-2.5 resize-y"
      />
      <button
        onClick={submit}
        disabled={loading || !citation.trim() || !reference.trim() || !interpretation.trim()}
        className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-4 py-2 border border-[#2A2F27] disabled:opacity-50"
      >
        {loading ? "CHECKING…" : response?.feedback ? "CHECK AGAIN" : "CHECK THIS ITEM"}
      </button>
      {error && <p className="font-mono text-xs text-[#8B3226] mt-2.5 mb-0">{error}</p>}
      {response?.feedback && <ItemFeedbackPanel feedback={response.feedback} />}
    </div>
  );
}

function SynthesisStep({ synthesis, feedback, onSaved }: { synthesis: string | null; feedback: SynthesisFeedback | null; onSaved: (draft: Cw2Draft) => void }) {
  const [text, setText] = useState(synthesis ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    const { draft, error: err } = await postAction({ action: "synthesis", text });
    if (err) setError(err);
    if (draft) onSaved(draft);
    setLoading(false);
  };

  return (
    <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-4 py-3.5 mb-3">
      <h4 className="font-serif font-semibold text-sm text-[#2A2F27] mb-1.5 mt-0">Synthesis</h4>
      <p className="font-mono text-xs text-[#5B5A4E] leading-relaxed mb-3 mt-0">
        How do the three items interact? Where do they support or complicate the trends you&apos;ve identified? What&apos;s your
        argument about the broader picture?
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Write your synthesis here..."
        className="w-full font-mono text-[13px] text-[#2A2F27] bg-[#F4EFE1] border border-[#D6CDB4] px-3 py-2 mb-2.5 resize-y"
      />
      <button
        onClick={submit}
        disabled={loading || !text.trim()}
        className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-4 py-2 border border-[#2A2F27] disabled:opacity-50"
      >
        {loading ? "CHECKING…" : feedback ? "CHECK AGAIN" : "CHECK MY SYNTHESIS"}
      </button>
      {error && <p className="font-mono text-xs text-[#8B3226] mt-2.5 mb-0">{error}</p>}
      {feedback && <SynthesisFeedbackPanel feedback={feedback} />}
    </div>
  );
}

export default function MockCw2Practice({ initialDraft, studentName }: { initialDraft: Cw2Draft; studentName: string }) {
  const [draft, setDraft] = useState(initialDraft);

  const allItemsDone = draft.selectedItemIds.length === 3 && draft.selectedItemIds.every((id) => draft.responses[id]?.feedback);

  return (
    <div>
      <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0 border-b border-[#A6764A55] pb-4">
        A practice run of the real CW2 assignment — same task shape, different sources. Unassessed: no trust bonus,
        just feedback. Your progress is saved, so you can leave and come back.
      </p>
      <SwitchStudentLink studentName={studentName} />

      <SelectionStep selectedIds={draft.selectedItemIds} onSaved={setDraft} />

      {draft.selectedItemIds.map((id) => {
        const item = ITEMS.find((i) => i.id === id);
        if (!item) return null;
        return <ItemCard key={id} item={item} response={draft.responses[id]} onSaved={setDraft} />;
      })}

      {allItemsDone && <SynthesisStep synthesis={draft.synthesis} feedback={draft.synthesisFeedback} onSaved={setDraft} />}
    </div>
  );
}
