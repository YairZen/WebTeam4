/**
 * Team Me API Route
 * -----------------
 * GET /api/team/me - Get current authenticated team
 */

import { connectDB, asModel } from "@/lib/db";
import Team from "@/models/Team";
import { successResponse, ApiErrors, withErrorHandler, requireTeamAuth } from "@/lib/api";

export async function GET() {
  return withErrorHandler(async () => {
    const authResult = await requireTeamAuth();

    if ("error" in authResult) {
      return authResult.error;
    }

    await connectDB();
    const team = await asModel(Team).findOne({ teamId: authResult.teamId }).lean();

    if (!team) {
      return ApiErrors.notFound("Team");
    }

    return successResponse({
      team: {
        teamId: team.teamId,
        projectName: team.projectName,
        status: team.status,
        members: team.members,
        contactEmail: team.contactEmail,
      },
    });
  });
}
