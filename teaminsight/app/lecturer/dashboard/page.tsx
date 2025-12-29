/**
 * Lecturer Dashboard Page
 * -----------------------
 * Purpose:
 * Main entry page for the lecturer after login.
 * Provides quick overview and navigation to all lecturer features.
 *
 * According to course architecture:
 * - Page-level component (App Router)
 * - No business logic here
 * - Navigation-oriented UI
 */

import Link from "next/link";

export default function LecturerDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center px-6 py-12">
      
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8">
        Lecturer Dashboard
      </h1>

      {/* Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        
        {/* Teams Overview */}
        <DashboardCard
          title="Teams Overview"
          description="View all teams status, progress and analytics"
          href="/lecturer/teams"
        />

        {/* Analytics */}
        <DashboardCard
          title="Teams Analytics"
          description="Charts, tables and team statistics"
          href="/lecturer/analytics"
        />

        {/* Announcements */}
        <DashboardCard
          title="Announcements"
          description="Publish messages and tasks to teams"
          href="/lecturer/announcements"
        />

        {/* Alerts */}
        <DashboardCard
          title="Alerts & Notifications"
          description="View abnormal team states and alerts history"
          href="/lecturer/alerts"
        />

      </section>
    </main>
  );
}

/**
 * DashboardCard
 * -------------
 * Reusable UI component for dashboard navigation.
 * Pure presentational component (no state).
 */
function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
