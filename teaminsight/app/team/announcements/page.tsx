"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeamAnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setItems(data.announcements || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-gray-600">
        Loading…
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Announcements</h1>

        <Link
          href="/team"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Team Dashboard
        </Link>
      </div>

      <div className="text-xs text-gray-500">
        {items.length} item{items.length === 1 ? "" : "s"}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-gray-50 p-6 text-sm text-gray-700">
          No announcements
        </div>
      ) : (
        items.map((a) => (
          <div
            key={a._id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-lg font-semibold text-gray-900">
                {a.title}
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
              {a.body}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
