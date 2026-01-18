import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { verifyTeamSession } from "@/lib/teamSession";

import ReflectionChatSession from "@/models/ReflectionChatSession";
import ReflectionProfile from "@/models/ReflectionProfile";
import Team from "@/models/Team";

import { runReflectionFinalSummary, runReflectionEvaluation } from "@/lib/ai/gemini";

export const runtime = "nodejs";

function jsonError(status: number, error: string, details?: string) {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status });
}

// Legacy score computation for backward compatibility
function computeLegacyScore(evalRes: { quality: number; risk: number; compliance: number }) {
  const score =
    (evalRes.quality * 0.45 + (10 - evalRes.risk) * 0.4 + evalRes.compliance * 0.15) * 10;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function scoreToColor(score: number, greenMin: number, redMax: number) {
  if (score >= greenMin) return "green" as const;
  if (score <= redMax) return "red" as const;
  return "yellow" as const;
}

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("team_session")?.value;

    const payload = token ? verifyTeamSession(token) : null;
    const teamId = payload?.teamId;
    if (!teamId) {
      return jsonError(401, "Unauthorized", "Missing/invalid team_session cookie or payload.teamId");
    }

    const session = await ReflectionChatSession.findOne({
      teamId,
      status: "ready_to_submit",
    });

    if (!session) return jsonError(409, "Nothing to confirm");

    // Load the exact profile used by this session
    const profileKey = (session.profileKey || "default").trim() || "default";
    const profile =
      (await ReflectionProfile.findOne({ key: profileKey }).lean()) ||
      (await ReflectionProfile.findOne({ key: "default" }).lean());

    if (!profile) return jsonError(500, "Missing ReflectionProfile", "No default profile found");

    // 1) Final summary (stored, not returned to student)
    const finalSummary = await runReflectionFinalSummary({
      answers: session.answers,
      runningSummary: session.aiSummary || "",
      messages: session.messages,
    });

    // 2) Evaluation with new THS algorithm
    const evalRes = await runReflectionEvaluation({
      summary: finalSummary,
      answers: session.answers,
      messages: session.messages,
      policy: {
        profile: { key: profile.key, evaluatorAddendum: profile.evaluatorAddendum || "" },
        weeklyInstructions: session.weeklyInstructionsSnapshot || "",
      },
    });

    // 3) Use THS score if available, otherwise compute legacy score
    const thsScore = evalRes.teamHealthScore || 0;
    const legacyScore = computeLegacyScore(evalRes);
    const finalScore = thsScore > 0 ? thsScore : legacyScore;
    const color = scoreToColor(finalScore, Number(profile.greenMin ?? 75), Number(profile.redMax ?? 45));

    // 4) Save all new THS data on session
    session.aiSummary = finalSummary;

    // New THS fields
    session.teamHealthScore = evalRes.teamHealthScore;
    session.thsComponents = evalRes.components;
    session.tuckmanStage = evalRes.tuckmanStage;
    session.tuckmanExplanation = evalRes.tuckmanExplanation || "";
    session.riskLevel = evalRes.riskLevel;
    session.riskExplanation = evalRes.riskExplanation || "";
    session.anomalyFlags = evalRes.anomalyFlags || [];
    session.strengths = evalRes.strengths || [];
    session.concerns = evalRes.concerns || [];
    session.recommendations = evalRes.recommendations || [];

    // Legacy fields for backward compatibility
    session.reflectionScore = finalScore;
    session.reflectionColor = color;
    session.reflectionReasons = (evalRes.reasons || []).slice(0, 5);
    session.qualityBreakdown = evalRes.qualityBreakdown || "";
    session.riskBreakdown = evalRes.riskBreakdown || "";
    session.complianceBreakdown = evalRes.complianceBreakdown || "";

    session.status = "submitted";
    session.submittedAt = new Date();
    await session.save();

    // 5) Update Team.status with new data
    await Team.updateOne(
      { teamId },
      {
        $set: {
          status: color,
          reflectionScore: finalScore,
          teamHealthScore: evalRes.teamHealthScore,
          tuckmanStage: evalRes.tuckmanStage,
          riskLevel: evalRes.riskLevel,
          anomalyFlags: evalRes.anomalyFlags || [],
          reflectionUpdatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      submissionId: String(session._id),
      teamHealthScore: evalRes.teamHealthScore,
      tuckmanStage: evalRes.tuckmanStage,
    });
  } catch (err: any) {
    console.error("reflection/confirm error:", err);
    return jsonError(500, "Internal Server Error", err?.message || "Unknown");
  }
}
