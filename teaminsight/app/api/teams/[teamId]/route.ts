/**
 * Team Detail API Route
 * ---------------------
 * GET    /api/teams/[teamId] - Get team details
 * PUT    /api/teams/[teamId] - Update team
 * DELETE /api/teams/[teamId] - Delete team
 */

import { NextRequest } from "next/server";
import { connectDB, asModel } from "@/lib/db";
import Team from "@/models/Team";
import Alert from "@/models/Alert";
import Lecturer from "@/models/Lecturer";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api";
import { ALERT_STATUSES, isValidStatus } from "@/lib/constants";

type RouteContext = {
  params: Promise<{ teamId: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  return withErrorHandler(async () => {
    await connectDB();

    const { teamId } = await context.params;

    if (!teamId) {
      return ApiErrors.badRequest("teamId is required");
    }

    const team = await asModel(Team).findOne({ teamId }).lean();

    if (!team) {
      return ApiErrors.notFound("Team");
    }

    return successResponse({ team });
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return withErrorHandler(async () => {
    await connectDB();

    const { teamId } = await context.params;

    if (!teamId) {
      return ApiErrors.badRequest("teamId is required");
    }

    const updates = await request.json();

    const team = await asModel(Team).findOne({ teamId });
    if (!team) {
      return ApiErrors.notFound("Team");
    }

    const prevStatus = team.status;

    // Controlled updates only
    if (typeof updates.projectName === "string") {
      team.projectName = updates.projectName;
    }

    if (typeof updates.accessCode === "string") {
      team.accessCode = updates.accessCode;
    }

    if (typeof updates.contactEmail === "string") {
      team.contactEmail = updates.contactEmail;
    }

    if (Array.isArray(updates.members)) {
      team.members = updates.members;
    }

    if (isValidStatus(updates.status)) {
      team.status = updates.status;
    }

    await team.save();

    // Create alert only if status changed to abnormal
    if (team.status !== prevStatus && ALERT_STATUSES.has(team.status)) {
      const lecturer = await asModel(Lecturer).findOne().lean();

      await asModel(Alert).create({
        teamId: team.teamId,
        severity: team.status,
        message: `Team status changed from ${prevStatus} to ${team.status}`,
        emailTo: lecturer?.email || "",
        emailStatus: "pending",
      });
    }

    return successResponse({ teamId: team.teamId });
  });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  return withErrorHandler(async () => {
    await connectDB();

    const { teamId } = await context.params;

    if (!teamId) {
      return ApiErrors.badRequest("teamId is required");
    }

    const deleted = await asModel(Team).findOneAndDelete({
      teamId: String(teamId).trim(),
    });

    if (!deleted) {
      return ApiErrors.notFound("Team");
    }

    return successResponse({});
  });
}
