"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TeamMember = {
  memberId: string;
  displayName: string;
};

type Team = {
  teamId: string;
  projectName?: string;
  status?: string;
  members?: TeamMember[];
  contactEmail?: string;
};

type MeOk = { ok: true; team: Team };
type MeErr = { error: string; details?: string };
type MeResponse = MeOk | MeErr;

function getStatusUI(status?: string) {
  const s = (status || "").toLowerCase();

  if (s === "green") {
    return { label: "Green", className: "bg-green-50 text-green-700 border-green-200" };
  }
  if (s === "yellow") {
    return { label: "Yellow", className: "bg-yellow-50 text-yellow-800 border-yellow-200" };
  }
  if (s === "red") {
    return { label: "Red", className: "bg-red-50 text-red-700 border-red-200" };
  }

  return { label: status || "Unknown", className: "bg-gray-50 text-gray-700 border-gray-200" };
}

export default function TeamHomePage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function load() {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/team/me", { method: "GET", credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as MeResponse;

      if (!res.ok || !("ok" in data)) {
        setTeam(null);
        setErrorMsg(("error" in data && data.error) ? data.error : "Failed to load team.");
        return;
      }

      setTeam(data.team);
    } catch {
      setTeam(null);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statusUI = useMemo(() => getStatusUI(team?.status), [team?.status]);
  const members = team?.members || [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Team Home Page</h1>

            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${statusUI.className}`}>
              <span className="font-medium">Status:</span>
              <span className="ml-2">{statusUI.label}</span>
            </div>
          </div>

          <p className="text-gray-600">
            Team overview & actions.
          </p>
        </div>

        {/* States */}
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="h-5 w-56 rounded bg-gray-100" />
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="h-20 rounded-xl bg-gray-100" />
              <div className="h-20 rounded-xl bg-gray-100" />
              <div className="h-20 rounded-xl bg-gray-100" />
              <div className="h-20 rounded-xl bg-gray-100" />
            </div>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="text-sm font-medium text-red-800">Error</div>
            <div className="mt-1 text-sm text-red-700">{errorMsg}</div>
            <button
              onClick={load}
              className="mt-4 rounded-xl bg-black px-4 py-2 text-sm text-white"
              type="button"
            >
              Retry
            </button>
          </div>
        ) : team ? (
          <>
            {/* Overview + Actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Overview Card */}
              <section className="lg:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Team Overview</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Key details for this team.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoBlock title="Team ID" value={team.teamId} />
                  <InfoBlock title="Project Name" value={team.projectName || "—"} />
                  <InfoBlock title="Contact Email" value={team.contactEmail || "—"} />
                  <InfoBlock title="Members" value={`${members.length}`} />
                </div>

                <div className="mt-6">
                  <div className="text-sm font-medium text-gray-900">Members</div>
                  {members.length === 0 ? (
                    <div className="mt-2 text-sm text-gray-600">No members listed.</div>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {members.map((m) => (
                        <div
                          key={m.memberId}
                          className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {m.displayName || "Member"}
                            </div>
                            <div className="truncate text-xs text-gray-600">
                              {m.memberId}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Actions */}
              <aside className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Actions</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Continue to the main tools.
                </p>

                <div className="mt-5 flex flex-col gap-3">


                  <Link
                    href="/team/reflection"
                    className="rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                  >
                    Weekly Reflection
                  </Link>

                  <Link
                    href="/team/messages"
                    className="rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                  >
                    Messages
                  </Link>

                  <Link
                    href="/team/announcements"
                    className="rounded-2xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                  >
                    Announcements
                  </Link>


                </div>


              </aside>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-gray-50 p-4">
      <div className="text-xs font-medium text-gray-600">{title}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}
