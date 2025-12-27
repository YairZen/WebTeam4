import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectDB();

  const { teamId, accessCode } = await request.json();

  const team = await Team.findOne({ teamId, accessCode });

  if (!team) {
    return NextResponse.json({ error: "Invalid team" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
