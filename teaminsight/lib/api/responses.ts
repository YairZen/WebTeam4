/**
 * API Response Utilities
 * ----------------------
 * Shared helpers for consistent API responses.
 * Reduces code duplication across all API routes.
 */

import { NextResponse } from "next/server";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Create a success response with data
 */
export function successResponse<T extends Record<string, JsonValue>>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: string
): NextResponse {
  return NextResponse.json(
    { error, ...(details ? { details } : {}) },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: (details?: string) =>
    errorResponse("Unauthorized", 401, details),

  notFound: (resource: string = "Resource") =>
    errorResponse(`${resource} not found`, 404),

  badRequest: (message: string) =>
    errorResponse(message, 400),

  conflict: (message: string, details?: string) =>
    errorResponse(message, 409, details),

  serverError: (err: unknown) =>
    errorResponse(
      "Server error",
      500,
      String(err instanceof Error ? err.message : err)
    ),
} as const;

/**
 * Wrap an API handler with try/catch and DB connection
 * Returns a consistent error response on failure
 */
export async function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await handler();
  } catch (err) {
    console.error("API Error:", err);
    return ApiErrors.serverError(err);
  }
}
