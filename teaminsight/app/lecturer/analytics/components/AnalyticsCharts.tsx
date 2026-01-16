"use client";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart, // We will use BarChart for both charts now
  Bar
} from "recharts";
import { FilterState, QualityData, AlertItem } from "../types";

type Props = {
  filters: FilterState;
  statusData: { name: string; value: number }[];
  qualityData: QualityData[]; 
  alertsData: AlertItem[];
};

export default function AnalyticsCharts({ filters, statusData, qualityData, alertsData }: Props) {
  
  const allCharts = [
    // --- 1. Status Distribution (Pie) ---
    {
      id: 'status',
      visible: filters.showStatusChart,
      component: (
        <ChartCard title="Teams Status Distribution">
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie 
                data={statusData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={70} 
                outerRadius={120} 
                label
              >
                <Cell fill="#22c55e" />
                <Cell fill="#eab308" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )
    },
    // --- 2. Total Sessions per Team (Simple Bar Chart) ---
    {
      id: 'engagement', 
      visible: filters.showQualityChart, 
      component: (
        <ChartCard title="Total Conversations per Team">
          <p className="text-xs text-gray-500 text-center mb-2">
            Number of distinct sessions submitted or in progress
          </p>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={qualityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              
              <XAxis 
                dataKey="teamId" 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tick={{ fontSize: 11 }} 
              />
              
              <YAxis 
                allowDecimals={false} // Ensure we only show integers (1, 2, 3...)
                label={{ value: 'Sessions', angle: -90, position: 'insideLeft', offset: 10 }}
              />

              <Tooltip 
                cursor={{ fill: '#f3f4f6' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />

              <Bar 
                dataKey="sessionCount" 
                name="Total Sessions" 
                fill="#8b5cf6" // Purple color
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )
    },
    // --- 3. Alerts (Bar) ---
    {
      id: 'alerts',
      visible: filters.showAlertsChart,
      component: (
        <ChartCard title="Alerts per Team (by Severity)">
           <p className="text-xs text-transparent mb-2 select-none">Spacer</p>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={alertsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" interval={0} angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="yellow" fill="#eab308" name="Warning (Yellow)" />
              <Bar dataKey="red" fill="#ef4444" name="Critical (Red)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )
    }
  ];

  // Logic to show charts
  const activeCharts = allCharts.filter(c => c.visible);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12 w-full">
      {activeCharts.map((chartItem, index) => {
        // If odd number of charts, make the last one span full width
        const isLast = index === activeCharts.length - 1;
        const isOddTotal = activeCharts.length % 2 !== 0;
        const spanFull = isLast && isOddTotal;

        return (
          <div key={chartItem.id} className={spanFull ? "xl:col-span-2 w-full" : "xl:col-span-1 w-full"}>
            {chartItem.component}
          </div>
        );
      })}
    </div>
  );
}

/* UI Helper Component */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full h-full">
      <h3 className="text-lg font-semibold mb-5 text-center text-gray-800">
        {title}
      </h3>
      <div className="w-full h-[360px] relative">
        {children}
      </div>
    </div>
  );
}