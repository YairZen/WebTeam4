import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Reflection from "@/models/Reflection";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const teamIdsParam = searchParams.get("teamIds"); // "TEAM-01,TEAM-02"
    if (!teamIdsParam) {
      return NextResponse.json(
        { error: "teamIds query param is required (comma-separated)" },
        { status: 400 }
      );
    }

    const teamIds = teamIdsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (teamIds.length < 2) {
      return NextResponse.json(
        { error: "Provide at least 2 teamIds" },
        { status: 400 }
      );
    }

    // Weekly average score per team (avg of all 5 answers per reflection, grouped by isoWeek)
    const data = await Reflection.aggregate([
      { $match: { teamId: { $in: teamIds } } },
      {
        $project: {
          teamId: 1,
          createdAt: 1,
          avgScore: { $avg: "$answers" },
          isoWeek: { $isoWeek: "$createdAt" },
          isoYear: { $isoWeekYear: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { teamId: "$teamId", isoYear: "$isoYear", isoWeek: "$isoWeek" },
          avgScore: { $avg: "$avgScore" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.isoYear": 1, "_id.isoWeek": 1 } },
      {
        $project: {
          _id: 0,
          teamId: "$_id.teamId",
          isoYear: "$_id.isoYear",
          isoWeek: "$_id.isoWeek",
          avgScore: 1,
          count: 1,
        },
      },
    ]);

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
