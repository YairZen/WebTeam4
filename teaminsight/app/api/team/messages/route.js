import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyTeamSession } from "@/lib/teamSession";
import MessageThread from "@/models/MessageThread";
import MessageMessage from "@/models/MessageMessage";

const COOKIE_NAME = "team_session";

function getTeamIdFromRequestSession(token) {
  const session = verifyTeamSession(token);
  return session?.teamId || null;
}

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const teamId = getTeamIdFromRequestSession(token);

    if (!teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threads = await MessageThread.find({ teamId })
      .sort({ updatedAt: -1 })
      .lean();

    const list = threads.map((t) => ({
      id: String(t._id),
      subject: t.subject,
      updatedAt: t.updatedAt,
      lastMessageAt: t.lastMessageAt,
      lastMessageText: t.lastMessageText,
      lastMessageRole: t.lastMessageRole,
      unreadForTeam: t.unreadForTeam || 0,
      status: t.status,
    }));

    return NextResponse.json({ ok: true, threads: list }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const teamId = getTeamIdFromRequestSession(token);

    if (!teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const subject = String(body?.subject || "").trim();
    const text = String(body?.text || "").trim();

    if (!subject || !text) {
      return NextResponse.json({ error: "subject and text are required" }, { status: 400 });
    }

    const now = new Date();

    const thread = await MessageThread.create({
      teamId,
      subject,
      lastMessageAt: now,
      lastMessageText: text,
      lastMessageRole: "team",
      unreadForLecturer: 1,
    });

    await MessageMessage.create({
      threadId: thread._id,
      teamId,
      role: "team",
      text,
    });

    return NextResponse.json(
      { ok: true, threadId: String(thread._id) },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
