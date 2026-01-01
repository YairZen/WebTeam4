"use client";

import TeamGate from "../_components/TeamGate";

export default function ProtectedTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeamGate>{children}</TeamGate>;
}
