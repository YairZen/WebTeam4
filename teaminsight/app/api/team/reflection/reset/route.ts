/**
 * Reflection Reset API Route
 * --------------------------
 * POST /api/team/reflection/reset - Reset current reflection session
 */

import { connectDB } from "@/lib/db";
import { successResponse, withErrorHandler, requireTeamAuth } from "@/lib/api";
import ReflectionChatSession from "@/models/ReflectionChatSession";

export const runtime = "nodejs";

export async function POST() {
  return withErrorHandler(async () => {
    const authResult = await requireTeamAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { teamId } = authResult;
    await connectDB();

    await ReflectionChatSession.deleteMany({
      teamId,
      status: { $in: ["in_progress", "ready_to_submit"] },
    });

    return successResponse({});
  });
}
