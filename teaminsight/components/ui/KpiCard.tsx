/**
 * KpiCard Component
 * -----------------
 * Displays a key performance indicator with optional tone styling.
 * Used in dashboard and analytics pages.
 */

type KpiCardTone = "neutral" | "green" | "yellow" | "red";

type KpiCardProps = {
  title: string;
  value: number | string;
  tone?: KpiCardTone;
  subtitle?: string;
};

const TONE_STYLES = {
  neutral: {
    bg: "bg-white",
    border: "border-l-4 border-gray-400",
    value: "text-gray-900",
    title: "text-gray-600",
  },
  green: {
    bg: "bg-green-50",
    border: "border-l-4 border-green-500",
    value: "text-green-700",
    title: "text-green-700",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-l-4 border-yellow-500",
    value: "text-yellow-700",
    title: "text-yellow-700",
  },
  red: {
    bg: "bg-red-50",
    border: "border-l-4 border-red-500",
    value: "text-red-700",
    title: "text-red-700",
  },
} as const;

export function KpiCard({
  title,
  value,
  tone = "neutral",
  subtitle,
}: KpiCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className={`rounded-xl shadow-lg ${styles.border} ${styles.bg} p-4`}>
      <div className={`text-sm font-medium ${styles.title}`}>{title}</div>
      <div className={`text-3xl font-bold mt-1 ${styles.value}`}>{value}</div>
      {subtitle && (
        <div className={`text-xs mt-1 ${styles.title} opacity-80`}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

export { TONE_STYLES };
