"use client";

import { useEffect, useState } from "react";
import LayoutCustom from "@/components/LayoutCustom";

const MOCK_MEMBERS = [
  { email: "owner@example.com", role: "owner" },
  { email: "dev1@example.com", role: "member" },
  { email: "qa@example.com", role: "member" },
];

export default function TeamPage() {
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [orgId, setOrgId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // kalau sebelumnya kamu simpan org_id / project_id di localStorage
    const org =
      localStorage.getItem("org_id") ||
      localStorage.getItem("organization_name") ||
      "";
    const proj =
      localStorage.getItem("project_id") ||
      localStorage.getItem("project_name") ||
      "";
    setOrgId(org);
    setProjectId(proj);
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!email) {
      setError("Please input email");
      return;
    }
    if (!orgId || !projectId) {
      setError("Organization & project are not set.");
      return;
    }

    const confirmAdd = window.confirm(
      `Add ${email} as ${role} to project ${orgId}/${projectId}?`
    );
    if (!confirmAdd) return;

    setLoading(true);
    try {
      const res = await fetch("/api/project-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          org_id: orgId,
          project_id: projectId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to add member");
      }

      // Tambahkan ke list members
      setMembers((prev) => [
        ...prev,
        { email: data.email, role: data.role || "member" },
      ]);

      setMsg(data.message || "User added to project successfully");
      setEmail("");
      setRole("member");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutCustom>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#0D5DB8]">
              Project Team
            </h1>
            <p className="text-sm text-gray-600">
              Manage who can collaborate on this EasyFix project.
            </p>
          </div>
          <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full max-w-xs md:max-w-sm text-right">
            {orgId && projectId ? (
              <>
                Active project:{" "}
                <span className="font-semibold text-[#0D5DB8]">{orgId}</span> /{" "}
                <span className="font-semibold text-[#0D5DB8]">
                  {projectId}
                </span>
              </>
            ) : (
              "No active project selected"
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Members list */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#e4e4e4] shadow-sm p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E0ECFF] text-[#0D5DB8] text-base">
                  👥
                </span>
                Team members ({members.length})
              </h2>
            </div>

            {members.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada anggota. Tambahkan email di panel sebelah.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {members.map((m, idx) => (
                  <li
                    key={`${m.email}-${idx}`}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0D5DB8] to-[#4F8DFF] text-white flex items-center justify-center text-sm font-semibold">
                        {m.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {m.email}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {m.role || "member"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-[#0D5DB8] border border-blue-100 capitalize">
                      {m.role || "member"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add member panel */}
          <div className="bg-white rounded-xl border border-[#e4e4e4] shadow-sm p-4 md:p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0D5DB8] text-white text-base">
                +
              </span>
              Invite member
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Invite teammates by email to collaborate on this project.
            </p>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full border border-[#d0d7e2] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0D5DB8]/20 focus:border-[#0D5DB8] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-[#d0d7e2] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0D5DB8]/20 focus:border-[#0D5DB8] transition"
                >
                  <option value="member">Member</option>
                  <option value="owner">Owner</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-2 py-1.5">
                  {error}
                </div>
              )}
              {msg && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1.5">
                  {msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#0D5DB8] hover:bg-[#0b51aa] text-white text-sm font-medium px-4 py-2.5 rounded-md shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading && (
                  <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                )}
                <span>{loading ? "Adding..." : "Invite to project"}</span>
              </button>
            </form>

            {!orgId || !projectId ? (
              <p className="mt-3 text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5">
                Active project is not set. Please select project first from the
                header project switcher.
              </p>
            ) : (
              <p className="mt-3 text-[11px] text-gray-500">
                Members will be added to:{" "}
                <span className="font-semibold text-[#0D5DB8]">
                  {orgId} / {projectId}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </LayoutCustom>
  );
}
