/**
 * InfoBlock Component
 * -------------------
 * Displays a labeled piece of information.
 * Used in team details and overview sections.
 */

import type { ReactNode } from "react";

type InfoBlockVariant = "default" | "gradient" | "simple";

type InfoBlockProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  variant?: InfoBlockVariant;
};

const VARIANT_STYLES = {
  default: {
    container: "rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 shadow-sm",
    label: "text-xs font-medium text-gray-600",
    value: "text-sm font-semibold text-gray-900",
  },
  gradient: {
    container: "rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border border-purple-100",
    label: "text-xs font-medium text-gray-600",
    value: "text-sm font-semibold text-gray-900",
  },
  simple: {
    container: "",
    label: "text-sm text-gray-500 mb-1",
    value: "text-lg font-medium",
  },
} as const;

export function InfoBlock({
  label,
  value,
  icon,
  variant = "default",
}: InfoBlockProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={styles.container}>
      <div className={`${styles.label} flex items-center gap-1`}>
        {icon}
        {label}
      </div>
      <div className={`mt-1 ${styles.value}`}>{value}</div>
    </div>
  );
}
