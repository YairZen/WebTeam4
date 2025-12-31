import { GoogleGenAI } from "@google/genai";
import {
  TEAM_FEEDBACK_SYSTEM_PROMPT,
  TEAM_FREE_CHAT_SYSTEM_PROMPT,
  TEAM_REFLECTION_SYSTEM_PROMPT,
  TEAM_REFLECTION_TURN_PROMPT,
  TEAM_REFLECTION_SUMMARY_PROMPT,
} from "./prompts";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY");
}

const ai = new GoogleGenAI({ apiKey });

export type ChatMsg = { role: "user" | "model"; text: string };

async function runChat(systemPrompt: string, messages: ChatMsg[]) {
  const contents = [
    { role: "user" as const, parts: [{ text: systemPrompt }] },
    ...messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  return response.text ?? "";
}

export async function runTeamFeedbackChat(messages: ChatMsg[]) {
  return runChat(TEAM_FEEDBACK_SYSTEM_PROMPT, messages);
}

export async function runTeamFreeChat(messages: ChatMsg[]) {
  return runChat(TEAM_FREE_CHAT_SYSTEM_PROMPT, messages);
}

/**
 * NOTE:
 * This function corresponds to "model-driven" reflection (Method B).
 * For DB-driven reflection (Method A), use runReflectionTurn/runReflectionSummary below.
 */
export async function runTeamReflectionChat(messages: ChatMsg[]) {
  return runChat(TEAM_REFLECTION_SYSTEM_PROMPT, messages);
}

// =========================
// Reflection (Method A): DB/server controls order
// =========================

export type ReflectionTurnInput = {
  currentQuestion: string;
  nextQuestion: string | null;
  userAnswer: string;
};

export type ReflectionTurnResult = {
  assistantText: string;
  advance: boolean;
};

function stripCodeFences(s: string) {
  const t = (s || "").trim();
  if (t.startsWith("```")) {
    return t.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return t;
}

function safeParseTurnResult(raw: string): ReflectionTurnResult {
  const cleaned = stripCodeFences(raw);

  try {
    const obj = JSON.parse(cleaned);
    const assistantText =
      typeof obj?.assistantText === "string" ? obj.assistantText.trim() : "";
    const advance = obj?.advance === true;

    if (!assistantText) {
      return { assistantText: "קיבלתי. אפשר לפרט קצת יותר?", advance: false };
    }

    return { assistantText, advance };
  } catch {
    // Fallback: keep the app running even if the model returns bad JSON
    return { assistantText: "קיבלתי. אפשר לפרט קצת יותר?", advance: false };
  }
}

export async function runReflectionTurn(input: ReflectionTurnInput): Promise<ReflectionTurnResult> {
  const payload = JSON.stringify(input);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user" as const, parts: [{ text: TEAM_REFLECTION_TURN_PROMPT }] },
      { role: "user" as const, parts: [{ text: payload }] },
    ],
  });

  return safeParseTurnResult(response.text ?? "{}");
}

export async function runReflectionSummary(
  answers: Array<{ prompt: string; answer: string }>
): Promise<string> {
  const payload = JSON.stringify(answers);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user" as const, parts: [{ text: TEAM_REFLECTION_SUMMARY_PROMPT }] },
      { role: "user" as const, parts: [{ text: payload }] },
    ],
  });

  return (response.text ?? "").trim();
}
