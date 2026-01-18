"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/team/me", { credentials: "include" });
        const data = await res.json();

        // Check if team exists in response (not just res.ok)
        if (!data?.team) {
          router.replace("/team/join");
          return;
        }
        setReady(true);
      } catch {
        router.replace("/team/join");
      }
    }
    check();
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
