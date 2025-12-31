"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/team/chat", label: "Chat" },
  { href: "/team/reflection", label: "Reflection" },
  { href: "/team/messages", label: "Messages" },
  { href: "/team/info", label: "Team Info" },
  { href: "/team/reflection", label: "Reflection" }
];

export default function TeamTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2">
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={[
              "rounded-xl px-4 py-2 text-sm transition",
              active ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
