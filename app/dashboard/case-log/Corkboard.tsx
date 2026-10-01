"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SUSPECT_META, getEvidenceColor, type EvidenceItem } from "@/lib/evidence-catalog";

export interface BoardPin {
  id: string;
  x: number;
  y: number;
  note: string | null;
  evidence: EvidenceItem;
}

export interface BoardConnection {
  id: string;
  fromPinId: string;
  toPinId: string;
  label: string;
}

const BOARD_WIDTH = 2000;
const BOARD_HEIGHT = 1100;

// One target + one source handle stacked at each of the four edges, so a
// connection can be started or finished from whichever side two cards
// happen to face each other on the board — not just straight up/down.
// Visible only on hover (opacity-0 → group-hover:opacity-100), matching the
// existing hover-reveal tooltip below, rather than cluttering the board
// with eight dots per card at all times.
const CONNECTION_HANDLES: { position: Position; type: "source" | "target" }[] = [
  { position: Position.Top, type: "target" },
  { position: Position.Top, type: "source" },
  { position: Position.Right, type: "target" },
  { position: Position.Right, type: "source" },
  { position: Position.Bottom, type: "target" },
  { position: Position.Bottom, type: "source" },
  { position: Position.Left, type: "target" },
  { position: Position.Left, type: "source" },
];

function EvidenceCardNode({ data }: NodeProps) {
  const { evidence, note, onOpen } = data as unknown as {
    evidence: EvidenceItem;
    note: string | null;
    onOpen: () => void;
  };
  const color = getEvidenceColor(evidence);
  const suspectLabel = evidence.suspect ? SUSPECT_META[evidence.suspect].label : null;

  return (
    <div className="group relative">
      {CONNECTION_HANDLES.map(({ position, type }) => (
        <Handle
          key={`${position}-${type}`}
          type={type}
          position={position}
          id={`${position}-${type}`}
          style={{ background: color, width: 10, height: 10, border: "2px solid #FBF8F0" }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      ))}
      <button
        onClick={onOpen}
        className="w-44 text-left rounded-md border-2 bg-[#FBF8F0] shadow-sm px-2.5 py-2 hover:shadow-md transition-shadow"
        style={{ borderColor: color }}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color }}>
            {evidence.exhibit}
          </span>
          {suspectLabel && (
            <span className="text-[9px] font-mono uppercase tracking-wide" style={{ color }}>
              {suspectLabel}
            </span>
          )}
        </div>
        <span className="text-xs font-medium leading-snug text-[#2A2F27]">{evidence.title}</span>
        {note && <p className="mt-1 text-[10px] text-amber-700 italic line-clamp-2">📌 {note}</p>}
      </button>

      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-56 -translate-x-1/2 rounded-md border border-neutral-200 bg-white p-2 text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="font-medium">{evidence.title}</p>
        <p className="mt-1 text-neutral-600 line-clamp-3">{evidence.snippet}</p>
      </div>
    </div>
  );
}

const nodeTypes = { evidenceCard: EvidenceCardNode };

export default function Corkboard({
  pins,
  connections,
  onMovePin,
  onOpenPin,
  onUnpin,
  onConnect,
  onDeleteConnection,
}: {
  pins: BoardPin[];
  connections: BoardConnection[];
  onMovePin: (pinId: string, x: number, y: number) => void;
  onOpenPin: (pin: BoardPin) => void;
  onUnpin: (pinId: string) => void;
  onConnect: (fromPinId: string, toPinId: string, label: string) => void;
  onDeleteConnection: (connectionId: string) => void;
}) {
  const initialNodes: Node[] = useMemo(
    () =>
      pins.map((pin) => ({
        id: pin.id,
        type: "evidenceCard",
        position: { x: pin.x, y: pin.y },
        data: { evidence: pin.evidence, note: pin.note, onOpen: () => onOpenPin(pin) },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pins]
  );
  const initialEdges: Edge[] = useMemo(
    () =>
      connections.map((c) => ({
        id: c.id,
        source: c.fromPinId,
        target: c.toPinId,
        label: c.label,
        style: { stroke: "#A6764A" },
        labelStyle: { fontSize: 11 },
      })),
    [connections]
  );

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Re-sync local (draggable) state whenever the server-confirmed board
  // changes — a new pin, an unpin, a new connection, or the position we just
  // persisted coming back from a refetch. Adjusted during render (React's
  // recommended pattern for "reset state when a prop changes") rather than
  // in an effect, so it doesn't cause an extra flash/render pass.
  const [prevInitialNodes, setPrevInitialNodes] = useState(initialNodes);
  if (initialNodes !== prevInitialNodes) {
    setPrevInitialNodes(initialNodes);
    setNodes(initialNodes);
  }
  const [prevInitialEdges, setPrevInitialEdges] = useState(initialEdges);
  if (initialEdges !== prevInitialEdges) {
    setPrevInitialEdges(initialEdges);
    setEdges(initialEdges);
  }

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const handleNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      onMovePin(node.id, node.position.x, node.position.y);
    },
    [onMovePin]
  );

  // In-page prompts rather than window.prompt/confirm — those get silently
  // suppressed in some automated/controlled browsers (confirmed during
  // testing elsewhere in this app; see app/dashboard/quiz/TrustQuiz.tsx).
  const [pendingConnection, setPendingConnection] = useState<{ source: string; target: string } | null>(null);
  const [connectionLabel, setConnectionLabel] = useState("");
  const [pendingRemoveEdge, setPendingRemoveEdge] = useState<Edge | null>(null);

  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    setConnectionLabel("");
    setPendingConnection({ source: connection.source, target: connection.target });
  }, []);

  const confirmConnection = () => {
    if (!pendingConnection || !connectionLabel.trim()) return;
    onConnect(pendingConnection.source, pendingConnection.target, connectionLabel.trim());
    setPendingConnection(null);
  };

  const handleEdgeClick = useCallback((_: unknown, edge: Edge) => {
    setPendingRemoveEdge(edge);
  }, []);

  return (
    <div>
      <p className="font-mono text-xs text-[#8A8A80] mb-2 mt-0">
        Drag cards to arrange them. Drag from one card&apos;s edge to another to connect them. Click a card to open
        the full document; click a connection to remove it.
      </p>
      <div style={{ height: 480 }} className="border border-[#A6764A] overflow-hidden bg-[#F4EFE1]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onConnect={handleConnect}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          translateExtent={[
            [0, 0],
            [BOARD_WIDTH, BOARD_HEIGHT],
          ]}
          nodeExtent={[
            [0, 0],
            [BOARD_WIDTH, BOARD_HEIGHT],
          ]}
          minZoom={0.3}
          maxZoom={1.5}
          fitView
        >
          <Background gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {pins.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {pins.map((p) => (
            <button
              key={p.id}
              onClick={() => onUnpin(p.id)}
              className="font-mono text-[11px] text-[#8A8A80] hover:text-[#8B3226] underline"
            >
              Unpin {p.evidence.exhibit}
            </button>
          ))}
        </div>
      )}

      {pendingConnection && (
        <div className="mt-3 bg-[#E8E1D0] border border-[#A6764A] px-4 py-3.5">
          <p className="font-mono text-xs text-[#2A2F27] mb-2 mt-0">
            Label this connection (e.g. &quot;same weapon type&quot;, &quot;alibi conflict&quot;):
          </p>
          <div className="flex gap-2 flex-wrap items-center">
            <input
              autoFocus
              type="text"
              value={connectionLabel}
              onChange={(e) => setConnectionLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmConnection()}
              className="flex-1 basis-[220px] font-mono text-[13px] bg-[#FBF8F0] border border-[#D6CDB4] px-2.5 py-1.5 text-[#2A2F27] outline-none"
              placeholder="Connection label"
            />
            <button
              onClick={confirmConnection}
              disabled={!connectionLabel.trim()}
              className="font-mono text-xs tracking-wide bg-[#2A2F27] text-[#E8E1D0] px-3.5 py-1.5 border border-[#2A2F27] disabled:opacity-50"
            >
              CONNECT
            </button>
            <button
              onClick={() => setPendingConnection(null)}
              className="font-mono text-xs tracking-wide bg-transparent text-[#5B5A4E] px-3.5 py-1.5 border border-[#5B5A4E]"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {pendingRemoveEdge && (
        <div className="mt-3 bg-[#E8E1D0] border border-[#8B3226] px-4 py-3.5">
          <p className="font-mono text-xs text-[#2A2F27] mb-3 mt-0">
            Remove connection &quot;{pendingRemoveEdge.label}&quot;?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDeleteConnection(pendingRemoveEdge.id);
                setPendingRemoveEdge(null);
              }}
              className="font-mono text-xs tracking-wide bg-[#8B3226] text-[#F4EFE1] px-3.5 py-1.5 border border-[#8B3226]"
            >
              REMOVE
            </button>
            <button
              onClick={() => setPendingRemoveEdge(null)}
              className="font-mono text-xs tracking-wide bg-transparent text-[#5B5A4E] px-3.5 py-1.5 border border-[#5B5A4E]"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
