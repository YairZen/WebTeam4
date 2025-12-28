"use client";

/*
  Lecturer – Teams History Page
  =============================
  Course-aligned implementation
*/

import { useEffect, useState } from "react";
import Link from "next/link";

type Team = {
  teamId: string;
  projectName: string;
  status: "green" | "yellow" | "red";
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setTeams(data.teams);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-8 py-10">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Teams History</h1>

        <Link
          href="/lecturer/dashboard"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading teams...</div>
      ) : (
        <div className="max-w-3xl bg-white rounded-lg shadow mx-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-6 py-3 border-b">Team ID</th>
                <th className="text-left px-6 py-3 border-b">Project Name</th>
                <th className="text-left px-6 py-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team.teamId}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 border-b font-medium text-blue-600">
                    <Link href={`/lecturer/teams/${team.teamId}`}>
                      {team.teamId}
                    </Link>
                  </td>

                  <td className="px-6 py-4 border-b">
                    {team.projectName}
                  </td>

                  <td className="px-6 py-4 border-b">
                    <StatusBadge status={team.status} />
                  </td>
                </tr>
              ))}

              {teams.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center px-6 py-8 text-gray-500"
                  >
                    No teams found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
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
