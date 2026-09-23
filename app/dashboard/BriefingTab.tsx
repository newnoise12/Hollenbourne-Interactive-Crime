export default function BriefingTab() {
  return (
    <div>
      <div className="bg-[#F4EFE1] border border-[#A6764A] px-5 py-4.5 mb-5">
        <h3 className="font-serif font-semibold text-lg text-[#2A2F27] mb-2.5 mt-0">How this review works</h3>
        <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mb-2.5 mt-0">
          Four deaths, spread across six years, share the same stretch of Hollen Marsh. Your team&apos;s job is to
          work out whether they&apos;re connected &mdash; and if so, by whom &mdash; using only evidence you actually
          go and get.
        </p>
        <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mb-2.5 mt-0">
          Every student earns <strong>1 action point a week</strong>, plus a 0&ndash;3 trust bonus applied identically
          to the whole team &mdash; set by that week&apos;s institutional-insight quiz, or manually for other weeks.
          Spend points on the <strong>Investigation</strong> tab to request forensic work, re-interviews, and data
          &mdash; each one reveals a real document in the <strong>Case Log</strong> for the whole team to read and
          cite. Two unspent points can be banked into your team&apos;s shared case reserve, spendable by anyone,
          any week.
        </p>
        <p className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed mb-0 mt-0">
          Cited exhibits can be pinned to the <strong>Case Log</strong>&apos;s corkboard and connected to build out
          your team&apos;s theory of the case visually. The endgame &mdash; an arrest interview &mdash; is offline and
          hand-graded by your tutor at the end of term: who you charge, and whether the evidence you actually
          gathered supports it.
        </p>
      </div>

      <div className="bg-[#E8E1D0] border border-[#D6CDB4] px-5 py-4.5">
        <h3 className="font-serif font-semibold text-[15px] text-[#2A2F27] mb-2 mt-0">Where to go</h3>
        <ul className="font-mono text-[13px] text-[#5B5A4E] leading-relaxed pl-4 my-0 space-y-1.5">
          <li><strong>Investigation</strong> &mdash; spend this week&apos;s points, bank into the reserve, review the permanent case log.</li>
          <li><strong>Case Log</strong> &mdash; open and cite evidence exhibits, then pin them to the corkboard.</li>
          <li><strong>Quizzes</strong> &mdash; each week&apos;s institutional-insight activity, scored per student.</li>
        </ul>
      </div>
    </div>
  );
}
