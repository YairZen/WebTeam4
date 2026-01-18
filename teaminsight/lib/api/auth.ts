/**
 * API Authentication Utilities
 * ----------------------------
 * Shared auth helpers for team session verification.
 * Reduces code duplication in protected API routes.
 */

import { cookies } from "next/headers";
import { verifyTeamSession } from "@/lib/teamSession";
import { ApiErrors } from "./responses";
import { NextResponse } from "next/server";

const TEAM_SESSION_COOKIE = "team_session";

export type TeamSessionPayload = {
  teamId: string;
  iat?: number;
  exp?: number;
};

export type AuthResult =
  | { success: true; teamId: string; payload: TeamSessionPayload }
  | { success: false; response: NextResponse };

/**
 * Verify team session from cookies
 * Returns teamId if valid, or an error response if not
 */
export async function verifyTeamAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEAM_SESSION_COOKIE)?.value;

  if (!token) {
    return {
      success: false,
      response: ApiErrors.unauthorized("Missing team_session cookie"),
    };
  }

  const payload = verifyTeamSession(token) as TeamSessionPayload | null;

  if (!payload?.teamId) {
    return {
      success: false,
      response: ApiErrors.unauthorized("Invalid or expired team session"),
    };
  }

  return {
    success: true,
    teamId: payload.teamId,
    payload,
  };
}

/**
 * Helper to get teamId or return error response
 * Use in API routes that require team authentication
 */
export async function requireTeamAuth(): Promise<
  { teamId: string } | { error: NextResponse }
> {
  const result = await verifyTeamAuth();

  if (result.success === false) {
    return { error: result.response };
  }

  return { teamId: result.teamId };
}
