// Layered layout of the action prerequisite graph, for the instructor's
// "Evidence map" page. Pure: derives everything from lib/actions-catalog.ts, so
// the picture can never drift from the rules the game actually enforces.

import { ACTIONS, type ActionItem, type CaseName } from "./actions-catalog";
import { minimumCostToComplete } from "./action-graph";

import { NODE_W, NODE_H } from "./action-graph-constants";
export { NODE_W, NODE_H };
const COL_GAP = 130;
const ROW_GAP = 14;
const MARGIN_X = 24;
const MARGIN_TOP = 56; // room for the column headings

export type MapNode = {
  id: string;
  label: string;
  cost: number;
  weekGate: number | null;
  case: CaseName;
  group: string;
  layer: number;
  x: number;
  y: number;
};

export type MapEdge = { from: string; to: string };

export type MapLayer = { index: number; count: number; cost: number };

export type EvidenceMap = {
  nodes: MapNode[];
  edges: MapEdge[];
  layers: MapLayer[];
  width: number;
  height: number;
  totalCost: number;
  /** The cheapest set of actions that completes the endgame, with its total. */
  endgame: { id: string; total: number; actionIds: string[] };
};

const CASE_ORDER: CaseName[] = ["mason", "wooley", "porterhouse", "butt", "general"];

function depthOf(action: ActionItem, byId: Map<string, ActionItem>, memo: Map<string, number>): number {
  const cached = memo.get(action.id);
  if (cached !== undefined) return cached;
  const prereqs = action.prerequisiteActionIds ?? [];
  const depth = prereqs.length === 0 ? 0 : 1 + Math.max(...prereqs.map((p) => depthOf(byId.get(p)!, byId, memo)));
  memo.set(action.id, depth);
  return depth;
}

export function buildEvidenceMap(endgameId = "endgame-arrest-burgess-butt"): EvidenceMap {
  const byId = new Map(ACTIONS.map((a) => [a.id, a]));
  const memo = new Map<string, number>();
  const depth = new Map(ACTIONS.map((a) => [a.id, depthOf(a, byId, memo)]));
  const maxDepth = Math.max(...depth.values());

  const edges: MapEdge[] = [];
  for (const a of ACTIONS) for (const p of a.prerequisiteActionIds ?? []) edges.push({ from: p, to: a.id });

  // Start each layer grouped by case (then catalog order), then sweep a few times
  // ordering by the average position of neighbours, which untangles most crossings.
  const layers: string[][] = Array.from({ length: maxDepth + 1 }, () => []);
  const catalogIndex = new Map(ACTIONS.map((a, i) => [a.id, i]));
  const sorted = [...ACTIONS].sort(
    (a, b) => CASE_ORDER.indexOf(a.case) - CASE_ORDER.indexOf(b.case) || catalogIndex.get(a.id)! - catalogIndex.get(b.id)!
  );
  for (const a of sorted) layers[depth.get(a.id)!].push(a.id);

  const position = () => {
    const pos = new Map<string, number>();
    layers.forEach((layer) => layer.forEach((id, i) => pos.set(id, i)));
    return pos;
  };
  const dependents = new Map<string, string[]>();
  for (const e of edges) dependents.set(e.from, [...(dependents.get(e.from) ?? []), e.to]);

  const reorder = (layer: string[], neighbours: (id: string) => string[]) => {
    const pos = position();
    const score = (id: string) => {
      const ns = neighbours(id);
      return ns.length === 0 ? pos.get(id)! : ns.reduce((sum, n) => sum + pos.get(n)!, 0) / ns.length;
    };
    const keyed = layer.map((id, i) => ({ id, s: score(id), i }));
    keyed.sort((a, b) => a.s - b.s || a.i - b.i);
    keyed.forEach((k, i) => (layer[i] = k.id));
  };
  for (let sweep = 0; sweep < 4; sweep++) {
    for (let l = 1; l <= maxDepth; l++) reorder(layers[l], (id) => byId.get(id)!.prerequisiteActionIds ?? []);
    for (let l = maxDepth - 1; l >= 0; l--) reorder(layers[l], (id) => dependents.get(id) ?? []);
  }

  const tallest = Math.max(...layers.map((l) => l.length));
  const nodes: MapNode[] = [];
  layers.forEach((layer, l) => {
    const offset = ((tallest - layer.length) * (NODE_H + ROW_GAP)) / 2;
    layer.forEach((id, row) => {
      const a = byId.get(id)!;
      nodes.push({
        id,
        label: a.shortLabel ? a.shortLabel.charAt(0).toUpperCase() + a.shortLabel.slice(1) : a.label,
        cost: a.cost,
        weekGate: a.availableFromWeek ?? null,
        case: a.case,
        group: a.group,
        layer: l,
        x: MARGIN_X + l * (NODE_W + COL_GAP),
        y: MARGIN_TOP + offset + row * (NODE_H + ROW_GAP),
      });
    });
  });

  const route = minimumCostToComplete(endgameId);
  return {
    nodes,
    edges,
    layers: layers.map((layer, index) => ({
      index,
      count: layer.length,
      cost: layer.reduce((sum, id) => sum + byId.get(id)!.cost, 0),
    })),
    width: MARGIN_X * 2 + (maxDepth + 1) * NODE_W + maxDepth * COL_GAP,
    height: MARGIN_TOP + tallest * (NODE_H + ROW_GAP) + 16,
    totalCost: ACTIONS.reduce((sum, a) => sum + a.cost, 0),
    endgame: { id: endgameId, total: route.total, actionIds: route.actionIds },
  };
}
