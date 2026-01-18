/**
 * Reflection Turn API Route
 * -------------------------
 * POST /api/team/reflection/turn - Submit a user response in the reflection
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, ApiErrors, withErrorHandler, requireTeamAuth } from "@/lib/api";
import { getRecentSummaries } from "@/lib/api/reflection";
import ReflectionChatSession from "@/models/ReflectionChatSession";
import { runReflectionController, runReflectionInterviewer } from "@/lib/ai/gemini";
import { getEffectiveReflectionPolicy } from "@/lib/reflection/policy";
import { REFLECTION } from "@/lib/constants";

export const runtime = "nodejs";

type TurnBody = { text: string };

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const authResult = await requireTeamAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { teamId } = authResult;
    await connectDB();

    const body = (await req.json().catch(() => null)) as TurnBody | null;
    const userText = (body?.text || "").trim();
    if (!userText) {
      return ApiErrors.badRequest("Missing text");
    }

    const session = await ReflectionChatSession.findOne({ teamId, status: "in_progress" });
    if (!session) {
      const ready = await ReflectionChatSession.findOne({ teamId, status: "ready_to_submit" }).select({ _id: 1 });
      if (ready) {
        return ApiErrors.conflict(
          "Reflection is ready to submit",
          "Use /confirm to submit or /reset to start over."
        );
      }
      return ApiErrors.conflict("No active reflection session. Call /start first.");
    }

    session.messages.push({ role: "user", text: userText });
    session.currentIndex = (session.currentIndex || 0) + 1;

    // Use the snapshot. If missing (legacy sessions), snapshot now.
    if (!session.profileKey || typeof session.weeklyInstructionsSnapshot !== "string") {
      const effective = await getEffectiveReflectionPolicy();
      session.profileKey = session.profileKey || effective.profileKey || "default";
      session.weeklyInstructionsSnapshot = session.weeklyInstructionsSnapshot || effective.weeklyInstructions || "";
    }

    const recentSummaries = await getRecentSummaries(teamId);

    const effective = await getEffectiveReflectionPolicy();
    const policy = {
      profile: {
        key: session.profileKey || effective.profileKey || "default",
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

    session.aiSummary = controller.runningSummary;
    session.answers = controller.answers;
    session.clarifyCount = controller.clarifyCount;
    session.currentIndex = controller.turnCount;

    let assistantText = "";

    if (controller.readyToSubmit === true) {
      session.status = "ready_to_submit";
      assistantText =
        "סיימנו ✅ יש לי את כל מה שצריך לרפלקציה. עכשיו אפשר להגיש או לבטל ולהתחיל מחדש דרך הכפתורים למעלה.";
    } else {
      assistantText = await runReflectionInterviewer({
        messages: session.messages,
        nextIntent: controller.nextIntent,
      });
    }

    session.messages.push({ role: "model", text: assistantText });
    await session.save();

    return successResponse({
      assistantText,
      readyToSubmit: controller.readyToSubmit === true,
      status: session.status,
      runningSummary: "",
    });
  });
}
