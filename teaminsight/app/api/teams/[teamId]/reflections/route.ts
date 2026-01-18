/**
 * Team Reflections API Route
 * --------------------------
 * GET /api/teams/[teamId]/reflections - Get reflections for a specific team
 */

import { NextRequest } from "next/server";
import { connectDB, asModel } from "@/lib/db";
import ReflectionChatSession from "@/models/ReflectionChatSession";
import Team from "@/models/Team";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api";

type RouteContext = {
  params: Promise<{ teamId: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  return withErrorHandler(async () => {
    await connectDB();

    const { teamId } = await context.params;

    const teamExists = await asModel(Team).exists({ teamId });
    if (!teamExists) {
      return ApiErrors.notFound("Team");
    }

    const reflections = await asModel(ReflectionChatSession)
      .find({ teamId })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ reflections });
  });
}
