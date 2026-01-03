import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { verifyTeamSession } from "@/lib/teamSession";
import ConversationThread from "@/models/ConversationThread";
import ConversationMessage from "@/models/ConversationMessage";

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

    const threads = await ConversationThread.find({ teamId })
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
  let session;

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
      return NextResponse.json(
        { error: "subject and text are required" },
        { status: 400 }
      );
    }

    const now = new Date();
    session = await mongoose.startSession();

    let threadId = null;

    await session.withTransaction(async () => {
      const createdThreads = await ConversationThread.create(
        [
          {
            teamId,
            subject,
            lastMessageAt: now,
            lastMessageText: text,
            lastMessageRole: "team",
            unreadForLecturer: 1,
          },
        ],
        { session }
      );

      const thread = createdThreads[0];
      threadId = thread._id;

      await ConversationMessage.create(
        [
          {
            threadId,
            role: "team",
            text,
          },
        ],
        { session }
      );
    });

    return NextResponse.json(
      { ok: true, threadId: String(threadId) },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}
