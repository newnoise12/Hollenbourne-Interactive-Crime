"use client";

import { useMemo, useState } from "react";
import { NODE_W, NODE_H } from "@/lib/action-graph-constants";
import type { EvidenceMap } from "@/lib/action-graph-layout";

// Case colours — separate from the corkboard's suspect colours on purpose: this
// map colours by *case*, and each node also names its case in text so colour is
// never the only cue.
const CASE_COLOR: Record<string, string> = {
  mason: "#B4532A",
  wooley: "#5B4BB5",
  porterhouse: "#B8860B",
  butt: "#1F7A6B",
  general: "#7A7A70",
};
const ROUTE = "#E0A526";

function wrap(text: string, max: number, lines: number): string[] {
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max && line) {
      out.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    const kept = out.slice(0, lines);
    kept[lines - 1] = kept[lines - 1].slice(0, Math.max(0, max - 1)).trimEnd() + "…";
    return kept;
  }
  return out;
}

const points = (n: number) => `${n} pt${n === 1 ? "" : "s"}`;

export default function GatingMap({
  map,
  caseLabels,
  groupLabels,
}: {
  map: EvidenceMap;
  caseLabels: Record<string, string>;
  groupLabels: Record<string, string>;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(true);

  const { nodeById, ancestors, descendants } = useMemo(() => {
    const nodeById = new Map(map.nodes.map((n) => [n.id, n]));
    const prereqs = new Map<string, string[]>();
    const dependents = new Map<string, string[]>();
    for (const e of map.edges) {
      prereqs.set(e.to, [...(prereqs.get(e.to) ?? []), e.from]);
      dependents.set(e.from, [...(dependents.get(e.from) ?? []), e.to]);
    }
    const closure = (start: string, next: Map<string, string[]>) => {
      const seen = new Set<string>();
      const stack = [start];
      while (stack.length) {
        for (const n of next.get(stack.pop()!) ?? []) {
          if (seen.has(n)) continue;
          seen.add(n);
          stack.push(n);
        }
      }
      return seen;
    };
    return {
      nodeById,
      ancestors: (id: string) => closure(id, prereqs),
      descendants: (id: string) => closure(id, dependents),
    };
  }, [map]);

  const chain = useMemo(() => {
    if (!hovered) return null;
    const set = new Set<string>([hovered]);
    ancestors(hovered).forEach((x) => set.add(x));
    descendants(hovered).forEach((x) => set.add(x));
    return set;
  }, [hovered, ancestors, descendants]);

  const route = useMemo(() => new Set(map.endgame.actionIds), [map]);

  const headings = map.layers.map((l) =>
    l.index === 0 ? "Open from the start" : l.index === 1 ? "One step in" : `${l.index} steps in`
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
        <label className="font-mono text-xs text-[#E8E1D0] flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showRoute} onChange={(e) => setShowRoute(e.target.checked)} />
          Highlight the cheapest route to the endgame ({points(map.endgame.total)})
        </label>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {Object.keys(CASE_COLOR).map((c) => (
            <span key={c} className="font-mono text-[11px] text-[#C9C4B3] flex items-center gap-1.5">
              <span className="inline-block w-3 h-3" style={{ background: CASE_COLOR[c] }} />
              {caseLabels[c]}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-[#1B1D21] border border-[#A6764A55]">
        <svg
          width={map.width}
          height={map.height}
          viewBox={`0 0 ${map.width} ${map.height}`}
          role="group"
          aria-label="Prerequisite map of every investigation action"
          style={{ display: "block", fontFamily: "var(--font-mono), monospace" }}
        >
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#8A8A80" />
            </marker>
            <marker id="arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#E8E1D0" />
            </marker>
            <marker id="arrow-route" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={ROUTE} />
            </marker>
          </defs>

          {map.layers.map((l) => (
            <g key={l.index}>
              <text x={24 + l.index * (NODE_W + 130)} y={22} fontSize={12} fill="#E8E1D0" fontWeight={600}>
                {headings[l.index]}
              </text>
              <text x={24 + l.index * (NODE_W + 130)} y={38} fontSize={10} fill="#8A8A80">
                {l.count} actions · {points(l.cost)} in total
              </text>
            </g>
          ))}

          {/* edges first, so nodes sit on top */}
          {map.edges.map((e) => {
            const a = nodeById.get(e.from)!;
            const b = nodeById.get(e.to)!;
            const x1 = a.x + NODE_W;
            const y1 = a.y + NODE_H / 2;
            const x2 = b.x;
            const y2 = b.y + NODE_H / 2;
            const mid = (x1 + x2) / 2;
            const onRoute = showRoute && route.has(e.from) && route.has(e.to);
            const inChain = chain ? chain.has(e.from) && chain.has(e.to) : false;
            const dim = chain && !inChain;
            const stroke = inChain ? "#E8E1D0" : onRoute ? ROUTE : "#8A8A80";
            return (
              <path
                key={`${e.from}>${e.to}`}
                d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`}
                fill="none"
                stroke={stroke}
                strokeWidth={inChain ? 2 : onRoute ? 2.5 : 1.2}
                opacity={dim ? 0.08 : inChain || onRoute ? 1 : 0.45}
                markerEnd={`url(#${inChain ? "arrow-on" : onRoute ? "arrow-route" : "arrow"})`}
              />
            );
          })}

          {map.nodes.map((n) => {
            const onRoute = showRoute && route.has(n.id);
            const dim = chain && !chain.has(n.id);
            const lines = wrap(n.label, 31, 2);
            const meta = `${caseLabels[n.case]} · ${groupLabels[n.group]}`;
            const right = `${points(n.cost)}${n.weekGate ? ` · Wk ${n.weekGate}+` : ""}`;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                opacity={dim ? 0.18 : 1}
                tabIndex={0}
                role="img"
                aria-label={`${n.label}. ${caseLabels[n.case]}, ${groupLabels[n.group]}. ${right}.`}
                data-id={n.id}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(n.id)}
                onBlur={() => setHovered(null)}
                style={{ cursor: "default", outline: "none" }}
              >
                <title>{n.label}</title>
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={3}
                  fill="#E8E1D0"
                  stroke={onRoute ? ROUTE : hovered === n.id ? "#FFFFFF" : "#D6CDB4"}
                  strokeWidth={onRoute || hovered === n.id ? 3 : 1}
                />
                <rect width={6} height={NODE_H} rx={2} fill={CASE_COLOR[n.case]} />
                {lines.map((line, i) => (
                  <text key={i} x={16} y={17 + i * 13} fontSize={11} fill="#2A2F27" fontWeight={600}>
                    {line}
                  </text>
                ))}
                <text x={16} y={NODE_H - 25} fontSize={9} fill="#5B5A4E">
                  {meta.length > 37 ? meta.slice(0, 36) + "…" : meta}
                </text>
                {n.weekGate && (
                  <text x={16} y={NODE_H - 9} fontSize={10} fill="#8B3226" fontWeight={700}>
                    not before Week {n.weekGate}
                  </text>
                )}
                <text x={NODE_W - 8} y={NODE_H - 9} fontSize={11} fill="#2A2F27" fontWeight={700} textAnchor="end">
                  {points(n.cost)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="font-mono text-[11px] text-[#8A8A80] mt-2 mb-0">
        Arrows point from a prerequisite to the action it unlocks; an action needs <em>all</em> of the arrows pointing into
        it. Hover or tab to a box to trace everything it depends on and everything it leads to.
      </p>
    </div>
  );
}
