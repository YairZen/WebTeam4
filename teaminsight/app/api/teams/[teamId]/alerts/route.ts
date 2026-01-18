/**
 * Team Alerts API Route
 * ---------------------
 * GET /api/teams/[teamId]/alerts - Get alerts for a specific team
 */

import { NextRequest } from "next/server";
import { connectDB, asModel } from "@/lib/db";
import Alert from "@/models/Alert";
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

    const alerts = await asModel(Alert)
      .find({ teamId })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ alerts });
  });
}
