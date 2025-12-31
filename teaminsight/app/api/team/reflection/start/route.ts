import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import ReflectionChatSession from "@/models/ReflectionChatSession";
import { REFLECTION_QUESTIONS } from "@/lib/reflection/questions";

export const runtime = "nodejs";

async function getTeamIdFromMe(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  url.pathname = "/api/team/me";
  url.search = "";

  const cookie = req.headers.get("cookie") ?? "";
  const res = await fetch(url, { method: "GET", headers: { cookie } });
  const data = await res.json().catch(() => ({}));

  return data?.team?.teamId ?? data?.ok?.team?.teamId ?? null;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("team_session")?.value;
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = await getTeamIdFromMe(req);
  if (!teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const sessionId =
    typeof body?.sessionId === "string" && body.sessionId ? body.sessionId : crypto.randomUUID();

  await connectDB();

  let doc = await ReflectionChatSession.findOne({ teamId, sessionId });
  if (!doc) {
    const first = REFLECTION_QUESTIONS[0]?.prompt ?? "נתחיל.";
    doc = await ReflectionChatSession.create({
      teamId,
      sessionId,
      status: "in_progress",
      currentIndex: 0,
      messages: [{ role: "model", text: `בואו נעשה רפלקציה קצרה. ${first}` }],
      answers: [],
    });
  }

  return NextResponse.json({
    sessionId: doc.sessionId,
    status: doc.status,
    currentIndex: doc.currentIndex,
    total: REFLECTION_QUESTIONS.length,
    messages: doc.messages,
    aiSummary: doc.aiSummary ?? "",
  });
}
