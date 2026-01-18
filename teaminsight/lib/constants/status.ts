/**
 * Status Constants
 * ----------------
 * Centralized status-related constants and utilities.
 */

import type { TeamStatus } from "@/lib/types";

/**
 * Valid team statuses
 */
export const TEAM_STATUSES = ["green", "yellow", "red"] as const;

/**
 * Alert-triggering statuses
 */
export const ALERT_STATUSES = new Set<TeamStatus>(["yellow", "red"]);

/**
 * Status display configuration
 */
export const STATUS_DISPLAY = {
  green: {
    label: "OK",
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  yellow: {
    label: "Warning",
    dot: "bg-yellow-400",
    text: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  red: {
    label: "Risk",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
} as const;

/**
 * Status rank for sorting (lower = worse)
 */
export const STATUS_RANK: Record<TeamStatus, number> = {
  red: 0,
  yellow: 1,
  green: 2,
};

/**
 * Check if status is valid
 */
export function isValidStatus(status: unknown): status is TeamStatus {
  return typeof status === "string" && TEAM_STATUSES.includes(status as TeamStatus);
}

/**
 * Get status label
 */
export function getStatusLabel(status: TeamStatus): string {
  return STATUS_DISPLAY[status].label;
}
