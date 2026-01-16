import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { verifyTeamSession } from "@/lib/teamSession";

const COOKIE_NAME = "team_session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    // Verify the session token
    const session = verifyTeamSession(token);

    // If no session exists or it is invalid, return null instead of 401 error.
    // This allows pages like /team/join to check auth status without triggering browser console errors.
    if (!session?.teamId) {
      return NextResponse.json(
        { ok: true, team: null }, 
        { status: 200 }           
      );
    }

    await connectDB();
    const team = await Team.findOne({ teamId: session.teamId }).lean();

    // If session is valid but team is not found in DB (e.g. deleted), return null cleanly.
    if (!team) {
       return NextResponse.json({ ok: true, team: null }, { status: 200 });
    }

    // Return the authenticated team details
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
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}