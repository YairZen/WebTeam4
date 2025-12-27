import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

export async function POST(request) {
  try {
    await connectDB();
    const { teamId, accessCode } = await request.json();

    if (!teamId || !accessCode) {
      return NextResponse.json(
        { error: "teamId and accessCode are required" },
        { status: 400 }
      );
    }

    const team = await Team.findOne({ teamId, accessCode }).lean();
    if (!team) {
      return NextResponse.json({ error: "Invalid teamId/accessCode" }, { status: 401 });
    }

    return NextResponse.json(
      {
        ok: true,
        team: {
          teamId: team.teamId,
          projectName: team.projectName,
          status: team.status,
          members: team.members,
          contactEmail: team.contactEmail,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
