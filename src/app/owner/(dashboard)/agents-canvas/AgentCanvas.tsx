"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import type { AiAgentRecord } from "@/lib/supabase/agents";
import type { MediaAssetRecord } from "@/lib/supabase/owner-assets";

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 0.95 };

const STATUS_PILLS: Array<{ id: "draft" | "active" | "archived"; label: string }> = [
  { id: "draft", label: "DRAFT" },
  { id: "active", label: "ACTIVE" },
  { id: "archived", label: "ARCHIVED" },
];

const buildNodeId = () => `node-${crypto.randomUUID()}`;

const NODE_COLORS: Record<string, string> = {
  trigger: "#7dd3fc",
  agent: "#c4b5fd",
  action: "#f4a6ff",
  decision: "#fbbf24",
  integration: "#34d399",
};

type CanvasNodeData = {
  label: string;
  description?: string;
  kind: "trigger" | "agent" | "action" | "decision" | "integration";
  agentSlug?: string | null;
  config?: Record<string, unknown>;
};

type AgentCanvasProps = {
  agents: AiAgentRecord[];
  assets: MediaAssetRecord[];
};

const TriggerNode = ({ data }: { data: CanvasNodeData }) => (
  <div className="canvas-node canvas-node--trigger">
    <span className="canvas-node__badge">Trigger</span>
    <strong>{data.label}</strong>
    {data.description ? <p>{data.description}</p> : null}
  </div>
);

const AgentNode = ({ data }: { data: CanvasNodeData }) => (
  <div className="canvas-node canvas-node--agent">
    <span className="canvas-node__badge">Agent</span>
    <strong>{data.label}</strong>
    {data.agentSlug ? <small>handles: {data.agentSlug}</small> : null}
    {data.description ? <p>{data.description}</p> : null}
  </div>
);

const ActionNode = ({ data }: { data: CanvasNodeData }) => (
  <div className="canvas-node canvas-node--action">
    <span className="canvas-node__badge">Action</span>
    <strong>{data.label}</strong>
    {data.description ? <p>{data.description}</p> : null}
  </div>
);

const DecisionNode = ({ data }: { data: CanvasNodeData }) => (
  <div className="canvas-node canvas-node--decision">
    <span className="canvas-node__badge">Decision</span>
    <strong>{data.label}</strong>
    {data.description ? <p>{data.description}</p> : null}
  </div>
);

const IntegrationNode = ({ data }: { data: CanvasNodeData }) => (
  <div className="canvas-node canvas-node--integration">
    <span className="canvas-node__badge">Integration</span>
    <strong>{data.label}</strong>
    {data.description ? <p>{data.description}</p> : null}
  </div>
);

const NODE_TYPES = {
  trigger: TriggerNode,
  agent: AgentNode,
  action: ActionNode,
  decision: DecisionNode,
  integration: IntegrationNode,
};

const INITIAL_NODES: Node<CanvasNodeData>[] = [
  {
    id: buildNodeId(),
    type: "trigger",
    position: { x: -250, y: 0 },
    data: {
      label: "Inbound webhook",
      description: "Menangkap request dari produk atau integrasi pihak ketiga.",
      kind: "trigger",
    },
  },
  {
    id: buildNodeId(),
    type: "agent",
    position: { x: 50, y: -60 },
    data: {
      label: "Navigator agent",
      description: "Menyapa pengunjung dan menentukan intent.",
      kind: "agent",
    },
  },
  {
    id: buildNodeId(),
    type: "action",
    position: { x: 360, y: -60 },
    data: {
      label: "Fetch knowledge",
      description: "Ambil konteks lanjutan dari Supabase.",
      kind: "action",
    },
  },
  {
    id: buildNodeId(),
    type: "decision",
    position: { x: 50, y: 140 },
    data: {
      label: "Is librarian needed?",
      description: "Tentukan kapan librarian harus mengambil alih.",
      kind: "decision",
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: "edge-1",
    source: INITIAL_NODES[0].id,
    target: INITIAL_NODES[1].id,
    markerEnd: { type: MarkerType.ArrowClosed },
    animated: true,
  },
  {
    id: "edge-2",
    source: INITIAL_NODES[1].id,
    target: INITIAL_NODES[2].id,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "edge-3",
    source: INITIAL_NODES[1].id,
    target: INITIAL_NODES[3].id,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "Complex intent",
  },
];

const PALETTE_GROUPS = [
  {
    title: "Triggers",
    items: [
      {
        kind: "trigger" as const,
        label: "Webhook trigger",
        description: "Terpicu oleh request HTTP POST",
      },
      {
        kind: "trigger" as const,
        label: "Schedule trigger",
        description: "Jalankan berdasarkan cron atau interval",
      },
    ],
  },
  {
    title: "Agents",
    items: [
      {
        kind: "agent" as const,
        label: "Chat agent",
        description: "Gunakan salah satu navigator/chat agent",
      },
      {
        kind: "agent" as const,
        label: "Librarian agent",
        description: "Delegasikan ke librarian untuk riset",
      },
    ],
  },
  {
    title: "Actions",
    items: [
      {
        kind: "action" as const,
        label: "HTTP request",
        description: "Panggil API pihak ketiga",
      },
      {
        kind: "integration" as const,
        label: "Supabase query",
        description: "Baca atau tulis data Supabase",
      },
      {
        kind: "decision" as const,
        label: "Decision gate",
        description: "Routing berdasarkan kondisi atau intent",
      },
    ],
  },
];

export const AgentCanvas = ({ agents, assets }: AgentCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(INITIAL_NODES[1].id);
  const [blueprintName, setBlueprintName] = useState("AI Agent Orchestration");
  const [blueprintStatus, setBlueprintStatus] = useState<"draft" | "active" | "archived">("draft");
  const [blueprintDescription, setBlueprintDescription] = useState(
    "Blueprint ini mengatur alur navigator → librarian dengan trigger webhook dan aksi Supabase.",
  );
  const [isSaving, startTransition] = useTransition();
  const [importError, setImportError] = useState<string | null>(null);

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);

  useEffect(() => {
    if (!selectedNode && nodes.length) {
      setSelectedNodeId(nodes[0].id);
    }
  }, [nodes, selectedNode]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const handleAddNode = (kind: CanvasNodeData["kind"], label: string, description?: string) => {
    const newNode: Node<CanvasNodeData> = {
      id: buildNodeId(),
      type: kind,
      position: { x: Math.random() * 320, y: Math.random() * 200 },
      data: {
        label,
        description,
        kind,
      },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleUpdateNode = (changes: Partial<CanvasNodeData>) => {
    if (!selectedNode) return;
    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...changes,
              },
            }
          : node,
      ),
    );
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes((prev) => prev.filter((node) => node.id !== selectedNode.id));
    setEdges((prev) => prev.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId(null);
  };

  const handleExport = () => {
    const blueprint = {
      name: blueprintName,
      description: blueprintDescription,
      status: blueprintStatus,
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${blueprintName.replace(/\s+/g, "-").toLowerCase()}-blueprint.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          throw new Error("Blueprint harus memiliki nodes dan edges");
        }
        setNodes(parsed.nodes as Node<CanvasNodeData>[]);
        setEdges(parsed.edges as Edge[]);
        if (parsed.name) setBlueprintName(parsed.name);
        if (parsed.status) setBlueprintStatus(parsed.status);
        if (parsed.description) setBlueprintDescription(parsed.description);
        setImportError(null);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "Gagal memuat blueprint");
      }
    };
    reader.readAsText(file);
  };

  const handleSimulate = () => {
    startTransition(async () => {
      // Simulasi sederhana; di masa depan bisa hit Supabase/Edge Function
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert("Simulation complete: no runtime backend yet, this is a dry run.");
    });
  };

  const agentOptions = useMemo(
    () => agents.map((agent) => ({ slug: agent.slug, name: agent.name, type: agent.type })),
    [agents],
  );

  const nodeCountByType = useMemo(() => {
    return nodes.reduce<Record<string, number>>((acc, node) => {
      acc[node.type ?? "unknown"] = (acc[node.type ?? "unknown"] ?? 0) + 1;
      return acc;
    }, {});
  }, [nodes]);

  return (
    <div className="owner-canvas">
      <section className="owner-canvas__header">
        <div className="owner-canvas__title">
          <input
            value={blueprintName}
            onChange={(event) => setBlueprintName(event.target.value)}
            placeholder="Untitled blueprint"
          />
          <textarea
            value={blueprintDescription}
            onChange={(event) => setBlueprintDescription(event.target.value)}
            rows={2}
            placeholder="Tulis ringkasan alur agent di sini"
          />
        </div>
        <div className="owner-canvas__header-actions">
          <div className="owner-canvas__status" role="group" aria-label="Blueprint status">
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setBlueprintStatus(pill.id)}
                className={`owner-canvas__status-btn ${blueprintStatus === pill.id ? "is-active" : ""}`}
              >
                {pill.label}
              </button>
            ))}
          </div>
          <div className="owner-canvas__header-buttons">
            <label className="owner-canvas__import">
              Import
              <input type="file" accept="application/json" onChange={handleImport} hidden />
            </label>
            <button type="button" onClick={handleExport} className="owner-panel__secondary">
              Export JSON
            </button>
            <button type="button" onClick={handleSimulate} disabled={isSaving} className="owner-panel__primary">
              {isSaving ? "Simulating…" : "Simulate run"}
            </button>
          </div>
        </div>
      </section>

      <div className="owner-canvas__body">
        <aside className="owner-canvas__palette">
          <header>
            <h4>Canvas palette</h4>
            <p>Drag &amp; drop atau klik untuk menambah node.</p>
          </header>
          {PALETTE_GROUPS.map((group) => (
            <div key={group.title} className="owner-canvas__palette-group">
              <h5>{group.title}</h5>
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <button type="button" onClick={() => handleAddNode(item.kind, item.label, item.description)}>
                      <span>{item.label}</span>
                      <small>{item.description}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <footer>
            <h5>Node stats</h5>
            <ul>
              {Object.entries(nodeCountByType).map(([type, count]) => (
                <li key={type}>
                  <span>{type}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          </footer>
        </aside>

        <div className="owner-canvas__workspace">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            defaultViewport={DEFAULT_VIEWPORT}
            nodeTypes={NODE_TYPES}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
          >
            <Background gap={24} color="#1f2a57" variant={BackgroundVariant.Dots} />
            <Controls position="bottom-right" />
            <MiniMap position="top-right" pannable zoomable />
            <Panel position="top-left" className="owner-canvas__panel-info">
              <strong>{nodes.length}</strong>
              <span>nodes</span>
              <strong>{edges.length}</strong>
              <span>edges</span>
            </Panel>
          </ReactFlow>
        </div>

        <aside className="owner-canvas__inspector">
          <header>
            <h4>Inspector</h4>
            <p>{selectedNode ? `Node ${selectedNode.data.kind}` : "Pilih node untuk mengedit"}</p>
          </header>

          {importError ? <p className="owner-canvas__error">{importError}</p> : null}

          {selectedNode ? (
            <div className="owner-canvas__inspector-body">
              <label className="owner-panel__field">
                <span>Label</span>
                <input
                  value={selectedNode.data.label}
                  onChange={(event) => handleUpdateNode({ label: event.target.value })}
                />
              </label>
              <label className="owner-panel__field">
                <span>Description</span>
                <textarea
                  value={selectedNode.data.description ?? ""}
                  onChange={(event) => handleUpdateNode({ description: event.target.value })}
                  rows={3}
                />
              </label>

              {selectedNode.data.kind === "agent" ? (
                <label className="owner-panel__field">
                  <span>Bind to agent</span>
                  <select
                    value={selectedNode.data.agentSlug ?? ""}
                    onChange={(event) => handleUpdateNode({ agentSlug: event.target.value || null })}
                  >
                    <option value="">— pilih agent —</option>
                    {agentOptions.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.name} ({option.type})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {selectedNode.data.kind === "integration" ? (
                <label className="owner-panel__field">
                  <span>Pilih asset</span>
                  <select
                    value={(selectedNode.data.config as any)?.assetId ?? ""}
                    onChange={(event) =>
                      handleUpdateNode({
                        config: {
                          ...(selectedNode.data.config ?? {}),
                          assetId: event.target.value || null,
                        },
                      })
                    }
                  >
                    <option value="">— pilih asset (opsional) —</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.title ?? asset.file_path}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="owner-canvas__inspector-actions">
                <button
                  type="button"
                  onClick={handleDeleteNode}
                  className="owner-panel__secondary owner-panel__secondary--danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <p className="owner-canvas__empty">Pilih node untuk melihat detail.</p>
          )}
        </aside>
      </div>
    </div>
  );
};
