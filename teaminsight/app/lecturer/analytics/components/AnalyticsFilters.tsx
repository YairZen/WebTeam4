"use client";

import { Search, X, Calendar, BarChart3, PieChart, AlertCircle, LayoutGrid, List, Activity } from "lucide-react";
import { FilterState, Team } from "../types";

type Props = {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  teams: Team[];
  onReset: () => void;
};

export default function AnalyticsFilters({ filters, setFilters, teams, onReset }: Props) {
  
  const handleChange = (key: keyof FilterState, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      
      {/* --- Top Row: Dropdowns & Date --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        
        {/* Team Select */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Filter by Team
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={filters.teamId}
              onChange={(e) => handleChange("teamId", e.target.value)}
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.teamId} value={t.teamId}>
                  {t.teamId} {t.projectName ? `- ${t.projectName}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Select */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Filter by Status
          </label>
          <select
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="green">🟢 On Track (Green)</option>
            <option value="yellow">🟡 Warning (Yellow)</option>
            <option value="red">🔴 Critical (Red)</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="flex-1 flex gap-2">
            <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Start Date
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="date" 
                        className="w-full pl-10 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                    />
                </div>
            </div>
             <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    End Date
                </label>
                <input 
                    type="date" 
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                />
            </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <X size={16} /> Reset
          </button>
        </div>
      </div>

      {/* --- Bottom Row: View Controls (All Elements) --- */}
      <div className="border-t border-gray-100 pt-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Toggle Dashboard View:
        </span>
        <div className="flex flex-wrap gap-3">
            
            {/* 1. KPI Stats */}
            <ToggleBtn 
                label="KPI Cards" 
                active={filters.showKpiStats} 
                onClick={() => handleChange("showKpiStats", !filters.showKpiStats)}
                icon={<LayoutGrid size={14} />}
            />

            <div className="w-px h-6 bg-gray-200 mx-1 self-center hidden sm:block"></div>

            {/* 2. Charts */}
            <ToggleBtn 
                label="Status Pie" 
                active={filters.showStatusChart} 
                onClick={() => handleChange("showStatusChart", !filters.showStatusChart)}
                icon={<PieChart size={14} />}
            />
            <ToggleBtn 
                label="Total Sessions" 
                active={filters.showQualityChart} 
                onClick={() => handleChange("showQualityChart", !filters.showQualityChart)}
                icon={<BarChart3 size={14} />}
            />
            <ToggleBtn 
                label="Alerts" 
                active={filters.showAlertsChart} 
                onClick={() => handleChange("showAlertsChart", !filters.showAlertsChart)}
                icon={<AlertCircle size={14} />}
            />

            <div className="w-px h-6 bg-gray-200 mx-1 self-center hidden sm:block"></div>

            {/* 3. Lists - FIXED ICON HERE (List instead of ListAlert) */}
            <ToggleBtn 
                label="Critical List" 
                active={filters.showCriticalList} 
                onClick={() => handleChange("showCriticalList", !filters.showCriticalList)}
                icon={<List size={14} />} 
            />
            <ToggleBtn 
                label="Live Feed" 
                active={filters.showLiveFeed} 
                onClick={() => handleChange("showLiveFeed", !filters.showLiveFeed)}
                icon={<Activity size={14} />}
            />
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({ label, active, onClick, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all border
                ${active 
                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 opacity-60 hover:opacity-100"
                }
            `}
        >
            {icon} {label}
        </button>
    );
}