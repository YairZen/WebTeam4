"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type ReflectionMsg = { role: "user" | "model"; text: string; createdAt?: string };

type THSComponent = {
  score: number;
  breakdown: string;
  level?: string;
};

type SessionListItem = {
  sessionId: string;
  status: "in_progress" | "ready_to_submit" | "submitted";
  createdAt?: string;
  updatedAt?: string;
  aiSummary?: string;
  currentIndex?: number;
  messagesCount?: number;
  teamHealthScore?: number;
  reflectionScore?: number;
  reflectionColor?: "green" | "yellow" | "red";
  tuckmanStage?: string;
};

type ActiveSession = {
  sessionId: string;
  status: "in_progress" | "ready_to_submit" | "submitted";
  createdAt?: string;
  updatedAt?: string;
  aiSummary?: string;
  currentIndex?: number;
  messages: ReflectionMsg[];

  // THS Data
  teamHealthScore?: number;
  thsComponents?: {
    participationEquity: THSComponent;
    constructiveSentiment: THSComponent;
    reflectiveDepth: THSComponent;
    conflictResolution: THSComponent;
  };
  tuckmanStage?: string;
  tuckmanExplanation?: string;
  riskLevel?: number;
  riskExplanation?: string;
  anomalyFlags?: string[];
  strengths?: string[];
  concerns?: string[];
  recommendations?: string[];

  // Legacy
  reflectionScore?: number;
  reflectionColor?: "green" | "yellow" | "red";
  reflectionReasons?: string[];
  qualityBreakdown?: string;
  riskBreakdown?: string;
  complianceBreakdown?: string;
};

export default function LecturerTeamChatPage() {
  const { teamId } = useParams() as { teamId: string };

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "analysis">("analysis");

  async function load(sessionId?: string) {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    const qs = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
    const res = await fetch(`/api/teams/${encodeURIComponent(teamId)}/reflections/chat${qs}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.ok) {
      setError(data?.error || "Failed to load reflection chat.");
      setSessions([]);
      setActive(null);
      setLoading(false);
      return;
    }

    setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    setActive(data.active ?? null);

    const sid = data?.active?.sessionId || "";
    setSelectedSessionId(sid);

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  function onChangeSession(nextId: string) {
    setSelectedSessionId(nextId);
    load(nextId);
  }

  const title = useMemo(() => `Team ${teamId} — Reflection Analysis`, [teamId]);

  return (
    <main className="min-h-screen bg-gray-100 w-full py-10">
      <div className="w-full px-4 md:px-8 max-w-screen-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-gray-600 mt-1 text-sm">
              ניתוח רפלקציה מבוסס Team Health Score (THS)
            </p>
          </div>

          <Link
            href={`/lecturer/teams/${teamId}`}
            className="text-blue-600 hover:underline text-sm whitespace-nowrap"
          >
            ← Back to Team
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Session:</div>
            <select
              value={selectedSessionId}
              onChange={(e) => onChangeSession(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
              disabled={loading || sessions.length === 0}
            >
              {sessions.length === 0 ? (
                <option value="">No sessions</option>
              ) : (
                sessions.map((s) => (
                  <option key={s.sessionId} value={s.sessionId}>
                    {s.sessionId.slice(0, 8)}… • {statusLabel(s.status)} •{" "}
                    {s.teamHealthScore ? `THS: ${s.teamHealthScore}` : `${s.messagesCount ?? 0} msgs`}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("analysis")}
              className={`text-sm px-3 py-2 rounded-md border ${
                activeTab === "analysis" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white hover:bg-gray-50"
              }`}
            >
              📊 Analysis
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`text-sm px-3 py-2 rounded-md border ${
                activeTab === "chat" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white hover:bg-gray-50"
              }`}
            >
              💬 Chat
            </button>
            <button
              type="button"
              onClick={() => load(selectedSessionId || undefined)}
              className="text-sm px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-600">Loading…</div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-red-700 bg-red-50">{error}</div>
        ) : !active ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-600">
            No reflection session found for this team.
          </div>
        ) : activeTab === "analysis" ? (
          <AnalysisView active={active} />
        ) : (
          <ChatView active={active} />
        )}
      </div>
    </main>
  );
}

/* =========================
   Analysis View Component
   ========================= */
function AnalysisView({ active }: { active: ActiveSession }) {
  const hasThsData = active.teamHealthScore != null;

  return (
    <div className="space-y-6">
      {/* THS Score Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">📊 Team Health Score (THS)</h2>
            {active.tuckmanStage && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                🎭 {tuckmanLabel(active.tuckmanStage)}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {hasThsData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Main Score */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4 flex items-center justify-center gap-8 py-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl font-bold" style={{ color: scoreColor(active.teamHealthScore || 0) }}>
                    {active.teamHealthScore || 0}
                  </div>
                  <div className="text-gray-600 mt-2">Team Health Score</div>
                </div>

                {active.riskLevel != null && (
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: riskColor(active.riskLevel) }}>
                      {active.riskLevel}/10
                    </div>
                    <div className="text-gray-600 mt-2">Risk Level</div>
                  </div>
                )}
              </div>

              {/* THS Components */}
              {active.thsComponents && (
                <>
                  <THSComponentCard
                    title="🤝 Participation Equity"
                    weight="25%"
                    component={active.thsComponents.participationEquity}
                  />
                  <THSComponentCard
                    title="💬 Constructive Sentiment"
                    weight="15%"
                    component={active.thsComponents.constructiveSentiment}
                  />
                  <THSComponentCard
                    title="🧠 Reflective Depth"
                    weight="40%"
                    component={active.thsComponents.reflectiveDepth}
                    extra={active.thsComponents.reflectiveDepth.level && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {depthLabel(active.thsComponents.reflectiveDepth.level)}
                      </span>
                    )}
                  />
                  <THSComponentCard
                    title="⚖️ Conflict Resolution"
                    weight="20%"
                    component={active.thsComponents.conflictResolution}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>לא זמין ניתוח THS עבור סשן זה.</p>
              <p className="text-sm mt-2">הסשן צריך להיות מוגש (submitted) כדי לקבל ניתוח.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tuckman Stage Explanation */}
      {active.tuckmanStage && active.tuckmanExplanation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-3">🎭 שלב Tuckman: {tuckmanLabel(active.tuckmanStage)}</h3>
          <p className="text-gray-700" dir="rtl">{active.tuckmanExplanation}</p>
        </div>
      )}

      {/* Anomaly Flags */}
      {active.anomalyFlags && active.anomalyFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3 text-red-700">🚨 התראות</h3>
          <div className="flex flex-wrap gap-2">
            {active.anomalyFlags.map((flag, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                {anomalyLabel(flag)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        {active.strengths && active.strengths.length > 0 && (
          <InsightCard title="💪 חוזקות" items={active.strengths} colorClass="bg-green-50 border-green-200" />
        )}

        {/* Concerns */}
        {active.concerns && active.concerns.length > 0 && (
          <InsightCard title="⚠️ חששות" items={active.concerns} colorClass="bg-yellow-50 border-yellow-200" />
        )}

        {/* Recommendations */}
        {active.recommendations && active.recommendations.length > 0 && (
          <InsightCard title="💡 המלצות" items={active.recommendations} colorClass="bg-blue-50 border-blue-200" />
        )}
      </div>

      {/* Risk Explanation */}
      {active.riskExplanation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-3">📋 הסבר רמת הסיכון</h3>
          <p className="text-gray-700" dir="rtl">{active.riskExplanation}</p>
        </div>
      )}

      {/* AI Summary */}
      {active.aiSummary && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-lg">📝 AI Summary</h3>
          </div>
          <div className="p-6">
            <div className="text-gray-700 whitespace-pre-wrap" dir="rtl">{active.aiSummary}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Chat View Component
   ========================= */
function ChatView({ active }: { active: ActiveSession }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="font-semibold">💬 Conversation</div>
        <div className="text-sm text-gray-600">
          {statusLabel(active.status)} • Messages: {active.messages?.length ?? 0}
        </div>
      </div>

      <div className="p-6 space-y-3">
        {active.messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%]">
                <div className={`text-xs mb-1 ${isUser ? "text-right" : "text-left"} text-gray-500`}>
                  {isUser ? "סטודנט/ים" : "AI"}
                  {m.createdAt ? ` • ${new Date(m.createdAt).toLocaleString()}` : ""}
                </div>

                <div
                  className={`rounded-2xl border px-4 py-3 whitespace-pre-wrap ${
                    isUser
                      ? "bg-blue-50 border-blue-100 text-gray-900"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                  dir="auto"
                  style={{ unicodeBidi: "plaintext" }}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   Helper Components
   ========================= */
function THSComponentCard({
  title,
  weight,
  component,
  extra,
}: {
  title: string;
  weight: string;
  component: THSComponent;
  extra?: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{title}</span>
        <span className="text-xs text-gray-500">Weight: {weight}</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold" style={{ color: scoreColor(component.score) }}>
          {component.score}
        </span>
        <span className="text-gray-500 text-sm">/100</span>
        {extra}
      </div>
      {component.breakdown && (
        <p className="text-xs text-gray-600" dir="rtl">{component.breakdown}</p>
      )}
    </div>
  );
}

function InsightCard({
  title,
  items,
  colorClass,
}: {
  title: string;
  items: string[];
  colorClass: string;
}) {
  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-700" dir="rtl">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

/* =========================
   Helper Functions
   ========================= */
function statusLabel(s: "in_progress" | "ready_to_submit" | "submitted") {
  if (s === "in_progress") return "In progress";
  if (s === "ready_to_submit") return "Ready to submit";
  return "Submitted";
}

function tuckmanLabel(stage: string) {
  const labels: Record<string, string> = {
    forming: "Forming (גיבוש)",
    storming: "Storming (סערה)",
    norming: "Norming (נורמות)",
    performing: "Performing (ביצוע)",
    adjourning: "Adjourning (סיום)",
  };
  return labels[stage] || stage;
}

function depthLabel(level: string) {
  const labels: Record<string, string> = {
    descriptive: "תיאורי",
    comparative: "השוואתי",
    critical: "ביקורתי",
    transformative: "טרנספורמטיבי",
  };
  return labels[level] || level;
}

function anomalyLabel(flag: string) {
  const labels: Record<string, string> = {
    red_zone: "🔴 אזור אדום - THS נמוך",
    silent_dropout: "🔇 חבר צוות שותק",
    toxic_spike: "☠️ זינוק בשליליות",
    chronic_issue: "🔁 בעיה כרונית",
  };
  return labels[flag] || flag;
}

function scoreColor(score: number): string {
  if (score >= 75) return "#16a34a"; // green
  if (score >= 45) return "#ca8a04"; // yellow
  return "#dc2626"; // red
}

function riskColor(risk: number): string {
  if (risk <= 3) return "#16a34a"; // green - low risk
  if (risk <= 6) return "#ca8a04"; // yellow - medium risk
  return "#dc2626"; // red - high risk
}
