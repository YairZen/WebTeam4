/* --- 1. Domain Entities --- */

export type TeamMember = {
  memberId: string;
  displayName: string;
};

export type Team = {
  teamId: string;
  projectName?: string;
  status: "green" | "yellow" | "red";
  members?: TeamMember[];
  updatedAt?: string;
};

/* --- 2. Analytics Data Structures --- */

export type QualityData = {
  teamId: string;
  avgMessages: number;
  avgDuration: number;
  lastActivity: number | null;
  latestStatus: string | null;
  sessionCount: number;
};

export type AlertItem = {
  team: string;
  yellow: number;
  red: number;
};

export type StatusChartData = {
  name: string;
  value: number;
  fill?: string;
};

/* --- 3. Filter State (Updated) --- */
export type FilterState = {
  teamId: string;
  status: string;
  startDate: string;
  endDate: string;
  
  // Toggles for ALL widgets
  showKpiStats: boolean;      // <-- NEW
  showStatusChart: boolean;
  showQualityChart: boolean;
  showAlertsChart: boolean;
  showCriticalList: boolean;  // <-- NEW
  showLiveFeed: boolean;      // <-- NEW
};