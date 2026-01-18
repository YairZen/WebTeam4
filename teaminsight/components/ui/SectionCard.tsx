/**
 * SectionCard Component
 * ---------------------
 * Card wrapper for content sections.
 * Used throughout the application for consistent styling.
 */

import type { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
};

export function SectionCard({
  title,
  children,
  className = "",
  headerAction,
}: SectionCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * ChartCard - Specialized card for charts
 */
export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-5 text-center text-gray-800">
        {title}
      </h3>
      {children}
    </div>
  );
}
