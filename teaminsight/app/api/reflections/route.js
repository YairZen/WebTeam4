import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Reflection from "@/models/Reflection";

const REFLECTION_WINDOW_HOURS = 24;
const WINDOW_MS = REFLECTION_WINDOW_HOURS * 60 * 60 * 1000;

export async function POST(request) {
  try {
    await connectDB();
    const { teamId, memberId, answers, freeText } = await request.json();

    if (!teamId || !memberId) {
      return NextResponse.json(
        { error: "teamId and memberId are required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(answers) || answers.length !== 5) {
      return NextResponse.json(
        { error: "answers must be an array of exactly 5 values" },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ teamId }).lean();
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Ensure member exists inside team.members (per your model design)
    const memberExists = (team.members || []).some((m) => m.memberId === memberId);
    if (!memberExists) {
      return NextResponse.json(
        { error: "memberId not found in this team" },
        { status: 400 }
      );
    }

    // Constraint: only one reflection per (teamId+memberId) within a window
    const since = new Date(Date.now() - WINDOW_MS);
    const already = await Reflection.exists({ teamId, memberId, createdAt: { $gte: since } });
    if (already) {
      return NextResponse.json(
        { error: `Only one reflection allowed within ${REFLECTION_WINDOW_HOURS} hours` },
        { status: 409 }
      );
    }

    const created = await Reflection.create({
      teamId,
      memberId,
      answers,
      freeText: freeText ?? "",
    });

    return NextResponse.json({ ok: true, reflectionId: created._id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
