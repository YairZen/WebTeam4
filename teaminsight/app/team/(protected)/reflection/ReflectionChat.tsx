"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Send,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

type Msg = { role: "user" | "model"; text: string };

type StartRes =
  | {
    ok: true;
    sessionId: string;
    status: "in_progress" | "ready_to_submit" | "submitted";
    messages: Msg[];
    runningSummary?: string;
    summary?: string;
  }
  | { error: string; details?: string };

type TurnRes =
  | {
    ok: true;
    assistantText: string;
    readyToSubmit: boolean;
    status: "in_progress" | "ready_to_submit" | "submitted";
    runningSummary: string;
  }
  | { error: string; details?: string };

type ConfirmRes =
  | {
    ok: true;
    submissionId: string;
    teamHealthScore?: number;
    tuckmanStage?: string;
    tasks?: string[];
    strengths?: string[];
  }
  | { error: string; details?: string };

type ResetRes = { ok: true } | { error: string; details?: string };

function isOk<T extends { ok: true }>(x: any): x is T {
  return !!x && typeof x === "object" && x.ok === true;
}

export default function ReflectionChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<
    "unknown" | "in_progress" | "ready_to_submit" | "submitted"
  >("unknown");

  const [errorMsg, setErrorMsg] = useState("");

  // Post-submission feedback
  const [submissionTasks, setSubmissionTasks] = useState<string[]>([]);
  const [submissionStrengths, setSubmissionStrengths] = useState<string[]>([]);
  const [teamHealthScore, setTeamHealthScore] = useState<number | null>(null);

  const canSend = useMemo(() => {
    return input.trim().length > 0 && !loading && status === "in_progress";
  }, [input, loading, status]);

  async function start() {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/team/reflection/start", {
        method: "POST",
        credentials: "include",
      });

      const data = (await res.json().catch(() => ({}))) as StartRes;

      if (!res.ok || !isOk<Extract<StartRes, { ok: true }>>(data)) {
        setStatus("unknown");
        setMessages([{ role: "model", text: "לא הצלחתי להתחיל רפלקציה כרגע." }]);
        setErrorMsg(
          ("error" in data && data.error) ? data.error : "Failed to start"
        );
        return;
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setStatus(data.status || "in_progress");
    } catch {
      setStatus("unknown");
      setMessages([{ role: "model", text: "לא הצלחתי להתחיל רפלקציה כרגע." }]);
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    start();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading || status !== "in_progress") return;

    const optimistic = [...messages, { role: "user", text } as Msg];
    setMessages(optimistic);
    setInput("");
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/team/reflection/turn", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = (await res.json().catch(() => ({}))) as TurnRes;

      if (!res.ok || !isOk<Extract<TurnRes, { ok: true }>>(data)) {
        const errText =
          ("error" in data && typeof data.error === "string" && data.error) ||
          "Request failed";
        throw new Error(errText);
      }

      const assistantText =
        (data.assistantText || "").trim() || "קיבלתי. אפשר לשתף עוד קצת?";
      setMessages([...optimistic, { role: "model", text: assistantText }]);

      setStatus(data.status || "in_progress");
    } catch (e: any) {
      setMessages([
        ...optimistic,
        { role: "model", text: "משהו השתבש. נסו שוב בעוד רגע." },
      ]);
      setErrorMsg(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/team/reflection/confirm", {
        method: "POST",
        credentials: "include",
      });

      const data = (await res.json().catch(() => ({}))) as ConfirmRes;

      if (!res.ok || !isOk<Extract<ConfirmRes, { ok: true }>>(data)) {
        const errText =
          ("error" in data && typeof data.error === "string" && data.error) ||
          "Confirm failed";
        throw new Error(errText);
      }

      setStatus("submitted");

      // Store feedback data from server
      if (data.tasks && data.tasks.length > 0) {
        setSubmissionTasks(data.tasks);
      }
      if (data.strengths && data.strengths.length > 0) {
        setSubmissionStrengths(data.strengths);
      }
      if (data.teamHealthScore) {
        setTeamHealthScore(data.teamHealthScore);
      }

      // Build completion message (without showing scores to students)
      let completionMsg = "הוגש בהצלחה ✅\n\n";

      if (data.strengths && data.strengths.length > 0) {
        completionMsg += "💪 נקודות חוזק שזיהינו בצוות:\n";
        data.strengths.forEach((s: string) => {
          completionMsg += `• ${s}\n`;
        });
        completionMsg += "\n";
      }

      if (data.tasks && data.tasks.length > 0) {
        completionMsg += "📋 משימות לשיפור לשבוע הבא:\n";
        data.tasks.forEach((task: string, i: number) => {
          completionMsg += `${i + 1}. ${task}\n`;
        });
        completionMsg += "\n";
      }

      completionMsg += "תודה על הרפלקציה! נתראה בשבוע הבא 🙌";

      setMessages((prev) => [...prev, { role: "model", text: completionMsg }]);
    } catch (e: any) {
      setErrorMsg(e?.message || "Confirm failed");
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    if (loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/team/reflection/reset", {
        method: "POST",
        credentials: "include",
      });

      const data = (await res.json().catch(() => ({}))) as ResetRes;
      if (!res.ok || !isOk<Extract<ResetRes, { ok: true }>>(data)) {
        setErrorMsg(("error" in data && data.error) ? data.error : "Reset failed");
      }
    } catch {
      setErrorMsg("Reset failed");
    } finally {
      setLoading(false);
      await start();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const statusPill =
    status === "ready_to_submit"
      ? "bg-amber-50 text-amber-900 border-amber-200/70"
      : status === "submitted"
        ? "bg-indigo-50 text-indigo-900 border-indigo-200/70"
        : status === "in_progress"
          ? "bg-purple-50 text-purple-900 border-purple-200/70"
          : "bg-slate-50 text-slate-800 border-slate-200/70";

  const statusLabel =
    status === "ready_to_submit"
      ? "מוכן להגשה"
      : status === "submitted"
        ? "הוגש"
        : status === "in_progress"
          ? "בתהליך"
          : "לא ידוע";

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-purple-100 to-indigo-200 relative overflow-hidden" dir="rtl">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-purple-300/12 blur-3xl" />
        <div className="absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-indigo-300/12 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-300/8 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl 2xl:max-w-7xl px-3 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl border border-slate-200 bg-white/45 backdrop-blur flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  רפלקציה שבועית
                </div>
                <div className="mt-1 text-sm sm:text-base text-slate-600">
                  שיחה קצרה עם ה־AI כדי לגבש רפלקציה להגשה.
                </div>
              </div>
            </div>

            <div className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1.5 text-sm ${statusPill}`}>
              <span className="font-semibold">סטטוס:</span>
              <span className="mr-2">{statusLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/45 backdrop-blur px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white/60 disabled:opacity-60"
              onClick={reset}
              disabled={loading}
              type="button"
            >
              <RotateCcw className="h-4 w-4 text-purple-700" />
              {status === "ready_to_submit" ? "ביטול והתחלה מחדש" : "איפוס"}
            </button>

            {status === "ready_to_submit" ? (
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-900/10 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 active:translate-y-[1px]"
                onClick={confirm}
                disabled={loading}
                type="button"
              >
                <CheckCircle2 className="h-4 w-4" />
                הגשה
              </button>
            ) : null}
          </div>
        </div>

        {errorMsg ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>{errorMsg}</div>
          </div>
        ) : null}

        {/* Chat card */}
        <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur-sm shadow-lg shadow-slate-900/10 overflow-hidden">
          <div className="h-[58vh] sm:h-[62vh] overflow-auto p-4 sm:p-5">
            {messages.length === 0 ? (
              <div className="text-sm text-slate-600">
                טוען את השיחה…
              </div>
            ) : (
              messages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div key={i} className={`mb-4 flex ${isUser ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[88%] sm:max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
                      <div className={`mb-1 text-xs opacity-70 ${isUser ? "text-slate-700" : "text-slate-700"}`}>
                        {isUser ? "את/ה" : "AI"}
                      </div>

                      <div
                        className={[
                          "inline-block rounded-2xl border px-4 py-3",
                          "whitespace-pre-wrap",
                          isUser
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white/20 shadow-sm shadow-indigo-900/10"
                            : "bg-white/60 text-slate-900 border-slate-200/80"
                        ].join(" ")}
                        dir="auto"
                        style={{ unicodeBidi: "plaintext" }}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-200/70 bg-white/35 backdrop-blur p-3 sm:p-4">
            <div className="flex gap-2 items-stretch">
              <textarea
                className="flex-1 rounded-2xl border border-slate-200 bg-white/55 backdrop-blur px-3 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-purple-400/30 focus:border-purple-300"
                rows={2}
                placeholder={
                  status === "ready_to_submit"
                    ? "הרפלקציה מוכנה להגשה. אפשר להגיש או לבטל ולהתחיל מחדש."
                    : "כתבו תשובה… (Enter לשליחה)"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading || status !== "in_progress"}
              />

              <button
                className={[
                  "shrink-0 inline-flex items-center gap-2",
                  "rounded-2xl px-4 sm:px-5",
                  "border",
                  canSend
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white hover:from-purple-500 hover:to-indigo-500"
                    : "bg-white/45 border-slate-200 text-slate-500",
                  "font-semibold text-sm sm:text-base",
                  "disabled:opacity-60",
                  "active:translate-y-[1px]",
                ].join(" ")}
                onClick={send}
                disabled={!canSend}
                type="button"
              >
                <Send className="h-4 w-4" />
                {loading ? "…" : "שלח"}
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              טיפ: אפשר להשתמש ב־Shift+Enter לשורה חדשה.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
