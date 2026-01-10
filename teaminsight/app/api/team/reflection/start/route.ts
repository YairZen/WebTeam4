import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

import { connectDB } from "@/lib/db";
import { verifyTeamSession } from "@/lib/teamSession";

import ReflectionChatSession from "@/models/ReflectionChatSession";
import { runReflectionController, runReflectionInterviewer } from "@/lib/ai/gemini";
import { REFLECTION_TOPICS } from "@/lib/reflection/topics";
import { getEffectiveReflectionPolicy } from "@/lib/reflection/policy";

export const runtime = "nodejs";

type Msg = { role: "user" | "model"; text: string };

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
      return jsonError(401, "Unauthorized", "Missing/invalid team_session cookie or payload.teamId");
    }

    let session = await ReflectionChatSession.findOne({
      teamId,
      status: { $in: ["in_progress", "ready_to_submit"] },
    });

    if (!session) {
      session = await ReflectionChatSession.create({
        teamId,
        sessionId: crypto.randomUUID(),
        status: "in_progress",
        currentIndex: 0,
        clarifyCount: 0,
        messages: [],
        answers: [],
        aiSummary: "",
        submittedAt: null,
        profileKey: "default",
        weeklyInstructionsSnapshot: "",
        reflectionScore: null,
        reflectionColor: null,
        reflectionReasons: [],
      });
    }

    // Never return summary to the student.
    if ((session.messages || []).length > 0) {
      return NextResponse.json({
        ok: true,
        sessionId: session.sessionId,
        status: session.status,
        messages: session.messages as Msg[],
        runningSummary: "",
        summary: "",
      });
    }

    // Snapshot policy at the beginning (only when no messages exist).
    const effective = await getEffectiveReflectionPolicy();
    session.profileKey = session.profileKey || effective.profileKey || "default";
    session.weeklyInstructionsSnapshot = effective.weeklyInstructions || "";

    // Recent submitted summaries (last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentSubmitted = await ReflectionChatSession.find({
      teamId,
      status: "submitted",
      updatedAt: { $gte: fourteenDaysAgo },
    })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select({ aiSummary: 1 })
      .lean();

    const recentSummaries = recentSubmitted
      .map((r: any) => r?.aiSummary)
      .filter((s: any) => typeof s === "string" && s.trim().length > 0);

    const policy = {
      profile: {
        key: effective.profile.key,
        title: effective.profile.title,
        controllerAddendum: effective.profile.controllerAddendum,
      },
      weeklyInstructions: session.weeklyInstructionsSnapshot || "",
    };

    const controller = await runReflectionController({
      messages: session.messages,
      answers: session.answers,
      runningSummary: session.aiSummary || "",
      clarifyCount: session.clarifyCount || 0,
      turnCount: session.currentIndex || 0,
      maxTurns: 16,
      recentSummaries,
      policy,
    });

    const assistantText = await runReflectionInterviewer({
      messages: session.messages,
      nextIntent: controller.nextIntent,
    });

    session.messages.push({ role: "model", text: assistantText });
    session.aiSummary = controller.runningSummary;
    session.answers = controller.answers;
    session.clarifyCount = controller.clarifyCount;
    session.currentIndex = controller.turnCount;

    await session.save();

    return NextResponse.json({
      ok: true,
      sessionId: session.sessionId,
      status: session.status,
      messages: session.messages as Msg[],
      runningSummary: "",
      summary: "",
    });
  } catch (err: any) {
    console.error("reflection/start error:", err);
    return jsonError(500, "Internal Server Error", err?.message || "Unknown");
  }
}
