import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

export async function GET() {
  try {
    await connectDB();

    const teams = await Team.find().lean();

    const summary = {
      totalTeams: teams.length,
      redTeams: teams.filter(t => t.status === "red").length,
      yellowTeams: teams.filter(t => t.status === "yellow").length,
      greenTeams: teams.filter(t => t.status === "green").length,
      note: "Most teams are progressing well, some require attention",
    };

    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
