import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Reflection from "@/models/Reflection";

/**
 * Constraint (application-level):
 * Allow only one Reflection per (teamId + memberId) within a defined time period.
 * Change REFLECTION_WINDOW_HOURS if needed.
 */
const REFLECTION_WINDOW_HOURS = 24; // "defined time period" - set to 24h by default
const WINDOW_MS = REFLECTION_WINDOW_HOURS * 60 * 60 * 1000;

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { teamId, memberId, answers, freeText } = body;

    // Basic validation (keep it simple, per course flow)
    if (!teamId || !memberId) {
      return NextResponse.json(
        { error: "teamId and memberId are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers) || answers.length !== 5) {
      return NextResponse.json(
        { error: "answers must be an array of exactly 5 numbers" },
        { status: 400 }
      );
    }

    // Verify Team exists (per Relationships)
    const teamExists = await Team.exists({ teamId });
    if (!teamExists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Constraint: only one reflection per teamId + memberId within time window
    const since = new Date(Date.now() - WINDOW_MS);
    const alreadySubmitted = await Reflection.exists({
      teamId,
      memberId,
      createdAt: { $gte: since },
    });

    if (alreadySubmitted) {
      return NextResponse.json(
        {
          error: `Only one reflection per teamId+memberId is allowed within ${REFLECTION_WINDOW_HOURS} hours`,
        },
        { status: 409 }
      );
    }

    // Create Reflection
    const created = await Reflection.create({
      teamId,
      memberId,
      answers,
      freeText: freeText ?? "",
    });

    return NextResponse.json(
      {
        ok: true,
        reflectionId: created._id,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
