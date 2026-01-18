/**
 * Teams API Route
 * ---------------
 * GET  /api/teams - List all teams with optional sorting
 * POST /api/teams - Create a new team
 */

import { NextRequest } from "next/server";
import { connectDB, asModel } from "@/lib/db";
import Team from "@/models/Team";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api";
import { isValidStatus, TEAM_STATUSES } from "@/lib/constants";

const ALLOWED_SORT_FIELDS = new Set(["teamId", "projectName", "status", "createdAt"]);

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "teamId";
    const order = (searchParams.get("order") || "asc").toLowerCase() === "desc" ? -1 : 1;

    const sortField = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : "teamId";

    const teams = await asModel(Team)
      .find({})
      .select("teamId projectName status contactEmail members createdAt")
      .sort({ [sortField]: order })
      .lean();

    return successResponse({ teams });
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    await connectDB();
    const body = await request.json();

    const {
      teamId,
      projectName,
      accessCode,
      contactEmail,
      members = [],
      status = "green",
    } = body;

    if (!teamId || !projectName || !accessCode || !contactEmail) {
      return ApiErrors.badRequest("teamId, projectName, accessCode, contactEmail are required");
    }

    if (status && !isValidStatus(status)) {
      return ApiErrors.badRequest(`status must be one of: ${TEAM_STATUSES.join(", ")}`);
    }

    const exists = await asModel(Team).exists({ teamId });
    if (exists) {
      return ApiErrors.conflict("teamId already exists");
    }

    const created = await asModel(Team).create({
      teamId,
      projectName,
      accessCode,
      contactEmail,
      members,
      status,
    });

    return successResponse({ teamId: created.teamId }, 201);
  });
}
