/**
 * Team Chat API Route
 * -------------------
 * GET  /api/teams/[teamId]/chat - Get chat messages for a team
 * POST /api/teams/[teamId]/chat - Add a message to the chat
 */

import { NextRequest } from "next/server";
import { connectDB, asModel } from "@/lib/db";
import ReflectionChatSession from "@/models/ReflectionChatSession";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api";

type RouteContext = {
  params: Promise<{ teamId: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  return withErrorHandler(async () => {
    await connectDB();

    const { teamId } = await context.params;

    // Get the latest submitted reflection session for this team
    const session = await asModel(ReflectionChatSession)
      .findOne({
        teamId,
        status: "submitted",
      })
      .sort({ submittedAt: -1 })
      .lean();

    return successResponse({
      messages: session?.messages || [],
      aiSummary: session?.aiSummary || "",
      teamHealthScore: session?.teamHealthScore,
      tuckmanStage: session?.tuckmanStage,
      thsComponents: session?.thsComponents,
    });
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return withErrorHandler(async () => {
    await connectDB();

    const { teamId } = await context.params;
    const { role, text } = await request.json();

    if (!role || !text) {
      return ApiErrors.badRequest("role and text are required");
    }

    // Find the latest reflection session and add to it
    const session = await asModel(ReflectionChatSession)
      .findOne({
        teamId,
        status: { $in: ["in_progress", "ready_to_submit", "submitted"] },
      })
      .sort({ updatedAt: -1 });

    if (session) {
      session.messages.push({ role, text });
      await session.save();
    }

    return successResponse({}, 201);
  });
}
