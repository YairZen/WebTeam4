import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Alert from "@/models/Alert";
import Team from "@/models/Team";
import Lecturer from "@/models/Lecturer";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { teamId, severity, message } = body;

    if (!teamId || !severity || !message) {
      return NextResponse.json(
        { error: "teamId, severity and message are required" },
        { status: 400 }
      );
    }

    // Verify team exists
    const teamExists = await Team.exists({ teamId });
    if (!teamExists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Single lecturer in system
    const lecturer = await Lecturer.findOne();
    const emailTo = lecturer?.email || "";

    const created = await Alert.create({
      teamId,
      severity,            // e.g. "low" | "medium" | "high"
      message,
      emailTo,
      emailStatus: "pending",
    });

    return NextResponse.json(
      { ok: true, alertId: created._id },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
