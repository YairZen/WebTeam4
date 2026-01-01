import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Reflection from "@/models/Reflection";

export async function GET() {
  try {
    await connectDB();

    // 1) Status distribution
    const statusCounts = await Team.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    // 2) Average answers per question across all reflections
    const avgAnswers = await Reflection.aggregate([
      { $project: { answers: 1 } },
      { $unwind: { path: "$answers", includeArrayIndex: "qIndex" } },
      { $group: { _id: "$qIndex", avg: { $avg: "$answers" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, questionIndex: "$_id", avg: 1, count: 1 } },
    ]);

    return NextResponse.json(
      { ok: true, statusCounts, avgAnswers },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
