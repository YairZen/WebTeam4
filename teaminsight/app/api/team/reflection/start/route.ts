/**
 * Reflection Start API Route
 * --------------------------
 * POST /api/team/reflection/start - Start or resume a reflection session
 */

import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { successResponse, withErrorHandler, requireTeamAuth } from "@/lib/api";
import { getRecentSummaries } from "@/lib/api/reflection";
import ReflectionChatSession from "@/models/ReflectionChatSession";
import { runReflectionController, runReflectionInterviewer } from "@/lib/ai/gemini";
import { getEffectiveReflectionPolicy } from "@/lib/reflection/policy";
import { REFLECTION } from "@/lib/constants";

export const runtime = "nodejs";

type Msg = { role: "user" | "model"; text: string };

export async function POST() {
  return withErrorHandler(async () => {
    const authResult = await requireTeamAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { teamId } = authResult;
    await connectDB();

    let session = await ReflectionChatSession.findOne({
      teamId,
      status: { $in: ["in_progress", "ready_to_submit"] },
    });

    // Snapshot policy for NEW sessions
    const effective = await getEffectiveReflectionPolicy();

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
        profileKey: effective.profileKey || "default",
        weeklyInstructionsSnapshot: effective.weeklyInstructions || "",
        reflectionScore: null,
        reflectionColor: null,
        reflectionReasons: [],
      });
    }

    // Return existing session if messages exist
    if ((session.messages || []).length > 0) {
      return successResponse({
        sessionId: session.sessionId,
        status: session.status,
        messages: session.messages as Msg[],
        runningSummary: "",
        summary: "",
      });
    }

    // Legacy safety: lock profile if not set
    const currentKey = (session.profileKey || "").trim();
    if (!currentKey || currentKey === "default") {
      session.profileKey = effective.profileKey || "default";
    }

    if (!session.weeklyInstructionsSnapshot || session.weeklyInstructionsSnapshot.trim().length === 0) {
      session.weeklyInstructionsSnapshot = effective.weeklyInstructions || "";
    }

    const recentSummaries = await getRecentSummaries(teamId);

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
      maxTurns: REFLECTION.MAX_TURNS,
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

    return successResponse({
      sessionId: session.sessionId,
      status: session.status,
      messages: session.messages as Msg[],
      runningSummary: "",
      summary: "",
    });
  });
}
