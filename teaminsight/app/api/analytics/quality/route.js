import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ReflectionChatSession from "@/models/ReflectionChatSession"; 
import Team from "@/models/Team"; 

export async function GET() {
  try {
    await connectDB();

    const allTeams = await Team.find({}).select("teamId").lean();

    // 1. Fetch sessions including 'messages' field to count interaction length
    const allSessions = await ReflectionChatSession.find({ 
        status: { $in: ["submitted", "completed", "in_progress"] } 
      })
      // We must select 'messages' here to count them!
      .select("teamId messages answers createdAt updatedAt status") 
      .lean();

    const sessionsMap = new Map();
    
    // 2. Aggregate Data
    for (const session of allSessions) {
      
      // --- FIX: Count total messages in the conversation history ---
      // This includes both AI prompts and User responses
      const currentSessionMessages = session.messages ? session.messages.length : 0;

      // Calculate Duration in MINUTES
      const start = new Date(session.createdAt);
      const end = new Date(session.updatedAt);
      let durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      if (durationMinutes < 0) durationMinutes = 0;

      // Track Last Activity Timestamp
      const sessionDate = new Date(session.updatedAt).getTime();

      if (sessionsMap.has(session.teamId)) {
        const existing = sessionsMap.get(session.teamId);
        
        existing.totalMessages += currentSessionMessages;
        existing.totalDuration += durationMinutes;
        existing.sessionCount += 1;
        
        // Keep the latest timestamp AND the latest status
        if (sessionDate > existing.lastActivity) {
            existing.lastActivity = sessionDate;
            existing.latestStatus = session.status; 
        }
      } else {
        sessionsMap.set(session.teamId, {
            totalMessages: currentSessionMessages,
            totalDuration: durationMinutes,
            sessionCount: 1,
            lastActivity: sessionDate,
            latestStatus: session.status
        });
      }
    }

    // 3. Format Data for Frontend
    const data = allTeams.map(team => {
      const sessionData = sessionsMap.get(team.teamId);
      const count = sessionData ? sessionData.sessionCount : 1; 

      return {
        teamId: team.teamId,
        // Calculate Average Messages
        avgMessages: sessionData ? Math.round(sessionData.totalMessages / count) : 0,
        // Calculate Average Duration (Minutes)
        avgDuration: sessionData ? Math.round(sessionData.totalDuration / count) : 0,
        
        lastActivity: sessionData ? sessionData.lastActivity : null,
        latestStatus: sessionData ? sessionData.latestStatus : null,
        sessionCount: sessionData ? sessionData.sessionCount : 0
      };
    });

    return NextResponse.json({ ok: true, data });

  } catch (error) {
    console.error("Error fetching quality analytics:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}