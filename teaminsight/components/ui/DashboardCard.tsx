/**
 * DashboardCard Component
 * -----------------------
 * Navigation card for dashboard pages.
 * Used in lecturer dashboard.
 */

import Link from "next/link";
import type { ReactNode } from "react";

type DashboardCardColor = "blue" | "purple" | "green" | "indigo" | "red" | "amber";

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  color?: DashboardCardColor;
};

const BORDER_COLORS = {
  blue: "border-l-4 border-blue-500",
  purple: "border-l-4 border-purple-500",
  green: "border-l-4 border-green-500",
  indigo: "border-l-4 border-indigo-500",
  red: "border-l-4 border-red-500",
  amber: "border-l-4 border-amber-500",
} as const;

export function DashboardCard({
  title,
  description,
  href,
  icon,
  color = "blue",
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className={`block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all transform ${BORDER_COLORS[color]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {icon}
      </div>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
