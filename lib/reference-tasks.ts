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
    id: "print-book",
    title: "Task 1 — Print book",
    facts:
      "Author: Okafor, R. | Title: Understanding youth justice | Year of publication: 2021 | Edition: 2nd | Publisher: Policy Press",
    correctReference: "Okafor, R. (2021) *Understanding youth justice*. 2nd edn. Policy Press.",
    gradingNote:
      "LSBU's print-book format has NO place of publication — do not require one, and don't mark it down if a student leaves it out. Required: author surname + initial, year in brackets, title (italicised if they've marked it), '2nd edn.' for the edition, then the publisher. Mark access_details and publication_details sensibly: publication_details covers edition + publisher; access_details is not_applicable (it's a print book).",
  },
  {
    id: "journal-article",
    title: "Task 2 — Journal article",
    facts:
      "Authors: Kaur, P. and Whitfield, T. | Year: 2020 | Article title: Neighbourhood policing and public trust | Journal: Journal of Community Safety Research | Volume: 14 | Issue: 3 | Pages: 201–219",
    correctReference:
      "Kaur, P. and Whitfield, T. (2020) 'Neighbourhood policing and public trust', *Journal of Community Safety Research*, 14(3), pp. 201–219.",
    gradingNote:
      "LSBU journal-article format: article title in single quotation marks (not italics), journal title italicised (if they've marked it), then volume(issue), then 'pp.' and the page range. Both authors needed, joined with 'and'. Spacing around 'pp.' and the type of dash used in the page range don't matter. publication_details covers journal title, volume, issue and pages. access_details is not_applicable (no URL or DOI was given).",
  },
  {
    id: "online-news",
    title: "Task 3 — Online news article (reference it as a webpage)",
    facts:
      "Author: Sarah Chen | Website: The Guardian | Year: 2025 | Headline: Rising prison populations and the sentencing debate | URL: https://www.theguardian.com/society/2025/mar/14/rising-prison-populations-and-the-sentencing-debate | Accessed: on a date of your choosing",
    correctReference:
      "Chen, S. (2025) *Rising prison populations and the sentencing debate*. Available at: https://www.theguardian.com/society/2025/mar/14/rising-prison-populations-and-the-sentencing-debate (Accessed: [date]).",
    gradingNote:
      "LSBU's guide has no entry for online newspaper articles (only print newspapers and webpages), so students were deliberately told to use the WEBPAGE format: Author (Year) Title. Available at: URL (Accessed: date). Only the YEAR of publication is needed — do NOT require the day/month, the newspaper's name, or quotation marks around the title, and don't mark the answer down for leaving them out. The access date is the student's own choice (any real-looking date is fine). The URL must be the one given, not a homepage or an invented address. If the student has used the print-newspaper layout instead (title in quotation marks, newspaper name in italics, day and month, 'p.' page number), mark the relevant elements flawed and explain that this task wants the webpage format. publication_details is not_applicable when the webpage format is followed correctly.",
  },
];

export function getReferenceTask(id: string): ReferenceTask | undefined {
  return REFERENCE_TASKS.find((t) => t.id === id);
}
