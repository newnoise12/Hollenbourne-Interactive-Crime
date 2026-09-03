import { useState, useEffect } from "react";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

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
};

const CATEGORY_META = {
  interview: { label: "Interview", color: "#712B13" },
  forensic: { label: "Forensic", color: "#8B3226" },
  documentary: { label: "Documentary", color: "#644421" },
  visual: { label: "Visual", color: "#085041" },
  witness: { label: "Witness", color: "#3C3489" },
};

const BASELINE_ACTIONS = 2;
const MAX_WEEK = 11;

const ACTIONS = [
  {
    id: "reint-wooley",
    category: "interview",
    label: "Re-interview Nigel Wooley",
    description: "Already flagged in the original investigation. Press on his account of the evening.",
    cost: 1,
    outcome: "He repeats his account of being home. Phone data still places him there \u2014 but he doesn't mention the dog, or the car park.",
  },
  {
    id: "reint-swayne",
    category: "interview",
    label: "Re-interview Colin Swayne",
    description: "Known to police already. Follow up on his movements around Porterhouse's death.",
    cost: 1,
    outcome: "Swayne grows agitated when asked about county lines, but offers nothing new about the night Porterhouse died.",
  },
  {
    id: "reint-haddad",
    category: "interview",
    label: "Re-interview Khalid Haddad",
    description: "Cleared of suspicion early on. Reopening this line goes against the existing file.",
    cost: 2,
    outcome: "Haddad mentions, almost in passing, a dark 4x4 idling near the woods some months back. Nobody asked him about it before.",
  },
  {
    id: "reint-burgess",
    category: "interview",
    label: "Re-interview Martin Burgess",
    description: "Never treated as a suspect. Pursuing him means working outside where the investigation has already looked.",
    cost: 2,
    outcome: "Burgess is polite, professional, and entirely unbothered. He confirms two boiler jobs near Boresfield that week \u2014 nothing more.",
  },
  {
    id: "forensic-dna",
    category: "forensic",
    label: "Retest DNA \u2014 Wooley scene",
    description: "Establish whether recovered DNA can be dated to the day of her death.",
    cost: 2,
    outcome: "The lab confirms the DNA is present but cannot date it \u2014 consistent with historic contact, not necessarily the day itself.",
  },
  {
    id: "forensic-vehicle",
    category: "forensic",
    label: "Run a vehicle check \u2014 dark 4x4",
    description: "Cross-reference DVLA records against sightings near the woodland car park.",
    cost: 2,
    outcome: "DVLA records return a vehicle registered to an elderly woman in Dartford \u2014 no obvious link to anyone on file.",
  },
  {
    id: "cctv-marsh",
    category: "visual",
    label: "Chase CCTV \u2014 Hollen Marsh car park",
    description: "Pull available footage from the period around Mason's death.",
    cost: 1,
    outcome: "Footage from the car park is partial. A dark 4x4 is visible arriving and leaving within the estimated window.",
  },
  {
    id: "phone-data",
    category: "documentary",
    label: "Pull phone data",
    description: "Request historic cell tower records for a named individual.",
    cost: 1,
    outcome: "Location data places the requested individual in the area \u2014 consistent with routine movement, not proof of anything.",
  },
  {
    id: "doc-memo",
    category: "documentary",
    label: "Pull the case-prioritisation memo",
    description: "Request the internal paperwork behind the original investigation's resourcing decisions.",
    cost: 2,
    outcome: "The memo shows Mason's case was deprioritised within a week, before any vehicle check was ever requested.",
  },
  {
    id: "canvas",
    category: "witness",
    label: "Witness canvas \u2014 Boresfield / Featherton",
    description: "Door-to-door follow-up for anyone who saw something unreported at the time.",
    cost: 1,
    outcome: "A resident recalls \u2018a big bloke in a puffer coat\u2019 near the tenements \u2014 vague, but consistent with earlier descriptions.",
  },
];

const STORAGE_KEY = "hollenbourne-actions";

function defaultState() {
  return { week: 1, trustBonus: {}, spent: {}, log: [] };
}

function Pips({ total, used }) {
  const pips = [];
  for (let i = 0; i < total; i++) {
    pips.push(
      <span
        key={i}
        style={{
          width: 12, height: 12, borderRadius: "50%",
          background: i < used ? COLORS.red : "transparent",
          border: `1.5px solid ${i < used ? COLORS.red : COLORS.brass}`,
          display: "inline-block",
        }}
      />
    );
  }
  return <div style={{ display: "flex", gap: 6 }}>{pips}</div>;
}

function ActionCard({ action, canAfford, onTake }) {
  const meta = CATEGORY_META[action.category];
  return (
    <div style={{
      background: COLORS.paper, border: `1px solid ${COLORS.paperEdge}`,
      borderLeft: `4px solid ${meta.color}`, padding: "14px 16px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: meta.color }}>{meta.label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.inkSoft, border: `1px solid ${COLORS.paperEdge}`, padding: "1px 8px" }}>
          cost: {action.cost}
        </span>
      </div>
      <h4 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 15, color: COLORS.ink, margin: "0 0 4px" }}>
        {action.label}
      </h4>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>
        {action.description}
      </p>
      <button
        onClick={onTake}
        disabled={!canAfford}
        style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 1,
          background: "transparent", border: `1px solid ${canAfford ? COLORS.ink : COLORS.paperEdge}`,
          color: canAfford ? COLORS.ink : COLORS.paperEdge,
          padding: "6px 14px", cursor: canAfford ? "pointer" : "not-allowed",
        }}
      >
        {canAfford ? "TAKE ACTION" : "NOT ENOUGH ACTIONS"}
      </button>
    </div>
  );
}

export default function ActionEconomy() {
  const [state, setState] = useState(defaultState());
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) setState(JSON.parse(result.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const persist = async (next) => {
    setState(next);
    try {
      const result = await window.storage.set(STORAGE_KEY, JSON.stringify(next));
      if (!result) setSaveError(true);
    } catch (e) { setSaveError(true); }
  };

  if (!loaded) {
    return (
      <div style={{ background: COLORS.bg, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.paper, fontSize: 13 }}>Loading investigation record\u2026</p>
      </div>
    );
  }

  const week = state.week;
  const trustBonus = state.trustBonus[week] || 0;
  const spentThisWeek = state.spent[week] || 0;
  const totalAvailable = BASELINE_ACTIONS + trustBonus;
  const remaining = totalAvailable - spentThisWeek;

  const changeWeek = (delta) => {
    const nextWeek = Math.min(MAX_WEEK, Math.max(1, week + delta));
    persist({ ...state, week: nextWeek });
  };

  const changeTrust = (delta) => {
    const current = state.trustBonus[week] || 0;
    const next = Math.min(3, Math.max(0, current + delta));
    persist({ ...state, trustBonus: { ...state.trustBonus, [week]: next } });
  };

  const takeAction = (action) => {
    if (remaining < action.cost) return;
    const nextSpent = { ...state.spent, [week]: spentThisWeek + action.cost };
    const nextLog = [{ week, actionId: action.id, label: action.label, outcome: action.outcome }, ...state.log];
    persist({ ...state, spent: nextSpent, log: nextLog });
  };

  const resetAll = () => persist(defaultState());

  return (
    <div style={{ background: COLORS.bg, minHeight: "100%", padding: "32px 24px" }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 26, color: COLORS.paper, margin: "0 0 6px" }}>
          Investigation resources
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#8A8A80", margin: "0 0 24px", borderBottom: `1px solid ${COLORS.brass}55`, paddingBottom: 16 }}>
          Boresfield review &mdash; allocate your team's actions each week.
        </p>

        <div style={{ background: COLORS.cover, border: `1px solid ${COLORS.brass}`, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => changeWeek(-1)} disabled={week <= 1} aria-label="Previous week" style={iconBtnStyle(week <= 1)}>
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 18, color: COLORS.ink, minWidth: 70, textAlign: "center" }}>
                Week {week}
              </span>
              <button onClick={() => changeWeek(1)} disabled={week >= MAX_WEEK} aria-label="Next week" style={iconBtnStyle(week >= MAX_WEEK)}>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.inkSoft }}>
              Trust bonus this week (from the institutional insight task)
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => changeTrust(-1)} disabled={trustBonus <= 0} aria-label="Decrease trust bonus" style={iconBtnStyle(trustBonus <= 0)}>
                <Minus size={14} aria-hidden="true" />
              </button>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.ink, minWidth: 16, textAlign: "center" }}>+{trustBonus}</span>
              <button onClick={() => changeTrust(1)} disabled={trustBonus >= 3} aria-label="Increase trust bonus" style={iconBtnStyle(trustBonus >= 3)}>
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div style={{ borderTop: `1px dotted ${COLORS.brass}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.inkSoft }}>
              {BASELINE_ACTIONS} baseline + {trustBonus} trust = {totalAvailable} available &middot; {remaining} remaining
            </span>
            <Pips total={totalAvailable} used={spentThisWeek} />
          </div>
        </div>

        {ACTIONS.map((action) => (
          <ActionCard key={action.id} action={action} canAfford={remaining >= action.cost} onTake={() => takeAction(action)} />
        ))}

        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 600, fontSize: 18, color: COLORS.paper, margin: "0 0 12px" }}>
            Case action log
          </h2>
          {state.log.length === 0 ? (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#8A8A80" }}>No actions taken yet.</p>
          ) : (
            state.log.map((entry, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${COLORS.brass}`, paddingLeft: 14, marginBottom: 14 }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.brass, margin: "0 0 3px" }}>
                  Week {entry.week} &middot; {entry.label}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#C9C4B3", lineHeight: 1.5, margin: 0 }}>
                  {entry.outcome}
                </p>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          {saveError && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.red, marginRight: "auto" }}>Couldn't save &mdash; changes may not persist.</span>}
          <button onClick={resetAll} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: "transparent", border: "none", color: "#6E6D64", cursor: "pointer", textDecoration: "underline" }}>
            reset investigation
          </button>
        </div>
      </div>
    </div>
  );
}

function iconBtnStyle(disabled) {
  return {
    background: "transparent", border: `1px solid ${disabled ? COLORS.paperEdge : COLORS.ink}`,
    color: disabled ? COLORS.paperEdge : COLORS.ink, cursor: disabled ? "not-allowed" : "pointer",
    padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
  };
}
