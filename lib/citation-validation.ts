// Citation validation and assembly — ported from reference/evidence-board.jsx.
// Runs client-side (live field feedback in EvidenceBoard) and server-side
// (re-validation in app/api/evidence/route.ts before writing to the DB).

import type { EvidenceItem } from "./evidence-catalog";

export function redact(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, "█");
}

export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export type AssistedFields = {
  author: string;
  year: string;
  title: string;
  place: string;
  publisher: string;
};

/** Field-level validation for the assisted-citation path. Requires item.meta. */
export function checkAssistedFields(fields: AssistedFields, item: EvidenceItem): string | null {
  const author = (fields.author || "").trim();
  const year = (fields.year || "").trim();
  const title = (fields.title || "").trim();
  const place = (fields.place || "").trim();
  const publisher = (fields.publisher || "").trim();
  const meta = item.meta;
  if (!meta) return "This exhibit has no reference document.";

  if (!author) return "Add the author or organisation.";
  if (!/^\d{4}$/.test(year)) return "Year should be four digits, e.g. 2024.";
  if (!title) return "Add the title.";
  if (item.citeType === "report") {
    if (!place) return "Add the place of publication.";
    if (!publisher) return "Add the publisher.";
  }
  if (normalize(author) !== normalize(meta.author)) return "That doesn't match the organisation named on the document.";
  if (year !== String(meta.year)) return "Check the year against the document.";
  if (!normalize(title).includes(normalize(meta.title).slice(0, 12))) return "Check the title against the document.";
  if (item.citeType === "report") {
    if (normalize(place) !== normalize(meta.place ?? "")) return "Check the place of publication against the document.";
    if (normalize(publisher) !== normalize(meta.publisher ?? "")) return "Check the publisher against the document.";
  }
  return null;
}

/**
 * Validates a fully-assembled citation string against the exhibit's reference
 * document. This is the authoritative check: assembleCitation() below always
 * produces text in this same shape, so this single function validates both
 * the assisted-fields path and the free-text path.
 */
export function checkFreeText(text: string, item: EvidenceItem): string | null {
  const t = text.trim();
  const meta = item.meta;
  if (!meta) return "This exhibit has no reference document.";
  if (!t) return "Enter a citation.";
  if (t.charAt(0) === "(") return "Start with the author or organisation, not the year.";
  const yearMatch = t.match(/\((\d{4})\)/);
  if (!yearMatch) return "Add the year in round brackets, e.g. (2022).";
  const authorPart = t.split("(")[0].trim();
  if (!authorPart) return "Add the author or organisation before the year.";
  if (normalize(authorPart) !== normalize(meta.author)) return "Check the author or organisation against the document.";
  if (yearMatch[1] !== String(meta.year)) return "Check the year against the document.";
  const afterYear = t.split(")").slice(1).join(")").trim();
  if (!afterYear) return "Add a title after the year.";
  if (!normalize(afterYear).includes(normalize(meta.title).split(":")[0].slice(0, 10))) return "Check the title against the document.";
  if (item.citeType === "unpublished" && !/\[unpublished/i.test(t)) return "Mark unpublished material with [Unpublished] at the end.";
  if (!/[.\]]\s*$/.test(t)) return "End the citation with a full stop.";
  return null;
}

/**
 * Best-effort extraction of the title portion from free text, used only to
 * drive automatic italics for report-type documents — never blocks submission.
 */
export function extractTitleGuess(text: string, item: EvidenceItem): string | null {
  if (item.citeType !== "report") return null;
  const afterYear = text.split(")").slice(1).join(")").trim();
  const cut = afterYear.split(/\.\s+[A-Za-z][^:]*:/)[0];
  return cut.replace(/\.$/, "").trim() || null;
}

export function assembleCitation(fields: AssistedFields, item: EvidenceItem): string {
  const { author, year, title, place, publisher } = fields;
  let out = `${author} (${year}) ${title}.`;
  if (item.citeType === "report") out += ` ${place}: ${publisher}.`;
  if (item.citeType === "unpublished") out += ` [Unpublished].`;
  return out;
}
