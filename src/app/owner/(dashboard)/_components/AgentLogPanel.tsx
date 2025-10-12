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
    const formatter = new Intl.DateTimeFormat("en", {
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
    () => logs.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [logs],
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Agent Sessions</h2>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
          {logs.length} recent
        </span>
      </header>
      <div className="space-y-3">
        {!logs.length && (
          <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
            No agent sessions logged yet. Once the AI chat or librarian agent is
            integrated with the tracking hook, sessions will appear here.
          </p>
        )}
        {renderedLogs.map((log) => (
          <article
            key={log.id}
            className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/80 transition hover:border-white/20"
          >
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">
                  {log.visitor_name ?? "Anonymous"}
                </p>
                <p className="text-xs uppercase tracking-wide text-white/40">
                  {log.agent_type}
                </p>
              </div>
              <div className="text-xs text-white/50">
                {formatTimestamp(log.created_at)}
              </div>
            </header>

            <dl className="mt-3 space-y-1">
              {log.visitor_email && (
                <div className="flex gap-2">
                  <dt className="w-24 text-white/50">Email</dt>
                  <dd className="flex-1 text-white/80">{log.visitor_email}</dd>
                </div>
              )}
              {log.referrer && (
                <div className="flex gap-2">
                  <dt className="w-24 text-white/50">Source</dt>
                  <dd className="flex-1 text-white/80">{log.referrer}</dd>
                </div>
              )}
              {log.intent && (
                <div className="flex gap-2">
                  <dt className="w-24 text-white/50">Intent</dt>
                  <dd className="flex-1 text-white/80">{log.intent}</dd>
                </div>
              )}
            </dl>

            {log.metadata && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((current) =>
                      current === log.id ? null : log.id,
                    )
                  }
                  className="text-xs font-medium text-accent hover:underline"
                >
                  {expandedId === log.id ? "Hide metadata" : "Show metadata"}
                </button>
                {expandedId === log.id && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-black/50 p-3 text-xs text-accent">
{JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
