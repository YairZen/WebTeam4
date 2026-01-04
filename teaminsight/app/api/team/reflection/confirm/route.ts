import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyTeamSession } from "@/lib/teamSession";

import ReflectionChatSession from "@/models/ReflectionChatSession";

export const runtime = "nodejs";

function jsonError(status: number, error: string, details?: string) {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status });
}

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("team_session")?.value;

    const payload = token ? verifyTeamSession(token) : null;
    const teamId = payload?.teamId;
    if (!teamId) {
      return jsonError(
        401,
        "Unauthorized",
        "Missing/invalid team_session cookie or payload.teamId"
      );
    }

    const session = await ReflectionChatSession.findOne({
      teamId,
      status: "ready_to_submit",
    });

    if (!session) return jsonError(409, "Nothing to confirm");

    const summary = (session.aiSummary || "").trim();
    if (!summary) return jsonError(400, "Missing summary. Call /finish first.");

    session.status = "submitted";
    session.submittedAt = new Date(); // <-- added
    await session.save();

    // Keep the response shape to avoid frontend changes:
    return NextResponse.json({ ok: true, submissionId: String(session._id) });
  } catch (err: any) {
    console.error("reflection/confirm error:", err);
    return jsonError(500, "Internal Server Error", err?.message || "Unknown");
  }
}
