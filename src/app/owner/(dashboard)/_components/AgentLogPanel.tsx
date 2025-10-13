"use client";

import { useMemo, useState } from "react";

export type AgentLogRecord = {
  id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  referrer: string | null;
  agent_type: string;
  intent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type AgentLogPanelProps = {
  logs: AgentLogRecord[];
};

const formatTimestamp = (value: string) => {
  try {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return formatter.format(new Date(value));
  } catch {
    return value;
  }
};

export const AgentLogPanel = ({ logs }: AgentLogPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const renderedLogs = useMemo(
    () => [...logs].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [logs],
  );

  return (
    <section className="owner-panel owner-panel--logs">
      <header>
        <div>
          <h3>Agent sessions</h3>
          <p>Jejak percakapan terbaru dari AI chat dan librarian.</p>
        </div>
        <span className="owner-panel__badge">{logs.length} recent</span>
      </header>

      <div className="owner-panel__logs">
        {!logs.length && (
          <p className="owner-panel__empty">Belum ada sesi yang tercatat.</p>
        )}

        {renderedLogs.map((log) => (
          <article key={log.id} className="owner-panel__log">
            <header>
              <div>
                <strong>{log.visitor_name ?? "Anonymous"}</strong>
                <span>{log.agent_type}</span>
              </div>
              <time>{formatTimestamp(log.created_at)}</time>
            </header>

            <dl>
              {log.visitor_email && (
                <div>
                  <dt>Email</dt>
                  <dd>{log.visitor_email}</dd>
                </div>
              )}
              {log.referrer && (
                <div>
                  <dt>Source</dt>
                  <dd>{log.referrer}</dd>
                </div>
              )}
              {log.intent && (
                <div>
                  <dt>Intent</dt>
                  <dd>{log.intent}</dd>
                </div>
              )}
            </dl>

            {log.metadata && (
              <div className="owner-panel__log-meta">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((current) =>
                      current === log.id ? null : log.id,
                    )
                  }
                >
                  {expandedId === log.id ? "Hide metadata" : "Show metadata"}
                </button>
                {expandedId === log.id && (
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
