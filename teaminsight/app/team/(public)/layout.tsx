"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const PUBLIC_LANDING = "/";

export default function PublicTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [showBar, setShowBar] = useState(true);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    setLastY(window.scrollY || 0);

    const onScroll = () => {
      const y = window.scrollY || 0;

      const nearTop = y <= 24;
      const scrollingUp = y < lastY;

      setShowBar(nearTop || scrollingUp);
      setLastY(y);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  function handleBack() {
    router.replace(PUBLIC_LANDING);
  }

  return (
    <div className="min-h-screen">
      <div
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "h-14",
          "bg-emerald-600",
          "shadow-[0_10px_30px_rgba(16,185,129,0.25)]",
          "transition-transform duration-200 ease-out",
          showBar ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
      >
        <div className="h-full w-full flex items-center justify-end px-4">
          <button
            type="button"
            onClick={handleBack}
            className={[
              "inline-flex items-center gap-2",
              "rounded-xl",
              "px-4 py-2.5",
              "text-sm font-semibold",
              "text-white",
              "border border-white/25",
              "bg-white/15",
              "hover:bg-white/20",
              "active:translate-y-[1px]",
              "focus:outline-none focus:ring-2 focus:ring-white/35",
            ].join(" ")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      <div className="h-14" />

      {children}
    </div>
  );
}
