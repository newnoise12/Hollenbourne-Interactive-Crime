import { useState, useEffect } from "react";
import { X, FileText } from "lucide-react";

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=JetBrains+Mono:wght@400;500;700&display=swap');";

const COLORS = {
  bg: "#23262B",
  paper: "#E8E1D0",
  paperEdge: "#D6CDB4",
  cover: "#F4EFE1",
  ink: "#2A2F27",
  inkSoft: "#5B5A4E",
  green: "#2F6B4F",
  red: "#8B3226",
  brass: "#A6764A",
  paperLocked: "#3A3D3E",
};

const TYPE_META = {
  statistical: { label: "Statistical", color: "#3C3489" },
  visual: { label: "Visual", color: "#085041" },
  interview: { label: "Interview", color: "#712B13" },
  documentary: { label: "Documentary", color: "#644421" },
};

const EVIDENCE = [
  {
    id: "ex01",
    exhibit: "EX.01",
    type: "statistical",
    title: "Boresfield incident stats, 2015\u20132025",
    snippet: "Recorded violent incidents by year, with a dip across 2020\u201321.",
    locked: false,
    assisted: true,
    citeType: "report",
    meta: { author: "Kent Police", year: 2024, title: "Annual crime report", place: "Maidstone", publisher: "Kent Police" },
  },
  {
    id: "ex02",
    exhibit: "EX.02",
    type: "visual",
    title: "CCTV still \u2014 woodland car park",
    snippet: "Dark 4x4 parked near the tree line around the time of Mason's death.",
    locked: false,
    assisted: true,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police", year: 2019, title: "CCTV log: woodland car park, 8 October 2019" },
  },
  {
    id: "ex03",
    exhibit: "EX.03",
    type: "interview",
    title: "Neighbour account, Wooley case",
    snippet: "Heavy-set man in a dark puffer jacket, seen entering and leaving the property.",
    locked: false,
    assisted: false,
    citeType: "unpublished",
    meta: { author: "Hollenbourne Police", year: 2022, title: "Interview transcript: neighbour statement, Wooley case" },
    hint: "This is unpublished material, like EX.02 \u2014 the same force logged it. Open the document to see its details.",
  },
  {
    id: "ex04",
    exhibit: "EX.04",
    type: "documentary",
    title: "Internal force memo",
    snippet: "Case prioritisation notes.",
    locked: true,
    unlocksWeek: 8,
  },
  {
    id: "ex05",
    exhibit: "EX.05",
    type: "documentary",
    title: "AI-drafted report vs. transcript",
    snippet: "Comparison worksheet.",
    locked: true,
    unlocksWeek: 5,
  },
  {
    id: "ex06",
    exhibit: "EX.06",
    type: "interview",
    title: "Court transcript excerpt",
    snippet: "Earlier, unrelated case.",
    locked: true,
    unlocksWeek: 9,
  },
];

function redact(text) {
  return text.replace(/[A-Za-z0-9]/g, "\u2588");
}

function normalize(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

// Renders a citation string with a known title substring shown in italics.
// The title is always an exact substring of text (we either built it that way,
// or extracted it from the student's own input) so this never needs guessing.
function renderCited(text, titleSpan) {
  if (!titleSpan) return text;
  const idx = text.indexOf(titleSpan);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <em style={{ fontStyle: "italic" }}>{titleSpan}</em>
      {text.slice(idx + titleSpan.length)}
    </>
  );
}

function checkAssistedFields(fields, item) {
  const author = (fields.author || "").trim();
  const year = (fields.year || "").trim();
  const title = (fields.title || "").trim();
  const place = (fields.place || "").trim();
  const publisher = (fields.publisher || "").trim();
  const meta = item.meta;

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
    if (normalize(place) !== normalize(meta.place)) return "Check the place of publication against the document.";
    if (normalize(publisher) !== normalize(meta.publisher)) return "Check the publisher against the document.";
  }
  return null;
}

function checkFreeText(text, item) {
  const t = text.trim();
  const meta = item.meta;
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

// Best-effort extraction of the title portion from free text, used only to
// drive automatic italics for report-type documents \u2014 never blocks submission.
function extractTitleGuess(text, item) {
  if (item.citeType !== "report") return null;
  const afterYear = text.split(")").slice(1).join(")").trim();
  const cut = afterYear.split(/\.\s+[A-Za-z][^:]*:/)[0];
  return cut.replace(/\.$/, "").trim() || null;
}

function assembleCitation(fields, item) {
  const { author, year, title, place, publisher } = fields;
  let out = `${author} (${year}) ${title}.`;
  if (item.citeType === "report") out += ` ${place}: ${publisher}.`;
  if (item.citeType === "unpublished") out += ` [Unpublished].`;
  return out;
}

function StampBadge({ verified }) {
  return (
    <span
      key={verified ? "verified" : "inadmissible"}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 1,
        color: verified ? COLORS.green : COLORS.red,
        border: `2px solid ${verified ? COLORS.green : COLORS.red}`,
        padding: "3px 10px",
        transform: "rotate(-3deg)",
        display: "inline-block",
        animation: "stampIn 0.25s ease-out",
      }}
    >
      {verified ? "VERIFIED" : "INADMISSIBLE"}
    </span>
  );
}

function DocumentThumbnail({ item, onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: COLORS.cover, border: `1px solid ${COLORS.brass}`,
        padding: "10px 14px", marginBottom: 14, cursor: "pointer",
        width: "100%", textAlign: "left",
      }}
      aria-label={`View document: ${item.title}`}
    >
      <div style={{
        width: 34, height: 44, background: "#FBF8F0", border: `1px solid ${COLORS.paperEdge}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <FileText size={16} color={COLORS.brass} aria-hidden="true" />
      </div>
      <div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.ink, margin: 0 }}>
          View document
        </p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.inkSoft, margin: "2px 0 0" }}>
          Full details, enlarged
        </p>
      </div>
    </button>
  );
}

function DocumentModal({ item, onClose }) {
  const m = item.meta;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(20,18,14,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.cover, border: `1px solid ${COLORS.brass}`,
          padding: "36px 40px", maxWidth: 440, width: "100%", position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close document"
          style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: "none", cursor: "pointer", color: COLORS.inkSoft }}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <span style={{
          position: "absolute", top: 30, left: -6, transform: "rotate(-8deg)",
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 11, letterSpacing: 1,
          color: COLORS.red, border: `2px solid ${COLORS.red}`, padding: "2px 8px",
        }}>
          EVIDENCE
        </span>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.inkSoft, textAlign: "center", margin: "0 0 18px" }}>
          {item.exhibit}
        </p>

        <div style={{ textAlign: "center", borderBottom: `2px solid ${COLORS.brass}`, paddingBottom: 14, marginBottom: 18 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: COLORS.inkSoft, margin: "0 0 6px" }}>
            case document
          </p>
          <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 20, color: COLORS.ink, margin: 0 }}>
            {m.author}
          </p>
        </div>

        <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, fontStyle: "italic", color: COLORS.ink, textAlign: "center", margin: "0 0 22px" }}>
          {m.title}
        </p>

        <table style={{ width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.ink, borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ color: COLORS.inkSoft, padding: "6px 0", borderTop: `1px dotted ${COLORS.brass}` }}>Document type</td>
              <td style={{ textAlign: "right", padding: "6px 0", borderTop: `1px dotted ${COLORS.brass}` }}>
                {item.citeType === "report" ? "Published report" : "Unpublished force record"}
              </td>
            </tr>
            <tr>
              <td style={{ color: COLORS.inkSoft, padding: "6px 0", borderTop: `1px dotted ${COLORS.brass}` }}>
                {item.citeType === "report" ? "Year published" : "Year recorded"}
              </td>
              <td style={{ textAlign: "right", padding: "6px 0", borderTop: `1px dotted ${COLORS.brass}` }}>{m.year}</td>
            </tr>
            {item.citeType === "report" && (
              <>
                <tr>
                  <td style={{ color: COLORS.inkSoft, padding: "6px 0", borderTop: `1px dotted ${COLORS.brass}` }}>Place of publication</td>
                  <td style={{ textAlign: "right", padding: "6px 0", borderTop: `1px dotted ${COLORS.brass}` }}>{m.place}</td>
                </tr>
                <tr>
                  <td style={{ color: COLORS.inkSoft, padding: "6px 0", borderTop: `1px dotted ${COLORS.brass}` }}>Publisher</td>
                  <td style={{ textAlign: "right", padding: "6px 0", borderTop: `1px dotted ${COLORS.brass}` }}>{m.publisher}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontStyle: "italic", color: COLORS.inkSoft, textAlign: "center", margin: "22px 0 0" }}>
          Use these details to reference this document.
        </p>
      </div>
    </div>
  );
}

function FieldRow({ label, value, onChange, width, italic }) {
  return (
    <div style={{ flex: width || "1 1 140px" }}>
      <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COLORS.inkSoft, display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          fontFamily: "'JetBrains Mono', monospace",
          fontStyle: italic ? "italic" : "normal",
          fontSize: 13,
          background: "#FBF8F0",
          border: `1px solid ${COLORS.paperEdge}`,
          padding: "7px 9px",
          color: COLORS.ink,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function ExhibitCard({ item, citation, onCite }) {
  const [fields, setFields] = useState({ author: "", year: "", title: "", place: "", publisher: "" });
  const [freeText, setFreeText] = useState("");
  const [message, setMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const meta = TYPE_META[item.type];
  const isCited = !!citation;

  const setField = (key) => (e) => setFields({ ...fields, [key]: e.target.value });

  const submitAssisted = () => {
    const err = checkAssistedFields(fields, item);
    if (err) { setMessage(err); return; }
    setMessage(null);
    const text = assembleCitation(fields, item);
    const titleSpan = item.citeType === "report" ? fields.title.trim() : null;
    onCite(item.id, { text, title: titleSpan });
  };

  const submitFreeText = () => {
    const err = checkFreeText(freeText, item);
    if (err) { setMessage(err); return; }
    setMessage(null);
    const text = freeText.trim();
    const titleSpan = extractTitleGuess(text, item);
    onCite(item.id, { text, title: titleSpan });
  };

  const showItalicHint = item.citeType === "report";

  if (item.locked) {
    return (
      <div style={{
        background: COLORS.paperLocked, border: `1px dashed ${COLORS.brass}55`,
        padding: "18px 20px", marginBottom: 18, opacity: 0.75,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.brass, letterSpacing: 1 }}>{item.exhibit}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8A8A80", border: "1px solid #55554E", padding: "2px 8px" }}>LOCKED</span>
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#6E6D64", letterSpacing: 2, margin: "0 0 8px" }}>{redact(item.title)}</p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#8A8A80", margin: 0 }}>Unlocks in week {item.unlocksWeek}</p>
      </div>
    );
  }

  return (
    <div style={{
      background: COLORS.paper, border: `1px solid ${COLORS.paperEdge}`,
      borderLeft: `4px solid ${isCited ? COLORS.green : COLORS.red}`,
      padding: "18px 20px", marginBottom: 18,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.inkSoft, letterSpacing: 1 }}>{item.exhibit}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: meta.color }}>{meta.label}</span>
        </div>
        <StampBadge verified={isCited} />
      </div>

      <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 18, color: COLORS.ink, margin: "0 0 12px" }}>
        {item.title}
      </h3>

      {isCited ? (
        <>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>
            {item.snippet}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: "transparent", border: "none", color: COLORS.brass, cursor: "pointer", textDecoration: "underline", padding: 0, marginBottom: 10 }}
          >
            view document
          </button>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.green, margin: 0, borderTop: `1px dotted ${COLORS.paperEdge}`, paddingTop: 10 }}>
            cited: {renderCited(citation.text, citation.title)}
          </p>
        </>
      ) : item.assisted ? (
        <>
          <DocumentThumbnail item={item} onOpen={() => setModalOpen(true)} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <FieldRow label="author / organisation" value={fields.author} onChange={setField("author")} width="1 1 100%" />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <FieldRow label="year" value={fields.year} onChange={setField("year")} width="0 1 80px" />
            <FieldRow label="title" value={fields.title} onChange={setField("title")} width="1 1 220px" italic={showItalicHint} />
          </div>
          {showItalicHint && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COLORS.inkSoft, margin: "0 0 8px" }}>
              Report titles display in italics automatically \u2014 just type it normally.
            </p>
          )}
          {item.citeType === "report" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <FieldRow label="place" value={fields.place} onChange={setField("place")} />
              <FieldRow label="publisher" value={fields.publisher} onChange={setField("publisher")} />
            </div>
          )}
          <button onClick={submitAssisted} style={btnStyle}>CITE</button>
          {message && <p style={errStyle}>{message}</p>}
        </>
      ) : (
        <>
          <DocumentThumbnail item={item} onOpen={() => setModalOpen(true)} />
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>
            {item.hint}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text" value={freeText} onChange={(e) => setFreeText(e.target.value)}
              placeholder="Assemble the full citation yourself"
              style={{ flex: "1 1 240px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: "#FBF8F0", border: `1px solid ${COLORS.paperEdge}`, padding: "8px 10px", color: COLORS.ink, outline: "none" }}
            />
            <button onClick={submitFreeText} style={btnStyle}>CITE</button>
          </div>
          {message && <p style={errStyle}>{message}</p>}
        </>
      )}

      {modalOpen && <DocumentModal item={item} onClose={() => setModalOpen(false)} />}
    </div>
  );
}

const btnStyle = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1,
  background: "transparent", border: `1px solid ${COLORS.ink}`, color: COLORS.ink,
  padding: "8px 16px", cursor: "pointer",
};
const errStyle = { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.red, margin: "8px 0 0" };

export default function EvidenceBoard() {
  const [citations, setCitations] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("hollenbourne-citations");
        if (result && result.value) setCitations(JSON.parse(result.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const handleCite = async (id, payload) => {
    const next = { ...citations, [id]: payload };
    setCitations(next);
    try {
      const result = await window.storage.set("hollenbourne-citations", JSON.stringify(next));
      if (!result) setSaveError(true);
    } catch (e) { setSaveError(true); }
  };

  const handleReset = async () => {
    setCitations({});
    try { await window.storage.delete("hollenbourne-citations"); } catch (e) {}
  };

  const unlockedCount = EVIDENCE.filter((e) => !e.locked).length;
  const citedCount = Object.keys(citations).length;

  if (!loaded) {
    return (
      <div style={{ background: COLORS.bg, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.paper, fontSize: 13 }}>Loading case log\u2026</p>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100%", padding: "32px 24px" }}>
      <style>{FONT_IMPORT}{`
        @keyframes stampIn { 0% { transform: scale(1.5) rotate(-3deg); opacity: 0; } 100% { transform: scale(1) rotate(-3deg); opacity: 1; } }
        input::placeholder { color: #A8A08A; }
      `}</style>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 26, color: COLORS.paper, margin: 0 }}>
            Hollenbourne case log
          </h1>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.brass }}>
            {citedCount} of {unlockedCount} accessed
          </span>
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#8A8A80", margin: "0 0 24px", borderBottom: `1px solid ${COLORS.brass}55`, paddingBottom: 16 }}>
          Evidentiary register &mdash; Boresfield review. Open each document, then cite it correctly to unlock it.
        </p>
        {EVIDENCE.map((item) => (
          <ExhibitCard key={item.id} item={item} citation={citations[item.id]} onCite={handleCite} />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          {saveError ? <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.red }}>Couldn't save &mdash; changes may not persist.</span> : <span />}
          <button onClick={handleReset} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: "transparent", border: "none", color: "#6E6D64", cursor: "pointer", textDecoration: "underline" }}>
            reset board
          </button>
        </div>
      </div>
    </div>
  );
}
