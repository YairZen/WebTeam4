/**
 * Reflection API Helpers
 * ----------------------
 * Shared utilities for reflection-related API routes.
 */

import ReflectionChatSession from "@/models/ReflectionChatSession";
import { REFLECTION } from "@/lib/constants";

/**
 * Get recent submitted summaries for a team
 * Used for context in reflection conversations
 */
export async function getRecentSummaries(teamId: string): Promise<string[]> {
  const cutoffDate = new Date(
    Date.now() - REFLECTION.RECENT_SUMMARIES_DAYS * 24 * 60 * 60 * 1000
  );

  const recentSubmitted = await ReflectionChatSession.find({
    teamId,
    status: "submitted",
    updatedAt: { $gte: cutoffDate },
  })
    .sort({ updatedAt: -1 })
    .limit(REFLECTION.RECENT_SUMMARIES_LIMIT)
    .select({ aiSummary: 1 })
    .lean();

  return recentSubmitted
    .map((r: { aiSummary?: string }) => r?.aiSummary)
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0);
}

/**
 * Extract tasks from final summary markdown
 */
export function extractTasksFromSummary(summary: string): string[] {
  const tasksMatch = summary.match(/##.*משימות.*\n([\s\S]*?)(?=\n---|\n##|$)/i);

  if (!tasksMatch) {
    return [];
  }

  const tasksSection = tasksMatch[1];
  const taskLines = tasksSection
    .split("\n")
    .filter((line) => /^(\d+[\.\)]|\*|-|###)\s/.test(line.trim()))
    .map((line) => line.replace(/^(\d+[\.\)]|\*|-|###)\s*\**/, "").trim())
    .filter(
      (line) =>
        line.length > 5 &&
        !line.startsWith("מה לעשות") &&
        !line.startsWith("מי אחראי") &&
        !line.startsWith("עד מתי")
    );

  return taskLines.slice(0, 3);
}

/**
 * Compute legacy score from evaluation result
 */
export function computeLegacyScore(evalRes: {
  quality: number;
  risk: number;
  compliance: number;
}): number {
  const score =
    (evalRes.quality * 0.45 + (10 - evalRes.risk) * 0.4 + evalRes.compliance * 0.15) * 10;
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Convert score to status color
 */
export function scoreToColor(
  score: number,
  greenMin: number,
  redMax: number
): "green" | "yellow" | "red" {
  if (score >= greenMin) return "green";
  if (score <= redMax) return "red";
  return "yellow";
}
