import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, body: message, targetTeams } = body;

    if (!title || !message || !targetTeams) {
      return NextResponse.json(
        { error: "title, body and targetTeams are required" },
        { status: 400 }
      );
    }

    const created = await Announcement.create({
      title,
      body: message,
      targetTeams,
    });

    return NextResponse.json(
      { ok: true, announcementId: created._id },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
