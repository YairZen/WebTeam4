"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { RefreshCw, Users, MessageSquare, ExternalLink, LayoutDashboard } from "lucide-react";

import { Team, QualityData, AlertItem, FilterState } from "./types";
import AnalyticsFilters from "./components/AnalyticsFilters";
import AnalyticsCharts from "./components/AnalyticsCharts";
import { KpiStats, CriticalTeamsList, TeamsChatStatusList } from "./components/AnalyticsWidgets";

/* --- Helper: Smart Sort --- */
const smartSort = (a: string, b: string) => {
    const numA = parseInt(a.replace(/[^\d]/g, "")) || 0;
    const numB = parseInt(b.replace(/[^\d]/g, "")) || 0;
    return numA === numB ? a.localeCompare(b) : numA - numB;
};

export default function TeamsAnalyticsPage() {
  const [rawTeams, setRawTeams] = useState<Team[]>([]);
  const [rawQuality, setRawQuality] = useState<QualityData[]>([]);
  const [rawAlerts, setRawAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial State with ALL toggles enabled by default
  const [filters, setFilters] = useState<FilterState>({
    teamId: "all",
    status: "all",
    startDate: "",
    endDate: "",
    showKpiStats: true,      // New
    showStatusChart: true,
    showQualityChart: true,
    showAlertsChart: true,
    showCriticalList: true,  // New
    showLiveFeed: true,      // New
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const teamsRes = await fetch("/api/teams");
      const teamsJson = await teamsRes.json();
      const teams = Array.isArray(teamsJson?.teams) ? teamsJson.teams : [];
      teams.sort((a: Team, b: Team) => smartSort(a.teamId, b.teamId));
      setRawTeams(teams);

      const qualityRes = await fetch("/api/analytics/quality");
      const qualityJson = await qualityRes.json();
      if (qualityJson.ok && Array.isArray(qualityJson.data)) {
        setRawQuality(qualityJson.data);
      } else {
        setRawQuality([]);
      }

      const alertsPerTeam: AlertItem[] = [];
      for (const team of teams) {
        const res = await fetch(`/api/alerts?teamId=${team.teamId}`);
        const json = await res.json();
        const alerts = Array.isArray(json?.alerts) ? json.alerts : [];
        alertsPerTeam.push({
          team: team.teamId,
          yellow: alerts.filter((a: any) => a.severity === "yellow").length,
          red: alerts.filter((a: any) => a.severity === "red").length,
        });
      }
      setRawAlerts(alertsPerTeam);

    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  }

  const { filteredStatusData, filteredQualityData, filteredAlertsData, selectedTeamDetails } = useMemo(() => {
    const safeTeams = rawTeams || [];
    const safeQuality = rawQuality || [];
    const safeAlerts = rawAlerts || [];

    const activeTeams = safeTeams.filter(team => {
      if (filters.teamId !== "all" && team.teamId !== filters.teamId) return false;
      if (filters.status !== "all" && team.status !== filters.status) return false;
      return true;
    });

    const activeTeamIds = new Set(activeTeams.map(t => t.teamId));

    const statusResult = [
      { name: "Green", value: activeTeams.filter(t => t.status === "green").length },
      { name: "Yellow", value: activeTeams.filter(t => t.status === "yellow").length },
      { name: "Red", value: activeTeams.filter(t => t.status === "red").length },
    ];

    const qualityResult = safeQuality
      .filter(q => activeTeamIds.has(q.teamId))
      .sort((a, b) => smartSort(a.teamId, b.teamId));

    const alertsResult = safeAlerts
      .filter(a => activeTeamIds.has(a.team))
      .sort((a, b) => smartSort(a.team, b.team));

    const teamDetails = filters.teamId !== "all" 
      ? safeTeams.find(t => t.teamId === filters.teamId) 
      : null;

    return {
      filteredStatusData: statusResult,
      filteredQualityData: qualityResult,
      filteredAlertsData: alertsResult,
      selectedTeamDetails: teamDetails
    };
  }, [rawTeams, rawQuality, rawAlerts, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center text-gray-600">
         <RefreshCw className="animate-spin mr-2" /> Loading analytics...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 w-full py-10">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Teams Analytics</h1>
            <p className="text-gray-600 mt-1">Live insights, activity tracking, and status overview.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <Link href="/lecturer/teams">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm">
                    <Users size={16} />
                    Back to Teams Overview
                </button>
             </Link>
             <Link href="/lecturer/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-all shadow-sm">
                    <LayoutDashboard size={16} />
                    Back to Dashboard
                </button>
             </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <AnalyticsFilters 
              filters={filters} 
              setFilters={setFilters} 
              teams={rawTeams} 
              onReset={() => setFilters({
                  teamId: "all",
                  status: "all",
                  startDate: "",
                  endDate: "",
                  showKpiStats: true,
                  showStatusChart: true,
                  showQualityChart: true,
                  showAlertsChart: true,
                  showCriticalList: true,
                  showLiveFeed: true
              })} 
          />
        </div>

       {/* Selected Team Details Banner */}
        {selectedTeamDetails && (
            <div className="bg-white border border-blue-100 rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fadeIn w-full">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {/* Team Name */}
                        <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                            <Users className="text-blue-600"/> {selectedTeamDetails.teamId}
                        </h2>
                        
                        {/* --- NEW: Status Badge --- */}
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${
                            selectedTeamDetails.status === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
                            selectedTeamDetails.status === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-green-100 text-green-700 border-green-200'
                        }`}>
                            {selectedTeamDetails.status === 'red' ? 'Critical' : 
                             selectedTeamDetails.status === 'yellow' ? 'Warning' : 'On Track'}
                        </span>
                        {/* ------------------------- */}
                    </div>
                    
                    <div className="text-blue-800 mb-2">
                      <span className="font-semibold">Project:</span> {selectedTeamDetails.projectName || "N/A"}
                    </div>

                    {/* Members List */}
                    {selectedTeamDetails.members && selectedTeamDetails.members.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-500">Members:</span>
                            {selectedTeamDetails.members.map((m) => (
                                <span key={m.memberId} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                                    {m.displayName}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 italic">No members listed</div>
                    )}

                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setFilters({...filters, teamId: "all"})} 
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                    >
                      Close View
                    </button>
                    <Link href={`/lecturer/teams/${selectedTeamDetails.teamId}`}>
                        <button className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2">
                            <MessageSquare size={16} /> Open Chat <ExternalLink size={14} />
                        </button>
                    </Link>
                </div>
            </div>
        )}

        {/* --- 1. KPI Stats (Toggled) --- */}
        {filters.showKpiStats && (
            <div className="animate-fadeIn">
                <KpiStats qualityData={rawQuality} />
            </div>
        )}

        {/* --- 2. Charts (Controlled by Toggles inside the component) --- */}
        {(filters.showStatusChart || filters.showQualityChart || filters.showAlertsChart) && (
            <div className="animate-fadeIn">
                <AnalyticsCharts 
                    filters={filters}
                    statusData={filteredStatusData}
                    qualityData={filteredQualityData}
                    alertsData={filteredAlertsData}
                />
            </div>
        )}

        {/* --- 3. Bottom Grid: Lists (Toggled) --- */}
        <div className={`grid gap-8 mb-12 ${
            filters.showCriticalList && filters.showLiveFeed 
            ? "grid-cols-1 lg:grid-cols-2" 
            : "grid-cols-1"
        }`}>
           
           {filters.showCriticalList && (
               <div className="animate-fadeIn h-full">
                   <CriticalTeamsList teams={rawTeams} alerts={rawAlerts} />
               </div>
           )}
           
           {filters.showLiveFeed && (
               <div className="animate-fadeIn h-full">
                   <TeamsChatStatusList teams={rawTeams} qualityData={rawQuality} />
               </div>
           )}

        </div>

        {/* Analytics Guide (Simple Design) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-12">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Analytics Guide
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Global KPIs:</strong> Class-wide averages (Words & Time) to set a benchmark.</li>
            <li><strong>Visual Charts:</strong> Breakdown of Team Status, Total Sessions, and Alerts.</li>
            <li><strong>Critical List:</strong> Teams with Red/Yellow status that require attention.</li>
            <li><strong>Live Feed:</strong> Real-time activity (Live &gt; Submitted &gt; Not Started).</li>
          </ul>
        </div>
        
      </div>
    </main>
  );
}