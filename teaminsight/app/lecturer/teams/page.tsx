"use client";

/*
  Lecturer – Teams History Page
  =============================
  Course-aligned implementation
  Refactored to use shared UI components
*/

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge, KpiCard, BackLink, LoadingState } from "@/components/ui";
import type { TeamStatus } from "@/lib/types";
import { STATUS_RANK } from "@/lib/constants";
import { BarChart3 } from "lucide-react";

type Team = {
  teamId: string;
  projectName: string;
  status: TeamStatus;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TeamStatus>("all");

  type SortKey = "teamId" | "projectName" | "status";
  type SortDir = "asc" | "desc";

  const [sortKey, setSortKey] = useState<SortKey>("teamId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedTeams = useMemo(() => {
    const copy = [...teams];

    copy.sort((a, b) => {
      let cmp = 0;

      if (sortKey === "teamId") {
        const aNum = Number(a.teamId);
        const bNum = Number(b.teamId);

        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          cmp = aNum - bNum;
        } else {
          cmp = a.teamId.localeCompare(b.teamId, "he");
        }
      }

      if (sortKey === "projectName") {
        cmp = (a.projectName ?? "").localeCompare(b.projectName ?? "", "he");
      }

      if (sortKey === "status") {
        cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [teams, sortKey, sortDir]);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setTeams(data.teams);
      })
      .finally(() => setLoading(false));
  }, []);

  const kpi = useMemo(() => {
    const total = teams.length;
    const green = teams.filter((t) => t.status === "green").length;
    const yellow = teams.filter((t) => t.status === "yellow").length;
    const red = teams.filter((t) => t.status === "red").length;
    return { total, green, yellow, red };
  }, [teams]);

  const visibleTeams = useMemo(() => {
    const q = query.trim().toLowerCase();

    return sortedTeams.filter((t) => {
      const matchesQuery =
        q.length === 0 ||
        t.teamId.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [sortedTeams, query, statusFilter]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 w-full py-10">
      <div className="w-full px-4 md:px-8">
        {/* Header row */}
        <div className="flex items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Teams Overview</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Monitor team status and quickly drill down into team details.
            </p>
          </div>

 {/* --- ADDED: Container for Actions (Back link + Analytics Button) --- */}
          <div className="flex flex-col items-end gap-3">
            <Link
                href="/lecturer/dashboard"
                className="text-purple-600 hover:text-purple-700 hover:underline text-sm whitespace-nowrap font-medium"
            >
                ← Back to Dashboard
            </Link>

            {/* --- ADDED: The Analytics View Button --- */}
            <Link href="/lecturer/analytics">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-md transition-colors">
                    Analytics View <BarChart3 size={18} />
                </button>
            </Link>
          </div>
          {/* --- END ADDED SECTION --- */}
        </div>

        {loading ? (
          <LoadingState message="Loading teams..." />
        ) : (
          <div className="w-full space-y-6">
            {/* KPI Cards - using shared component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard title="Total Teams" value={kpi.total} tone="neutral" />
              <KpiCard title="Green" value={kpi.green} tone="green" />
              <KpiCard title="Yellow" value={kpi.yellow} tone="yellow" />
              <KpiCard title="Red" value={kpi.red} tone="red" />
            </div>

            {/* Toolbar: Search + Filter */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-start">
              <div className="w-full md:max-w-md">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by Team ID or Project Name..."
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | TeamStatus)}
                  className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-400"
                >
                  <option value="all">All</option>
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                  }}
                  className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 whitespace-nowrap"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Full width table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="text-left px-6 py-3 border-b">
                        <button
                          type="button"
                          onClick={() => toggleSort("teamId")}
                          className="font-semibold hover:underline"
                        >
                          Team ID
                        </button>
                      </th>

                      <th className="text-left px-6 py-3 border-b">
                        <button
                          type="button"
                          onClick={() => toggleSort("projectName")}
                          className="font-semibold hover:underline"
                        >
                          Project Name
                        </button>
                      </th>

                      <th className="text-left px-6 py-3 border-b">
                        <button
                          type="button"
                          onClick={() => toggleSort("status")}
                          className="font-semibold hover:underline"
                        >
                          Status
                        </button>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleTeams.map((team) => (
                      <tr key={team.teamId} className="hover:bg-purple-50 transition">
                        <td className="px-6 py-4 border-b font-medium text-purple-600">
                          <Link href={`/lecturer/teams/${team.teamId}`} className="hover:underline">
                            {team.teamId}
                          </Link>
                        </td>

                        <td className="px-6 py-4 border-b">{team.projectName}</td>

                        <td className="px-6 py-4 border-b">
                          <StatusBadge status={team.status} />
                        </td>
                      </tr>
                    ))}

                    {visibleTeams.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center px-6 py-10 text-gray-500">
                          No teams match your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

