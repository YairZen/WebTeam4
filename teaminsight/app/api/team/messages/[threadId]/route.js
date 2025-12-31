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

    const thread = await MessageThread.findOne({ _id: threadId, teamId }).lean();
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await MessageMessage.find({ threadId, teamId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark as read for team
    await MessageThread.updateOne({ _id: threadId, teamId }, { $set: { unreadForTeam: 0 } });

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

    const body = await request.json().catch(() => ({}));
    const text = String(body?.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const thread = await MessageThread.findOne({ _id: threadId, teamId }).lean();
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const now = new Date();

    await MessageMessage.create({
      threadId,
      teamId,
      role: "team",
      text,
    });

    await MessageThread.updateOne(
      { _id: threadId, teamId },
      {
        $set: {
          lastMessageAt: now,
          lastMessageText: text,
          lastMessageRole: "team",
          updatedAt: now,
        },
        $inc: { unreadForLecturer: 1 },
      }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
