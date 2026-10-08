// Pure helpers over the action catalog's prerequisite graph — no database, no
// React, safe on both client and server. Everything the evidence page shows
// about what is open, what is waiting and what a completed action opens next
// is derived here from lib/actions-catalog.ts (the one place actions are
// defined); lib/actions.ts's takeAction enforces the same prerequisites where
// points are spent.

import { ACTIONS, type ActionItem } from "./actions-catalog";

const BY_ID = new Map(ACTIONS.map((a) => [a.id, a]));

/** Placeholder for a prerequisite the team can't see yet — see waitingOn(). */
export const UNOPENED_LABEL = "an enquiry that isn't open yet";

export type EnquiryState =
  /** Already taken — stays done forever, whatever prerequisites are later added. */
  | "done"
  /** No prerequisites, or every one met. May still be held back by a week gate. */
  | "available"
  /** At least one prerequisite met and at most one still outstanding — shown greyed with a "waiting on" list. */
  | "waiting"
  /** Further away than that — not shown at all (never more than one step beyond what's unlocked). */
  | "hidden";

export type WaitingOnEntry = {
  id: string;
  /** Short title — or UNOPENED_LABEL for an unmet prerequisite the team can't see yet. */
  title: string;
  met: boolean;
};

export type EnquiryView = {
  action: ActionItem;
  state: EnquiryState;
  /** Every prerequisite, met or not, in catalog order. Empty when there are none. */
  waitingOn: WaitingOnEntry[];
  /** Set when the action is time-gated and `week` hasn't reached it yet. */
  weekLocked: number | null;
};

export function getAction(id: string): ActionItem | undefined {
  return BY_ID.get(id);
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Short, capitalised title for use in a list. */
export function shortTitle(action: ActionItem): string {
  return capitalise(action.shortLabel ?? action.label);
}

/** The state of one action for a team that has completed `completed` and is acting in `week`. */
export function getEnquiryState(action: ActionItem, completed: ReadonlySet<string>): EnquiryState {
  if (completed.has(action.id)) return "done";
  const prereqs = action.prerequisiteActionIds ?? [];
  if (prereqs.length === 0) return "available";
  const metCount = prereqs.filter((id) => completed.has(id)).length;
  const outstanding = prereqs.length - metCount;
  if (outstanding === 0) return "available";
  // "One step away" means something is met and no more than one thing is left.
  // For an action with one or two prerequisites that is simply "some but not
  // all met"; it only differs for the endgame (five prerequisites), which
  // would otherwise appear as soon as the first of the five was done.
  return metCount > 0 && outstanding <= 1 ? "waiting" : "hidden";
}

/**
 * The prerequisite list for display. A met prerequisite always shows its
 * title. An unmet one shows its title only if the team can already see that
 * action — otherwise a "waiting on" list would name actions two steps away
 * (for instance, "Burgess property search" on the arrest interview) and break
 * the one-step-ahead rule the rest of the page keeps.
 */
function waitingOn(action: ActionItem, completed: ReadonlySet<string>): WaitingOnEntry[] {
  return (action.prerequisiteActionIds ?? []).map((id) => {
    const prereq = BY_ID.get(id);
    const met = completed.has(id);
    const visible = prereq ? getEnquiryState(prereq, completed) !== "hidden" : false;
    return { id, met, title: prereq && (met || visible) ? shortTitle(prereq) : UNOPENED_LABEL };
  });
}

export function getEnquiryView(action: ActionItem, completed: ReadonlySet<string>, week: number): EnquiryView {
  return {
    action,
    state: getEnquiryState(action, completed),
    waitingOn: waitingOn(action, completed),
    weekLocked: action.availableFromWeek && week < action.availableFromWeek ? action.availableFromWeek : null,
  };
}

/** Whether the team can take this action right now, ignoring points. */
export function isTakeable(view: EnquiryView): boolean {
  return view.state === "available" && view.weekLocked === null;
}

export type OpensNextEntry =
  /** `weekGate` is the action's own week gate (null if none) — whether the team has reached it is the caller's call. */
  | { kind: "available"; action: ActionItem; weekGate: number | null }
  | { kind: "waiting"; action: ActionItem; stillNeeds: string[] };

/**
 * What completing `actionId` opens up: only its immediate dependents, and only
 * those the team hasn't already taken. A dependent whose other prerequisites
 * are all met is "available"; one still missing something is "waiting", with
 * what it still needs. Empty when nothing depends on the action.
 *
 * `completed` should already include `actionId`. Titles and cost only — the
 * caller never sees a total cost for any chain.
 */
export function getOpensNext(actionId: string, completed: ReadonlySet<string>): OpensNextEntry[] {
  const entries: OpensNextEntry[] = [];
  for (const action of ACTIONS) {
    if (!action.prerequisiteActionIds?.includes(actionId)) continue;
    if (completed.has(action.id)) continue;
    const view = getEnquiryView(action, completed, 0);
    if (view.state === "hidden") continue; // further away than one step — never previewed
    if (view.state === "available") {
      entries.push({ kind: "available", action, weekGate: action.availableFromWeek ?? null });
    } else {
      entries.push({ kind: "waiting", action, stillNeeds: view.waitingOn.filter((w) => !w.met).map((w) => w.title) });
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Graph checks — used by scripts/check-action-graph.ts, not by the UI.
// ---------------------------------------------------------------------------

/** Every action id that appears as a prerequisite of something but isn't an action. */
export function findMissingPrerequisites(actions: ActionItem[] = ACTIONS): { actionId: string; missing: string }[] {
  const ids = new Set(actions.map((a) => a.id));
  const problems: { actionId: string; missing: string }[] = [];
  for (const a of actions) {
    for (const p of a.prerequisiteActionIds ?? []) if (!ids.has(p)) problems.push({ actionId: a.id, missing: p });
  }
  return problems;
}

/** One cycle through the prerequisite graph as a list of ids, or null if there is none. */
export function findCycle(actions: ActionItem[] = ACTIONS): string[] | null {
  const byId = new Map(actions.map((a) => [a.id, a]));
  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];
  const visit = (id: string): string[] | null => {
    if (state.get(id) === "done") return null;
    if (state.get(id) === "visiting") return [...stack.slice(stack.indexOf(id)), id];
    state.set(id, "visiting");
    stack.push(id);
    for (const p of byId.get(id)?.prerequisiteActionIds ?? []) {
      const cycle = visit(p);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(id, "done");
    return null;
  };
  for (const a of actions) {
    const cycle = visit(a.id);
    if (cycle) return cycle;
  }
  return null;
}

/**
 * Actions that can never be completed starting from nothing — i.e. never reach
 * "available" however the team plays. Week gates are time, not graph edges, so
 * they are ignored here (everything is assumed to be reachable by the final week).
 */
export function findUnreachable(actions: ActionItem[] = ACTIONS): string[] {
  const completed = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const a of actions) {
      if (completed.has(a.id)) continue;
      if ((a.prerequisiteActionIds ?? []).every((p) => completed.has(p))) {
        completed.add(a.id);
        grew = true;
      }
    }
  }
  return actions.filter((a) => !completed.has(a.id)).map((a) => a.id);
}

/**
 * The cheapest total cost of completing `targetId` from a standing start: the
 * target plus everything it transitively requires, each counted once. Computed
 * from the catalog's costs and prerequisites, never hardcoded. For staff and
 * tests only — students are never shown a total.
 */
export function minimumCostToComplete(targetId: string): { total: number; actionIds: string[] } {
  const seen = new Set<string>();
  const walk = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    for (const p of BY_ID.get(id)?.prerequisiteActionIds ?? []) walk(p);
  };
  walk(targetId);
  const actionIds = [...seen];
  return { total: actionIds.reduce((sum, id) => sum + (BY_ID.get(id)?.cost ?? 0), 0), actionIds };
}
