"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type Profile = {
  key: string;
  title: string;
  description: string;
  greenMin: number;
  redMax: number;
};

type ProfilesRes =
  | { ok: true; profiles: Profile[] }
  | { error: string; details?: string };

type SettingsRes =
  | { ok: true; selectedProfileKey: string; weeklyInstructions: string }
  | { error: string; details?: string };

export default function LecturerReflectionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileKey, setSelectedProfileKey] = useState("default");
  const [weeklyInstructions, setWeeklyInstructions] = useState("");

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.key === selectedProfileKey),
    [profiles, selectedProfileKey]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const [pRes, sRes] = await Promise.all([
          fetch("/api/lecturer/reflection/profiles", { cache: "no-store" }),
          fetch("/api/lecturer/reflection/settings", { cache: "no-store" }),
        ]);

        const pData = (await pRes.json()) as ProfilesRes;
        const sData = (await sRes.json()) as SettingsRes;

        if (cancelled) return;

        if ("ok" in pData && pData.ok) setProfiles(pData.profiles || []);
        else console.error("Profiles load failed:", pData);

        if ("ok" in sData && sData.ok) {
          setSelectedProfileKey(sData.selectedProfileKey || "default");
          setWeeklyInstructions(sData.weeklyInstructions || "");
        } else {
          console.error("Settings load failed:", sData);
        }
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/lecturer/reflection/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedProfileKey, weeklyInstructions }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Save failed:", data);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-6">
          <Link
            href="/lecturer/dashboard"
            className="rounded-xl border px-3 py-2 text-sm bg-white hover:bg-gray-50"
          >
            Back
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Weekly Reflection Settings</h1>
        <p className="text-gray-600 mb-8">
          Choose a chat profile and set weekly instructions used by the reflection bot.
        </p>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Profile</label>

            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <select
                className="w-full border rounded-md px-3 py-2"
                value={selectedProfileKey}
                onChange={(e) => setSelectedProfileKey(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.title} ({p.key})
                  </option>
                ))}
              </select>
            )}

            {selectedProfile ? (
              <div className="mt-3 text-sm text-gray-600">
                <div className="font-medium">{selectedProfile.description}</div>
                <div>
                  Thresholds: greenMin={selectedProfile.greenMin}, redMax={selectedProfile.redMax}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Weekly Instructions (optional)
            </label>
            <textarea
              className="w-full border rounded-md px-3 py-2 min-h-[140px]"
              value={weeklyInstructions}
              onChange={(e) => setWeeklyInstructions(e.target.value)}
              placeholder="Example: This week focus on blockers, mitigation owners, and PR links."
            />
            <div className="text-xs text-gray-500 mt-2">
              Leave empty to disable weekly instructions.
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSave}
              disabled={loading || saving}
              className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
