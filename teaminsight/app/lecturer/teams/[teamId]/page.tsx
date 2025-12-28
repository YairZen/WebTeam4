"use client";

/*
  Lecturer – Team Details Page
  ===========================
  Course-aligned page:
  - Next.js App Router (dynamic route)
  - React Hooks
  - Tailwind CSS
  - Clear separation: summary, insights, navigation

  Data sources:
  - GET /api/teams/[teamId]
*/

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Team = {
  teamId: string;
  projectName: string;
  status: "green" | "yellow" | "red";
  members?: { memberId: string; displayName: string }[];
};

export default function TeamDetailsPage() {
  const { teamId } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) setTeam(data.team);
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading team data...
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Team not found
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-8 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Team: {team.teamId}
        </h1>

        <Link
          href="/lecturer/teams"
          className="text-blue-600 hover:underline"
        >
          ← Back to Teams
        </Link>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Project Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoBlock label="Project Name" value={team.projectName} />
          <InfoBlock
            label="Status"
            value={<StatusBadge status={team.status} />}
          />
          <InfoBlock
            label="Members"
            value={team.members?.length ?? 0}
          />
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Strengths">
          <ul className="list-disc pl-5 text-gray-700">
            <li>Team communication is active</li>
            <li>Regular task updates</li>
          </ul>
        </SectionCard>

        <SectionCard title="Risks">
          <ul className="list-disc pl-5 text-gray-700">
            {team.status !== "green" ? (
              <li>Status indicates potential issues</li>
            ) : (
              <li>No significant risks detected</li>
            )}
          </ul>
        </SectionCard>
      </div>
    </main>
  );
}

/* =========================
   Reusable Components
   ========================= */

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">
        {label}
      </div>
      <div className="text-lg font-medium">
        {value}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Team["status"] }) {
  const colorMap = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colorMap[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
