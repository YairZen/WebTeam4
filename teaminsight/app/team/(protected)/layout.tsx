"use client";

import React from "react";
import TeamGate from "../_components/TeamGate";
import BackButton from "../_components/BackButton";

export default function ProtectedTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamGate>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-end">
          <BackButton />
        </div>

        {children}
      </div>
    </TeamGate>
  );
}
