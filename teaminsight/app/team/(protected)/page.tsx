"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Users,
  Bot,
  Sparkles,
  MessageSquare,
  PenLine,
  Home,
  Mail,
  Hash,
  Bell,
  RefreshCw,
  AlertTriangle,
  CircleDot,
  Command,
} from "lucide-react";

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
    return {
      label: "Green",
      pillClass: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
      dotClass: "text-emerald-600",
    };
  }
  if (s === "yellow") {
    return {
      label: "Yellow",
      pillClass: "bg-amber-50 text-amber-900 border-amber-200/70",
      dotClass: "text-amber-600",
    };
  }
  if (s === "red") {
    return {
      label: "Red",
      pillClass: "bg-rose-50 text-rose-800 border-rose-200/70",
      dotClass: "text-rose-600",
    };
  }

  return {
    label: status || "Unknown",
    pillClass: "bg-slate-50 text-slate-800 border-slate-200/70",
    dotClass: "text-slate-500",
  };
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
    <div className="min-h-screen bg-[#E8EDF3] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-emerald-300/14 blur-3xl" />
        <div className="absolute -bottom-36 -right-28 h-[30rem] w-[30rem] rounded-full bg-sky-300/14 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-300/10 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Users className="absolute -top-12 -left-12 h-52 w-52 text-emerald-900 opacity-[0.045] rotate-[-12deg]" />
        <Bot className="absolute top-10 -right-14 h-52 w-52 text-indigo-900 opacity-[0.042] rotate-[10deg]" />
        <MessageSquare className="absolute -bottom-14 left-10 h-56 w-56 text-slate-900 opacity-[0.04] rotate-[8deg]" />
        <PenLine className="absolute bottom-14 -right-10 h-48 w-48 text-sky-900 opacity-[0.04] rotate-[-10deg]" />
        <Sparkles className="absolute top-24 left-1/2 -translate-x-1/2 h-44 w-44 text-emerald-900 opacity-[0.03] rotate-[6deg]" />
        <Home className="absolute top-1/2 right-1/3 h-44 w-44 text-slate-900 opacity-[0.02] rotate-[10deg]" />
      </div>

      <main className="mx-auto w-full max-w-7xl px-6 lg:px-10 py-10 lg:py-14 relative">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white/40 backdrop-blur flex items-center justify-center">
                  <Home className="h-5 w-5 text-emerald-700" />
                </div>

                <div>
                  <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">
                    Team Home
                  </h1>
                  <p className="mt-2 text-base lg:text-lg text-slate-600">
                    Your team hub: status, members and quick access.
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-base ${statusUI.pillClass}`}
              >
                <CircleDot className={`h-4 w-4 ${statusUI.dotClass}`} />
                <span className="font-semibold">Status:</span>
                <span>{statusUI.label}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200/80 bg-[#F2F5FA] p-8 shadow-lg shadow-slate-900/5">
              <div className="h-7 w-80 rounded bg-slate-200/60" />
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-28 rounded-2xl bg-slate-200/60" />
                <div className="h-28 rounded-2xl bg-slate-200/60" />
                <div className="h-28 rounded-2xl bg-slate-200/60" />
                <div className="h-28 rounded-2xl bg-slate-200/60" />
              </div>
            </div>
          ) : errorMsg ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 shadow-lg shadow-slate-900/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-700 mt-0.5" />
                <div>
                  <div className="text-base font-semibold text-red-800">Error</div>
                  <div className="mt-1 text-base text-red-700">{errorMsg}</div>
                </div>
              </div>

              <button
                onClick={load}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-500 active:translate-y-[1px]"
                type="button"
              >
                <RefreshCw className="h-5 w-5" />
                Retry
              </button>
            </div>
          ) : team ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <section className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-[#F2F5FA] p-8 shadow-lg shadow-slate-900/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-emerald-700" />
                      <h2 className="text-xl lg:text-2xl font-semibold text-slate-900">
                        Team Overview
                      </h2>
                    </div>
                    <p className="mt-2 text-base text-slate-600">
                      Basic team details.
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InfoBlock
                    title="Team ID"
                    value={team.teamId}
                    icon={<Hash className="h-5 w-5 text-slate-600" />}
                  />
                  <InfoBlock
                    title="Project Name"
                    value={team.projectName || "—"}
                    icon={<Sparkles className="h-5 w-5 text-slate-600" />}
                  />
                  <InfoBlock
                    title="Contact Email"
                    value={team.contactEmail || "—"}
                    icon={<Mail className="h-5 w-5 text-slate-600" />}
                  />
                  <InfoBlock
                    title="Members"
                    value={`${members.length}`}
                    icon={<Users className="h-5 w-5 text-slate-600" />}
                  />
                </div>

                <div className="mt-8">
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <Users className="h-5 w-5 text-emerald-700" />
                    Members
                  </div>

                  {members.length === 0 ? (
                    <div className="mt-3 text-base text-slate-600">No members listed.</div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {members.map((m) => (
                        <div
                          key={m.memberId}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/45 backdrop-blur px-5 py-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-11 w-11 rounded-2xl border border-slate-200 bg-white/50 flex items-center justify-center">
                              <Users className="h-5 w-5 text-emerald-700" />
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-base font-semibold text-slate-900">
                                {m.displayName || "Member"}
                              </div>
                              <div className="truncate text-sm text-slate-600">
                                {m.memberId}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <aside className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-[#F2F5FA] p-8 shadow-lg shadow-slate-900/5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white/45 backdrop-blur flex items-center justify-center">
                    <Command className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-semibold text-slate-900">
                      Workspace
                    </h2>
                    <p className="mt-1 text-base text-slate-600">
                      Reflection & updates.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-4">
                  <ActionLink
                    href="/team/reflection"
                    icon={<PenLine className="h-5 w-5 text-emerald-700" />}
                    title="Weekly Reflection"
                    subtitle="Write reflections with AI guidance"
                  />

                  <ActionLink
                    href="/team/announcements"
                    icon={<Bell className="h-5 w-5 text-emerald-700" />}
                    title="Announcements"
                    subtitle="Updates and notices"
                  />
                </div>
              </aside>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function InfoBlock({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/45 backdrop-blur p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        {icon}
        <span>{title}</span>
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white/45 backdrop-blur px-5 py-4 transition hover:bg-white/60 hover:border-slate-300"
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 h-12 w-12 rounded-2xl border border-slate-200 bg-white/50 flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600 leading-6">{subtitle}</div>
        </div>
      </div>
    </Link>
  );
}
