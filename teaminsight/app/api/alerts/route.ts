/**
 * Alerts API Route
 * ----------------
 * GET  /api/alerts - Get all alerts (optional teamId filter)
 * POST /api/alerts - Create a new alert
 */

import { NextRequest } from "next/server";
import { connectDB, asModel } from "@/lib/db";
import Alert from "@/models/Alert";
import Team from "@/models/Team";
import Lecturer from "@/models/Lecturer";
import { sendMail } from "@/lib/mailer";
import { successResponse, ApiErrors, withErrorHandler } from "@/lib/api";

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    const filter = teamId ? { teamId } : {};
    const alerts = await asModel(Alert).find(filter).sort({ createdAt: -1 }).lean();

    return successResponse({ alerts });
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    await connectDB();

    const { teamId, severity, message } = await request.json();

    if (!teamId || !severity || !message) {
      return ApiErrors.badRequest("teamId, severity and message are required");
    }

    const teamExists = await asModel(Team).exists({ teamId });
    if (!teamExists) {
      return ApiErrors.notFound("Team");
    }

    const lecturer = await asModel(Lecturer).findOne().lean();
    const emailTo = lecturer?.email || "";

    const created = await asModel(Alert).create({
      teamId,
      severity,
      message,
      emailTo,
      emailStatus: "pending",
    });

    // Send email for critical alerts
    if (severity === "red" && emailTo) {
      try {
        await sendMail(emailTo, `Critical alert for team ${teamId}`, message);
        await asModel(Alert).findByIdAndUpdate(created._id, {
          emailStatus: "sent",
        });
      } catch {
        await asModel(Alert).findByIdAndUpdate(created._id, {
          emailStatus: "failed",
        });
      }
    }

    return successResponse({ alertId: String(created._id) }, 201);
  });
}
