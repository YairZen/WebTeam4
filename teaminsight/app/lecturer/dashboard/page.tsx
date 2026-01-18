/**
 * Lecturer Dashboard Page
 * -----------------------
 * Purpose:
 * Main entry page for the lecturer after login.
 * Provides quick overview and navigation to all lecturer features.
 *
 * Refactored to use shared UI components
 */

import { Users, BarChart3, Bell, MessageSquare, Settings } from "lucide-react";
import { DashboardCard } from "@/components/ui";

export default function LecturerDashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col items-center px-6 py-12">
      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
        Lecturer Dashboard
      </h1>

      <p className="text-gray-600 mb-8">Manage teams, analytics, and communications</p>

      {/* Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {/* Teams Overview */}
        <DashboardCard
          title="Teams Overview"
          description="View all teams status, progress and analytics"
          href="/lecturer/teams"
          icon={<Users className="w-8 h-8 text-blue-600" />}
          color="blue"
        />

        {/* Teams Management */}
        <DashboardCard
          title="Teams Management"
          description="Create and manage teams (members, access codes, emails)"
          href="/lecturer/teams/manage"
          icon={<Settings className="w-8 h-8 text-purple-600" />}
          color="purple"
        />

        {/* Analytics */}
        <DashboardCard
          title="Teams Analytics"
          description="Charts, tables and team statistics"
          href="/lecturer/analytics"
          icon={<BarChart3 className="w-8 h-8 text-green-600" />}
          color="green"
        />

        {/* Announcements */}
        <DashboardCard
          title="Announcements"
          description="Publish messages and tasks to teams"
          href="/lecturer/announcements"
          icon={<MessageSquare className="w-8 h-8 text-indigo-600" />}
          color="indigo"
        />

        {/* Alerts */}
        <DashboardCard
          title="Alerts & Notifications"
          description="View abnormal team states and alerts history"
          href="/lecturer/alerts"
          icon={<Bell className="w-8 h-8 text-red-600" />}
          color="red"
        />

        {/* Reflection Settings */}
        <DashboardCard
          title="Weekly Reflection Settings"
          description="Choose reflection profile and set weekly instructions"
          href="/lecturer/reflection-settings"
          icon={<Settings className="w-8 h-8 text-purple-600" />}
          color="purple"
        />
      </section>
    </main>
  );
}
