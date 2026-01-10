"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  | { ok: true; submissionId: string }
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
      setMessages((prev) => [...prev, { role: "model", text: "הוגש בהצלחה ✅" }]);
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

  return (
    <div className="flex flex-col gap-3 p-4" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">רפלקציה שבועית</div>

        <div className="flex gap-2">
          <button
            className="rounded-xl border px-3 py-2 text-sm"
            onClick={reset}
            disabled={loading}
            type="button"
          >
            {status === "ready_to_submit" ? "ביטול והתחלה מחדש" : "איפוס"}
          </button>

          {status === "ready_to_submit" ? (
            <button
              className="rounded-xl bg-black px-3 py-2 text-sm text-white"
              onClick={confirm}
              disabled={loading}
              type="button"
            >
              הגשה
            </button>
          ) : null}
        </div>
      </div>

      {errorMsg ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errorMsg}
        </div>
      ) : null}

      <div className="rounded-xl border p-3 h-[60vh] overflow-auto bg-white">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}
          >
            <div className="text-xs opacity-60 mb-1">
              {m.role === "user" ? "את/ה" : "AI"}
            </div>
            <div
              className="inline-block rounded-xl border px-3 py-2 max-w-[85%] whitespace-pre-wrap"
              dir="auto"
              style={{ unicodeBidi: "plaintext" }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          className="flex-1 rounded-xl border p-2"
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
          className="rounded-xl border px-4"
          onClick={send}
          disabled={!canSend}
          type="button"
        >
          {loading ? "…" : "שלח"}
        </button>
      </div>
    </div>
  );
}
