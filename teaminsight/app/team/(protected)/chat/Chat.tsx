"use client";

import React, { useMemo, useState } from "react";

type Msg = { role: "user" | "model"; text: string };

const INITIAL_MESSAGES: Msg[] = [
  {
    role: "model",
    text: "היי 👋 אני כאן לצ׳אט פתוח לצוות. על מה תרצו לעבוד היום? (תיאום, חלוקת משימות, Git, פגישות, תקשורת וכו׳)",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Msg[] = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/team/ai/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || "Request failed");

      setMessages([...next, { role: "model", text: (data as any).text ?? "" }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "model",
          text: "לא הצלחתי לשלוח כרגע. נסו שוב עוד רגע.",
        },
      ]);
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

  function clearChat() {
    setMessages(INITIAL_MESSAGES);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">Chat</div>
        <button
          type="button"
          className="rounded-xl border px-3 py-1 text-xs hover:bg-gray-50"
          onClick={clearChat}
          disabled={loading}
        >
          נקה שיחה
        </button>
      </div>

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
          placeholder="כתבו הודעה… (Enter לשליחה, Shift+Enter לשורה חדשה)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
        <button className="rounded-xl border px-4" onClick={send} disabled={!canSend} type="button">
          {loading ? "…" : "שלח"}
        </button>
      </div>


    </div>
  );
}
