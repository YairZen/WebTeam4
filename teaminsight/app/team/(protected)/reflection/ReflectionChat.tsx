"use client";

import React, { useEffect, useMemo, useState } from "react";

type Msg = { role: "user" | "model"; text: string };

const STORAGE_KEY = "ti_reflection_sessionId";

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return String(Date.now()) + "-" + String(Math.random()).slice(2);
  }
}

export default function ReflectionChat() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    const existing = sessionStorage.getItem(STORAGE_KEY) || "";
    const sid = existing || makeId();
    sessionStorage.setItem(STORAGE_KEY, sid);
    setSessionId(sid);

    (async () => {
      const res = await fetch("/api/team/reflection/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        setMessages([{ role: "model", text: "לא הצלחתי להתחיל רפלקציה כרגע." }]);
      }
    })();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading || !sessionId) return;

    const next = [...messages, { role: "user", text } as Msg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/team/reflection/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, text }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Request failed");

      setMessages([...next, { role: "model", text: data.text ?? "" }]);
    } catch {
      setMessages([...next, { role: "model", text: "משהו השתבש. נסו שוב בעוד רגע." }]);
    } finally {
      setLoading(false);
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
      <div className="text-lg font-semibold">רפלקציה (שיחה מונחית)</div>

      <div className="rounded-xl border p-3 h-[60vh] overflow-auto bg-white">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
            <div className="text-xs opacity-60 mb-1">{m.role === "user" ? "את/ה" : "AI"}</div>
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
          placeholder="כתבו תשובה… (Enter לשליחה)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
        <button className="rounded-xl border px-4" onClick={send} disabled={!canSend} type="button">
          {loading ? "…" : "שלח"}
        </button>
      </div>

      <div className="text-xs opacity-70">טיפ: אפשר לכתוב “סכם” בכל רגע כדי לקבל סיכום.</div>
    </div>
  );
}
