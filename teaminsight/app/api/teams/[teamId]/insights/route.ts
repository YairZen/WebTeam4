/**
 * Team Insights API Route
 * -----------------------
 * GET /api/teams/[teamId]/insights - Get AI-generated insights for a team
 */

import { NextRequest } from "next/server";
import { connectDB, asModel } from "@/lib/db";
import Team from "@/models/Team";
import Alert from "@/models/Alert";
import ReflectionChatSession from "@/models/ReflectionChatSession";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api";

type RouteContext = {
  params: Promise<{ teamId: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  return withErrorHandler(async () => {
    await connectDB();

    const { teamId } = await context.params;

    const team = await asModel(Team).findOne({ teamId }).lean();
    if (!team) {
      return ApiErrors.notFound("Team");
    }

    const alertsCount = await asModel(Alert).countDocuments({ teamId });
    const reflectionsCount = await asModel(ReflectionChatSession).countDocuments({
      teamId,
    });

    const strengths: string[] = [];
    const risks: string[] = [];

    if (team.status === "green") {
      strengths.push("Good collaboration and stable progress");
    }
    if (team.status === "yellow") {
      risks.push("Some coordination or workload imbalance detected");
    }
    if (team.status === "red") {
      risks.push("High risk: intervention recommended");
    }
    if (alertsCount > 0) {
      risks.push("Alerts were raised for this team");
    }
    if (reflectionsCount === 0) {
      risks.push("No reflections submitted yet");
    }

    return successResponse({
      teamId,
      insights: {
        status: team.status,
        strengths,
        risks,
        metrics: {
          alertsCount,
          reflectionsCount,
        },
      },
    });
  });
}
