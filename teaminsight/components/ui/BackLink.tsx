/**
 * BackLink Component
 * ------------------
 * Consistent back navigation link.
 */

import Link from "next/link";

type BackLinkProps = {
  href: string;
  label?: string;
};

export function BackLink({ href, label = "Back" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="text-purple-600 hover:text-purple-700 hover:underline text-sm whitespace-nowrap font-medium"
    >
      ← {label}
    </Link>
  );
}
