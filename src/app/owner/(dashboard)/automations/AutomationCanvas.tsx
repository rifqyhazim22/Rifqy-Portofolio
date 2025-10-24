"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AutomationRecord, AutomationStatus } from "@/lib/supabase/owner-automations";
import {
  createAutomationAction,
  deleteAutomationAction,
  saveAutomationAction,
  type AutomationDefinition,
} from "./actions";

const STATUS_OPTIONS: AutomationStatus[] = ["draft", "active", "archived"];

const DEFAULT_DEFINITION: AutomationDefinition = {
  nodes: [
    {
      id: "trigger",
      type: "input",
      data: { label: "Start" },
      position: { x: 100, y: 100 },
    },
  ],
  edges: [],
};

type BuilderState = {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  definition: AutomationDefinition;
};

type AutomationCanvasProps = {
  automations: AutomationRecord[];
};

export const AutomationCanvas = ({ automations }: AutomationCanvasProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initial = automations[0];
  const [active, setActive] = useState<BuilderState | null>(
    initial
      ? {
          id: initial.id,
          name: initial.name,
          description: initial.description ?? "",
          status: initial.status,
          definition: (initial.definition as AutomationDefinition) ?? DEFAULT_DEFINITION,
        }
      : null,
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (active?.definition.nodes as any) ?? DEFAULT_DEFINITION.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (active?.definition.edges as any) ?? DEFAULT_DEFINITION.edges,
  );
  const [viewport, setViewport] = useState(active?.definition.viewport ?? { x: 0, y: 0, zoom: 1 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState(active?.name ?? "");
  const [descriptionDraft, setDescriptionDraft] = useState(active?.description ?? "");
  const [statusDraft, setStatusDraft] = useState<AutomationStatus>(active?.status ?? "draft");

  useEffect(() => {
    if (!active) return;
    setNodes((active.definition.nodes as any) ?? DEFAULT_DEFINITION.nodes);
    setEdges((active.definition.edges as any) ?? DEFAULT_DEFINITION.edges);
    setViewport(active.definition.viewport ?? { x: 0, y: 0, zoom: 1 });
    setNameDraft(active.name);
    setDescriptionDraft(active.description);
    setStatusDraft(active.status);
  }, [active, setEdges, setNodes]);

  const handleSelectAutomation = (record: AutomationRecord) => {
    setActive({
      id: record.id,
      name: record.name,
      description: record.description ?? "",
      status: record.status,
      definition: (record.definition as AutomationDefinition) ?? DEFAULT_DEFINITION,
    });
  };

  const handleAddNode = () => {
    const id = `node-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: 200 + Math.random() * 120, y: 150 + Math.random() * 120 },
        data: { label: `Step ${nds.length}` },
        type: "default",
      },
    ]);
  };

  const handleSave = () => {
    if (!active) return;

    startTransition(async () => {
      try {
        const definition: AutomationDefinition = {
          nodes,
          edges,
          viewport,
        };
        await saveAutomationAction({
          id: active.id,
          name: nameDraft.trim() || "Untitled automation",
          description: descriptionDraft,
          status: statusDraft,
          definition,
        });
        setFeedback("Automation saved");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to save automation");
      }
    });
  };

  const handleCreate = () => {
    const name = prompt("Nama automation baru?");
    if (!name) return;

    startTransition(async () => {
      try {
        const record = await createAutomationAction({ name });
        setActive({
          id: record.id,
          name: record.name,
          description: record.description ?? "",
          status: record.status,
          definition: (record.definition as AutomationDefinition) ?? DEFAULT_DEFINITION,
        });
        setFeedback("Automation created");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to create automation");
      }
    });
  };

  const handleDelete = () => {
    if (!active) return;
    if (!confirm(`Hapus automation ${active.name}?`)) return;

    startTransition(async () => {
      try {
        await deleteAutomationAction(active.id);
        setFeedback("Automation deleted");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Failed to delete automation");
      }
    });
  };

  const handleConnect = (params: any) => setEdges((eds) => addEdge(params, eds));

  const handleNodesChange = (changes: any) => {
    onNodesChange(changes);
  };

  const handleEdgesChange = (changes: any) => {
    onEdgesChange(changes);
  };

  const sidebarItems = useMemo(
    () =>
      automations.map((automation) => ({
        id: automation.id,
        name: automation.name,
        status: automation.status,
      })),
    [automations],
  );

  return (
    <section className="owner-automations">
      <aside className="owner-automations__sidebar">
        <div className="owner-automations__sidebar-header">
          <h3>Agent kit</h3>
          <button type="button" onClick={handleCreate} className="owner-story-card__button">
            <span aria-hidden>＋</span>
            New flow
          </button>
        </div>
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`owner-automations__item ${active?.id === item.id ? "is-active" : ""}`}
                onClick={() => {
                  const record = automations.find((automation) => automation.id === item.id);
                  if (record) handleSelectAutomation(record);
                }}
              >
                <strong>{item.name}</strong>
                <span>{item.status}</span>
              </button>
            </li>
          ))}
          {!sidebarItems.length && <li className="owner-panel__empty">Belum ada automation</li>}
        </ul>
      </aside>

      <div className="owner-automations__canvas">
        {feedback && <p className="owner-story-card__feedback owner-story-card__feedback--global">{feedback}</p>}
        {active ? (
          <div className="owner-automations__workspace">
            <div className="owner-automations__form">
              <label className="owner-panel__field">
                <span>Name</span>
                <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
              </label>
              <label className="owner-panel__field">
                <span>Description</span>
                <textarea
                  value={descriptionDraft}
                  rows={2}
                  onChange={(event) => setDescriptionDraft(event.target.value)}
                />
              </label>
              <label className="owner-panel__field">
                <span>Status</span>
                <select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as AutomationStatus)}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <div className="owner-automations__actions">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="owner-panel__secondary owner-panel__secondary--danger"
                  disabled={isPending}
                >
                  Delete
                </button>
                <div className="owner-automations__actions-right">
                  <button
                    type="button"
                    onClick={handleAddNode}
                    className="owner-panel__secondary"
                    disabled={isPending}
                  >
                    Add step
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="owner-panel__primary"
                    disabled={isPending}
                  >
                    {isPending ? "Saving…" : "Save flow"}
                  </button>
                </div>
              </div>
            </div>

            <div className="owner-automations__reactflow">
              <ReactFlow
                nodes={nodes as any}
                edges={edges as any}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onMoveEnd={(_, viewportState) => setViewport(viewportState)}
                fitView
              >
                <MiniMap pannable zoomable />
                <Controls />
                <Background gap={16} />
              </ReactFlow>
            </div>
          </div>
        ) : (
          <div className="owner-panel__empty owner-panel__empty--tall">
            <h4>Pilih automation</h4>
            <p>Buat flow baru atau pilih automation yang sudah ada untuk mulai mengedit.</p>
          </div>
        )}
      </div>
    </section>
  );
};
