// What ONE team's browser is allowed to know about the case, worked out on the
// server from that team's action log and the module's current week.
//
// This is the gate. The catalogs (actions-catalog.ts, evidence-catalog.ts) hold
// every action's result and every exhibit's full text, so nothing in the browser
// bundle may import them — otherwise a locked document would be sitting in the
// JavaScript (or the page data) for anyone to read by viewing the source. The
// dashboard receives only what this builds:
//   - an enquiry the team can't yet see (further than one step away) is not sent at all;
//   - an enquiry that is waiting is sent as a title, a cost and what it waits on —
//     never its description or result, and unmet prerequisites it can't see are
//     sent as a placeholder, not by name;
//   - an exhibit that is still locked is sent as an empty stub (or not at all, if
//     it belongs to an action the team hasn't taken).
// SERVER-ONLY. scripts/check-client-leak.ts verifies the browser really gets
// nothing more.

import { ACTIONS, type ActionItem } from "./actions-catalog";
import type { ActionCategory, CaseName, EvidenceGroup } from "./actions-meta";
import { EVIDENCE } from "./evidence-catalog";
import { isEvidenceUnlocked, type EvidenceItem } from "./evidence-meta";
import { getEnquiryState, getEnquiryView, getOpensNext } from "./action-graph";

export type OpensNextView =
  | { kind: "available"; id: string; label: string; cost: number; weekGate: number | null }
  | { kind: "waiting"; id: string; label: string; cost: number; stillNeeds: string[] };

export type WaitingOnView = { title: string; met: boolean };

export type EnquiryState = "done" | "available" | "waiting";

export type ClientEnquiry = {
  id: string;
  category: ActionCategory;
  case: CaseName;
  group: EvidenceGroup;
  alsoRelatesTo?: CaseName[];
  label: string;
  cost: number;
  /** The action's own week gate; whether the team has reached it is the browser's call (it has a week picker). */
  availableFromWeek: number | null;
  state: EnquiryState;
  /** Only while available. */
  description?: string;
  /** Only while waiting (one entry per prerequisite). */
  waitingOn: WaitingOnView[];
  /** Only once done. */
  outcome?: string;
  opensNext?: OpensNextView[];
};

/** An exhibit as the browser sees it: full when unlocked, an empty stub when not. */
export type ClientEvidence = EvidenceItem & { unlocked: boolean; opensNext?: OpensNextView[] };

export type TeamView = {
  enquiries: ClientEnquiry[];
  evidence: ClientEvidence[];
  /** Every exhibit that exists, including ones withheld above — for "x of y unlocked". */
  totalEvidence: number;
};

function opensNextFor(actionId: string, completed: ReadonlySet<string>): OpensNextView[] {
  return getOpensNext(actionId, completed).map((e) =>
    e.kind === "available"
      ? { kind: "available", id: e.action.id, label: e.action.label, cost: e.action.cost, weekGate: e.weekGate }
      : { kind: "waiting", id: e.action.id, label: e.action.label, cost: e.action.cost, stillNeeds: e.stillNeeds }
  );
}

const redact = (text: string) => text.replace(/[A-Za-z0-9]/g, "█");

function toEnquiry(action: ActionItem, completed: ReadonlySet<string>): ClientEnquiry | null {
  const state = getEnquiryState(action, completed);
  if (state === "hidden") return null;
  const view = getEnquiryView(action, completed, 0);
  const base = {
    id: action.id,
    category: action.category,
    case: action.case,
    group: action.group,
    alsoRelatesTo: action.alsoRelatesTo,
    label: action.label,
    cost: action.cost,
    availableFromWeek: action.availableFromWeek ?? null,
  };
  if (state === "done") {
    return { ...base, state, waitingOn: [], outcome: action.outcome, opensNext: opensNextFor(action.id, completed) };
  }
  if (state === "available") {
    return { ...base, state, waitingOn: [], description: action.description };
  }
  return { ...base, state, waitingOn: view.waitingOn.map((w) => ({ title: w.title, met: w.met })) };
}

function toEvidence(item: EvidenceItem, completed: ReadonlySet<string>, currentWeek: number): ClientEvidence | null {
  if (isEvidenceUnlocked(item, currentWeek, completed)) {
    return {
      ...item,
      unlocked: true,
      opensNext: item.unlockedByActionId ? opensNextFor(item.unlockedByActionId, completed) : undefined,
    };
  }
  // Locked because its action hasn't been taken: don't send it at all — its id,
  // title and the action it hangs off would all give the action away.
  if (item.unlockedByActionId) return null;
  // Locked only by the calendar (a baseline document released in a later week): a
  // blank stub, so the board can show a redacted tile and "Unlocks in week N".
  return {
    id: item.id,
    exhibit: item.exhibit,
    type: item.type,
    case: item.case,
    group: item.group,
    title: redact(item.title),
    snippet: "",
    unlocksWeek: item.unlocksWeek,
    unlocked: false,
  };
}

export function buildTeamView(completed: ReadonlySet<string>, currentWeek: number): TeamView {
  const enquiries = ACTIONS.map((a) => toEnquiry(a, completed)).filter((e): e is ClientEnquiry => e !== null);
  const evidence = EVIDENCE.map((e) => toEvidence(e, completed, currentWeek)).filter((e): e is ClientEvidence => e !== null);
  return { enquiries, evidence, totalEvidence: EVIDENCE.length };
}
