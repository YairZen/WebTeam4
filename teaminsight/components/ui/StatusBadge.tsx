/**
 * StatusBadge Component
 * ---------------------
 * Reusable status indicator for team health status.
 * Used in lecturer teams list, team details, and analytics pages.
 */

import type { TeamStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: TeamStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
};

const STATUS_CONFIG = {
  green: {
    dot: "bg-green-500",
    text: "OK",
    textColor: "text-green-700",
    bg: "bg-green-50",
  },
  yellow: {
    dot: "bg-yellow-400",
    text: "Warning",
    textColor: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  red: {
    dot: "bg-red-500",
    text: "Risk",
    textColor: "text-red-700",
    bg: "bg-red-50",
  },
} as const;

const SIZE_CONFIG = {
  sm: {
    container: "px-2 py-0.5 text-xs",
    dot: "w-2 h-2",
  },
  md: {
    container: "px-3 py-1 text-sm",
    dot: "w-2.5 h-2.5",
  },
  lg: {
    container: "px-4 py-1.5 text-base",
    dot: "w-3 h-3",
  },
} as const;

export function StatusBadge({
  status,
  size = "md",
  showDot = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-medium ${sizeConfig.container} ${config.bg} ${config.textColor}`}
    >
      {showDot && (
        <span className={`rounded-full ${sizeConfig.dot} ${config.dot}`} />
      )}
      {config.text}
    </span>
  );
}

/**
 * Get status display configuration
 * Useful when you need the config without the component
 */
export function getStatusConfig(status: TeamStatus) {
  return STATUS_CONFIG[status];
}

export { STATUS_CONFIG };
