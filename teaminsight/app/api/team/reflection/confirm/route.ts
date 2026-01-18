/**
 * Reflection Confirm API Route
 * ----------------------------
 * POST /api/team/reflection/confirm - Confirm and submit the reflection
 */

import { connectDB } from "@/lib/db";
import { successResponse, ApiErrors, withErrorHandler, requireTeamAuth } from "@/lib/api";
import { extractTasksFromSummary, computeLegacyScore, scoreToColor } from "@/lib/api/reflection";
import ReflectionChatSession from "@/models/ReflectionChatSession";
import ReflectionProfile from "@/models/ReflectionProfile";
import Team from "@/models/Team";
import { runReflectionFinalSummary, runReflectionEvaluation } from "@/lib/ai/gemini";

export const runtime = "nodejs";

export async function POST() {
  return withErrorHandler(async () => {
    const authResult = await requireTeamAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { teamId } = authResult;
    await connectDB();

    const session = await ReflectionChatSession.findOne({
      teamId,
      status: "ready_to_submit",
    });

    if (!session) {
      return ApiErrors.conflict("Nothing to confirm");
    }

    // Load the exact profile used by this session
    const profileKey = (session.profileKey || "default").trim() || "default";
    const profile =
      (await ReflectionProfile.findOne({ key: profileKey }).lean()) ||
      (await ReflectionProfile.findOne({ key: "default" }).lean());

    if (!profile) {
      return ApiErrors.serverError(new Error("Missing ReflectionProfile: No default profile found"));
    }

    // 1) Final summary
    const finalSummary = await runReflectionFinalSummary({
      answers: session.answers,
      runningSummary: session.aiSummary || "",
      messages: session.messages,
    });

    // 2) Evaluation with THS algorithm
    const evalRes = await runReflectionEvaluation({
      summary: finalSummary,
      answers: session.answers,
      messages: session.messages,
      policy: {
        profile: { key: profile.key, evaluatorAddendum: profile.evaluatorAddendum || "" },
        weeklyInstructions: session.weeklyInstructionsSnapshot || "",
      },
    });

    // 3) Calculate final score
    const thsScore = evalRes.teamHealthScore || 0;
    const legacyScore = computeLegacyScore(evalRes);
    const finalScore = thsScore > 0 ? thsScore : legacyScore;
    const color = scoreToColor(
      finalScore,
      Number(profile.greenMin ?? 75),
      Number(profile.redMax ?? 45)
    );

    // 4) Save all THS data on session
    session.aiSummary = finalSummary;
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

    // Legacy fields
    session.reflectionScore = finalScore;
    session.reflectionColor = color;
    session.reflectionReasons = (evalRes.reasons || []).slice(0, 5);
    session.qualityBreakdown = evalRes.qualityBreakdown || "";
    session.riskBreakdown = evalRes.riskBreakdown || "";
    session.complianceBreakdown = evalRes.complianceBreakdown || "";

    session.status = "submitted";
    session.submittedAt = new Date();
    await session.save();

    // 5) Update Team status
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

    // 6) Extract tasks for student display
    let studentTasks = extractTasksFromSummary(finalSummary);

    // Fallback to recommendations if no tasks found
    if (studentTasks.length === 0 && evalRes.recommendations && evalRes.recommendations.length > 0) {
      studentTasks = evalRes.recommendations.slice(0, 3);
    }

    return successResponse({
      submissionId: String(session._id),
      teamHealthScore: evalRes.teamHealthScore,
      tuckmanStage: evalRes.tuckmanStage,
      tasks: studentTasks,
      strengths: (evalRes.strengths || []).slice(0, 2),
    });
  });
}
