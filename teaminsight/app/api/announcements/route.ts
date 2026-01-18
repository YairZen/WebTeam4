/**
 * Announcements API Route
 * -----------------------
 * GET  /api/announcements - Get announcements (optional teamId filter)
 * POST /api/announcements - Create a new announcement
 */

import { NextRequest } from "next/server";
import { connectDB, asModel } from "@/lib/db";
import Announcement from "@/models/Announcement";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    // If teamId provided: return announcements targeting "all" OR that teamId
    const filter = teamId
      ? {
          $or: [
            { targetTeams: "all" },
            { targetTeams: teamId },
            { targetTeams: { $in: [teamId] } },
          ],
        }
      : {};

    const announcements = await asModel(Announcement)
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ announcements });
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    await connectDB();

    const { title, body, targetTeams } = await request.json();

    if (!title || !body || !targetTeams) {
      return ApiErrors.badRequest("title, body and targetTeams are required");
    }

    const created = await asModel(Announcement).create({
      title,
      body,
      targetTeams,
    });

    return successResponse({ announcementId: String(created._id) }, 201);
  });
}
