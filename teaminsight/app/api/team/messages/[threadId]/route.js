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

export async function GET(_request, { params }) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const teamId = getTeamIdFromRequestSession(token);

    if (!teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = params?.threadId;
    if (!threadId) {
      return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return NextResponse.json({ error: "Invalid threadId" }, { status: 400 });
    }

    const thread = await ConversationThread.findOne({ _id: threadId, teamId }).lean();
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await ConversationMessage.find({ threadId })
      .sort({ createdAt: 1 })
      .lean();

    await ConversationThread.updateOne(
      { _id: threadId, teamId },
      { $set: { unreadForTeam: 0 } }
    );

    return NextResponse.json(
      {
        ok: true,
        thread: {
          id: String(thread._id),
          subject: thread.subject,
          updatedAt: thread.updatedAt,
          status: thread.status,
          unreadForTeam: 0,
          messages: messages.map((m) => ({
            id: String(m._id),
            role: m.role,
            text: m.text,
            createdAt: m.createdAt,
          })),
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

export async function POST(request, { params }) {
  let session;

  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const teamId = getTeamIdFromRequestSession(token);

    if (!teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = params?.threadId;
    if (!threadId) {
      return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return NextResponse.json({ error: "Invalid threadId" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const text = String(body?.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const now = new Date();
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const thread = await ConversationThread.findOne({ _id: threadId, teamId }).session(session);
      if (!thread) {
        throw new Error("NOT_FOUND");
      }

      if (thread.status === "closed") {
        throw new Error("CLOSED");
      }

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

      await ConversationThread.updateOne(
        { _id: threadId, teamId },
        {
          $set: {
            lastMessageAt: now,
            lastMessageText: text,
            lastMessageRole: "team",
            updatedAt: now,
          },
          $inc: { unreadForLecturer: 1 },
        },
        { session }
      );
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const msg = String(err?.message || err);

    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (msg === "CLOSED") {
      return NextResponse.json({ error: "Thread is closed" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Server error", details: msg },
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}
