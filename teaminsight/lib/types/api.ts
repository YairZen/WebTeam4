/**
 * Shared API Response Types
 * -------------------------
 * Centralized type definitions for API responses.
 * Ensures consistent typing across the application.
 */

// Base response types
export type ApiSuccessResponse<T = unknown> = {
  ok: true;
} & T;

export type ApiErrorResponse = {
  error: string;
  details?: string;
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Type guard for success responses
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return "ok" in response && response.ok === true;
}

// Type guard for error responses
export function isApiError(response: ApiResponse<unknown>): response is ApiErrorResponse {
  return "error" in response;
}

// Common response payloads
export type TeamsListResponse = ApiResponse<{ teams: import("./team").Team[] }>;
export type TeamResponse = ApiResponse<{ team: import("./team").Team }>;
export type TeamIdResponse = ApiResponse<{ teamId: string }>;

// Alert types
export type AlertSeverity = "yellow" | "red";

export type Alert = {
  _id: string;
  teamId: string;
  severity: AlertSeverity;
  message: string;
  emailTo?: string;
  emailStatus?: "pending" | "sent" | "failed";
  createdAt: Date;
};

export type AlertsResponse = ApiResponse<{ alerts: Alert[] }>;

// Announcement types
export type Announcement = {
  _id: string;
  title: string;
  body: string;
  targetTeams: string | string[];
  createdAt: Date;
};

export type AnnouncementsResponse = ApiResponse<{ announcements: Announcement[] }>;
