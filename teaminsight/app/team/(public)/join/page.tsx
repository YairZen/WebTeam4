"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TeamLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [teamId, setTeamId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const qTeamId = searchParams.get("teamId");
    if (qTeamId) setTeamId(qTeamId);
  }, [searchParams]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const tid = teamId.trim();
    const code = accessCode.trim();

    if (!tid || !code) {
      setErrorMsg("Please enter Team ID and Access Code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: tid, accessCode: code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data?.error || "Invalid credentials or server error.");
        return;
      }

      router.push("/team");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-100 to-indigo-200">
      <div className="w-full max-w-md rounded-xl border bg-white/90 backdrop-blur-sm p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Team Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          Use the Team ID and Access Code provided by the lecturer.
        </p>

        {errorMsg ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Team ID</label>
            <input
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="e.g., T-001"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Access Code</label>
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Enter your access code"
              type="password"
              autoComplete="off"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 font-semibold"
            type="submit"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
