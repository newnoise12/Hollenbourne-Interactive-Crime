import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { EVIDENCE, CASE_META, SUSPECT_META, type EvidenceItem, type CaseName } from "@/lib/evidence-catalog";
import { EVIDENCE_GROUP_META, getActionItem } from "@/lib/actions-catalog";

// Instructor-only, read-only: every exhibit exactly as a team would read it,
// regardless of whether any team has unlocked it — so the whole case file can
// be proofread without playing through the game. Nothing here touches any
// team's progress.

const CASE_ORDER: CaseName[] = ["general", "mason", "wooley", "porterhouse", "butt"];

function unlockCondition(item: EvidenceItem): string {
  const parts: string[] = [];
  if (item.unlockedByActionId) {
    const action = getActionItem(item.unlockedByActionId);
    parts.push(`unlocked by taking: ${action ? action.label : item.unlockedByActionId}`);
  }
  if (item.unlocksWeek) parts.push(`released in Week ${item.unlocksWeek}`);
  return parts.length ? parts.join(" · ") : "free from the start";
}

export default async function InstructorEvidencePreviewPage() {
  const sessionId = (await cookies()).get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (!(await isValidInstructorSession(sessionId))) {
    redirect("/instructor/login");
  }

  const groups = CASE_ORDER.map((caseName) => ({
    caseName,
    items: EVIDENCE.filter((e) => e.case === caseName),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="flex-1 bg-[#23262B]/80 px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/instructor" className="font-mono text-[11px] text-[#8A8A80] underline">
          &larr; all teams
        </Link>
        <div className="mt-2 mb-6 pb-5 border-b-[3px] border-double border-[#A6764A]">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#A6764A] m-0">Instructor view</p>
          <h1 className="font-serif font-bold text-2xl text-[#E8E1D0] m-0 mt-0.5">Preview all evidence</h1>
          <p className="font-mono text-xs text-[#8A8A80] mb-0 mt-2 max-w-[60ch]">
            Every exhibit, fully unlocked, for checking text and images. Read-only &mdash; this doesn&apos;t unlock anything
            for any team. {EVIDENCE.length} exhibits. Click an exhibit to open it; the line under each title says how a team
            unlocks it.
          </p>
        </div>

        {groups.map(({ caseName, items }) => (
          <section key={caseName} className="mb-8">
            <h2 className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#A6764A] mb-3 mt-0">
              {CASE_META[caseName].label} ({items.length})
            </h2>
            <div className="space-y-2.5">
              {items.map((item) => (
                <details key={item.id} className="bg-[#E8E1D0] border border-[#D6CDB4]">
                  <summary className="cursor-pointer px-4 py-3">
                    <span className="font-mono text-[11px] text-[#5B5A4E] mr-2">{item.exhibit}</span>
                    <span className="font-serif font-semibold text-[14px] text-[#2A2F27]">{item.title}</span>
                    <span className="block font-mono text-[10px] text-[#8A8A80] mt-1">
                      {EVIDENCE_GROUP_META[item.group].label}
                      {item.suspect ? ` · ${SUSPECT_META[item.suspect].label}` : ""} &middot; {unlockCondition(item)}
                      {item.image ? " · has image" : ""}
                    </span>
                  </summary>
                  <div className="px-4 pb-4 pt-1 border-t border-dotted border-[#D6CDB4]">
                    <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mt-2 mb-3">{item.snippet}</p>
                    {item.image && (
                      <figure className="m-0 mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.title} className="max-w-full border border-[#A6764A]" />
                        {item.imageCaption && (
                          <figcaption className="font-mono text-[11px] text-[#5B5A4E] mt-1">{item.imageCaption}</figcaption>
                        )}
                      </figure>
                    )}
                    {(item.body ?? [{ paragraphs: ["(No fuller record on file beyond the summary above.)"] }]).map((section, si) => (
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
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
