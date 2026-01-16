"use client";

import { AlertTriangle, Clock, FileText, Activity, Users, CheckCircle } from "lucide-react";
import { Team, QualityData, AlertItem } from "../types";

/* --- 1. KPI Cards (Words & Time Only) --- */
export function KpiStats({ qualityData }: { qualityData: QualityData[] }) {
  let totalWordsAll = 0;
  let totalDurationAll = 0;
  let totalSessionsAll = 0;

  qualityData.forEach((d) => {
    if (d.sessionCount > 0) {
      totalWordsAll += d.avgWords * d.sessionCount;
      totalDurationAll += d.avgDuration * d.sessionCount;
      totalSessionsAll += d.sessionCount;
    }
  });

  const globalAvgWords = totalSessionsAll > 0 ? Math.round(totalWordsAll / totalSessionsAll) : 0;
  const globalAvgTime = totalSessionsAll > 0 ? Math.round(totalDurationAll / totalSessionsAll) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
      <StatCard 
        icon={<FileText className="text-blue-600" size={24} />} 
        label="Avg. Words per Session" 
        value={globalAvgWords.toLocaleString()} 
        subtext="Depth of reflection"
        color="bg-blue-50 border-blue-100"
      />
      <StatCard 
        icon={<Clock className="text-purple-600" size={24} />} 
        label="Avg. Time per Session" 
        value={`${globalAvgTime} min`} 
        subtext="Engagement duration"
        color="bg-purple-50 border-purple-100"
      />
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color }: any) {
  return (
    <div className={`p-6 rounded-xl border ${color} shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h4 className="text-4xl font-bold text-gray-800">{value}</h4>
        <p className="text-xs text-gray-400 mt-2">{subtext}</p>
      </div>
      <div className="p-4 bg-white rounded-full shadow-sm">{icon}</div>
    </div>
  );
}

/* --- 2. Critical Attention List (Red & Yellow) --- */
export function CriticalTeamsList({ teams, alerts }: { teams: Team[], alerts: AlertItem[] }) {
  const attentionTeams = teams.filter(t => t.status === "red" || t.status === "yellow");

  return (
    <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden h-full flex flex-col">
      <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
        <AlertTriangle className="text-orange-600" size={20} />
        <h3 className="font-semibold text-orange-900">Requires Attention</h3>
      </div>
      <div className="p-0 overflow-y-auto max-h-[300px]">
        {attentionTeams.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">All teams are on track (Green). Good job!</div>
        ) : (
            attentionTeams.map((team) => (
            <div key={team.teamId} className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-orange-50/30 transition-colors">
                <div>
                  <span className="font-bold text-gray-800 block">{team.teamId}</span>
                  <span className="text-xs text-gray-500">{team.projectName || "No Project"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                        team.status === 'red' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {team.status === 'red' ? 'Critical' : 'Warning'}
                    </span>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
}

/* --- 3. Teams Chat Status List (Top 5 Mixed) --- */
export function TeamsChatStatusList({ teams, qualityData }: { teams: Team[], qualityData: QualityData[] }) {
  
  const rows = teams.map(team => {
    const chatData = qualityData.find(q => q.teamId === team.teamId);
    return {
      ...team,
      latestStatus: chatData?.latestStatus || null,
      lastActivity: chatData?.lastActivity || 0
    };
  });

  rows.sort((a, b) => {
     const getScore = (status: string | null) => {
         if (status === 'in_progress') return 3; 
         if (status === 'submitted' || status === 'completed') return 2;
         return 1; 
     };
     
     const scoreA = getScore(a.latestStatus);
     const scoreB = getScore(b.latestStatus);

     if (scoreA !== scoreB) return scoreB - scoreA; 
     if (a.lastActivity !== b.lastActivity) return b.lastActivity - a.lastActivity;
     return a.teamId.localeCompare(b.teamId);
  });

  const top5 = rows.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Activity className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">Teams Status (Top 5)</h3>
        </div>
        <span className="text-xs text-gray-400">
            Showing 5/{teams.length}
        </span>
      </div>
      
      <div className="p-0 overflow-hidden">
        {top5.length === 0 ? (
             <div className="p-6 text-center text-gray-400 text-sm">No teams found</div>
        ) : (
            top5.map((item) => {
                const isLive = item.latestStatus === 'in_progress';
                const hasStarted = item.latestStatus !== null;
                const dateStr = item.lastActivity > 0 
                    ? new Date(item.lastActivity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                    : "-";

                let statusColor = "bg-gray-100 text-gray-400";
                let icon = <Users size={16} />;
                let statusText = "Not Started";

                if (isLive) {
                    statusColor = "bg-green-100 text-green-600";
                    statusText = "Live Now";
                } else if (item.latestStatus === 'submitted' || item.latestStatus === 'completed') {
                    statusColor = "bg-blue-100 text-blue-600";
                    statusText = "Submitted";
                    icon = <CheckCircle size={16} />;
                }

                return (
                <div key={item.teamId} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${statusColor}`}>
                        {icon}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-800">{item.teamId}</span>
                            {isLive ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full">
                                    <span className="animate-ping h-1.5 w-1.5 rounded-full bg-green-500"></span> Live
                                </span>
                            ) : (
                                <span className="text-[10px] text-gray-400">
                                    {hasStarted ? dateStr : ""}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                             <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                {item.projectName || "No Project"}
                             </p>
                             <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                                 hasStarted ? 'bg-gray-50 text-gray-600' : 'bg-gray-50 text-gray-400 italic'
                             }`}>
                                {statusText}
                             </span>
                        </div>
                    </div>
                </div>
                );
            })
        )}
      </div>
    </div>
  );
}