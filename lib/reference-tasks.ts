// Week 3's Stage 2 — "write your own" referencing practice. Deliberately
// unscored (per Reference/case-content/quizzes/hollenbourne-week3-referencing-quiz.md,
// which marks this stage "unscored automatically — for your own review"):
// this never touches quizAttempts or the trust bonus. What it does have is
// AI-graded structured feedback, per
// Reference/case-content/technical-briefs/hollenbourne-claude-code-referencing-brief.md
// — a practice tool, not a scored activity.
//
// Server-only: looked up per-id inside the API route, never sent to the
// client as a whole catalog, so a student can't read correctReference out
// of the page source before attempting a task.

export type ReferenceTask = {
  id: string;
  title: string;
  // The raw source facts shown to the student, as a plain list.
  facts: string;
  // Guidance for the grading model — a model answer or, where there's no
  // single correct string (an undated source, an internal memo), a
  // description of what a defensible answer looks like instead.
  correctReference: string;
  // Overrides the technical brief's default grading behaviour for sources
  // that don't fit "compare against one fixed correct string."
  gradingNote?: string;
};

export const REFERENCE_TASKS: ReferenceTask[] = [
  {
    id: "newspaper",
    title: "Task 1 — Newspaper article",
    facts:
      "Author: Sarah Chen | Publication: The Guardian | Date: 14 March 2025 | Headline: \"Rising prison populations and the sentencing debate\" | Accessed: online",
    correctReference:
      "Chen, S. (2025) 'Rising prison populations and the sentencing debate', The Guardian, 14 March. Available at: [URL] (Accessed: [date]).",
  },
  {
    id: "undated-website",
    title: "Task 2 — Undated website",
    facts:
      "Author: none named (organisational) | Publisher: Crown Prosecution Service | Title: a UK government page explaining how the Crown Prosecution Service works | Publication date: not given on the page | Accessed: on a date of the student's choosing",
    correctReference:
      "Crown Prosecution Service (no date) [page title]. Available at: [URL] (Accessed: [date]).",
    gradingNote:
      "There is no single correct string here — the student chooses their own access date. Grade the SHAPE of the answer: organisational author (Crown Prosecution Service, not a named individual), 'no date' used honestly in place of a fabricated year, a plausible title, and a genuine 'Available at' / 'Accessed: [some real-looking date]' structure. Do not mark it down for using a different (but real, sensible) access date than any other attempt.",
  },
  {
    id: "book-chapter",
    title: "Task 3 — Chapter in an edited book",
    facts:
      "Chapter author: Okafor, R. | Chapter title: \"Community sentencing in practice\" | Pages: 88–104 | Book editor: Patel-Singh, J. | Book title: Contemporary Approaches to Sentencing | Year: 2022 | Publisher: Palgrave Macmillan | Place: London",
    correctReference:
      "Okafor, R. (2022) 'Community sentencing in practice', in Patel-Singh, J. (ed.) Contemporary Approaches to Sentencing. London: Palgrave Macmillan, pp.88-104.",
    gradingNote:
      "Check specifically that both layers are represented: the chapter (author, year, chapter title in quotation marks, not italics) AND the book it sits inside (the editor marked '(ed.)', the book title italicised, publisher, place, and the page range for the chapter specifically) — a common error is citing only the book, or only the chapter, rather than both.",
  },
];

export function getReferenceTask(id: string): ReferenceTask | undefined {
  return REFERENCE_TASKS.find((t) => t.id === id);
}
