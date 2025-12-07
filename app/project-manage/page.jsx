// app/project-manage/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutCustom from "@/components/LayoutCustom";

export default function ProjectManagePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingOrg, setDeletingOrg] = useState("");

  // Load email dari localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("user_email") || "";
    if (!storedEmail) {
      router.push("/login");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  // Fetch list project
  useEffect(() => {
    if (!email) return;
    async function fetchProjects() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({ email });
        const res = await fetch(`/api/user-projects?${params.toString()}`, {
          method: "GET",
        });

        if (!res.ok) {
          let j = {};
          try {
            j = await res.json();
          } catch (e) {}
          throw new Error(j.detail || "Failed to fetch projects");
        }

        const json = await res.json();
        setProjects(Array.isArray(json) ? json : []);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [email]);

  // Group project berdasarkan org_id
  const orgGroups = useMemo(() => {
    const map = {};
    for (const p of projects) {
      const orgId = p.org_id || p.organization_name || "unknown-org";
      if (!map[orgId]) map[orgId] = [];
      map[orgId].push(p);
    }
    return map;
  }, [projects]);

  const handleDeleteOrg = async (orgId) => {
    if (!orgId) return;

    const ok = window.confirm(
      `Delete organization "${orgId}"?\nSemua projects di bawahnya akan ikut terhapus.`
    );
    if (!ok) return;

    try {
      setDeletingOrg(orgId);
      const params = new URLSearchParams({ organization_name: orgId });
      const res = await fetch(`/api/delete-organization?${params.toString()}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.detail || data.error || `Failed to delete organization`
        );
      }

      // Hapus org dari state
      setProjects((prev) =>
        prev.filter((p) => p.org_id !== orgId && p.organization_name !== orgId)
      );

      // Kalau org/proj yang lagi aktif di localStorage sama dengan org ini, clear
      if (typeof window !== "undefined") {
        const currentOrg = localStorage.getItem("organization_name");
        if (currentOrg === orgId) {
          localStorage.removeItem("organization_name");
          localStorage.removeItem("project_name");
        }
      }

      alert(`Organization "${orgId}" berhasil dihapus.`);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to delete organization");
    } finally {
      setDeletingOrg("");
    }
  };

  const hasProjects = projects && projects.length > 0;

  return (
    <LayoutCustom>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#ECF4FF] via-white to-[#F5F7FB] px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Page */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0B4C92]">
                Project & Organization Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola organisasi dan project yang terhubung dengan akunmu.
              </p>
              {email && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Logged in as <span className="font-semibold">{email}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="px-4 py-2 rounded-lg bg-[#01559A] hover:bg-[#0468ba] text-white text-xs sm:text-sm font-semibold shadow-md"
              >
                + Create New Project
              </button>
              <button
                type="button"
                onClick={() => router.push("/home")}
                className="px-4 py-2 rounded-lg border border-[#C6D7F8] bg-white text-xs sm:text-sm text-[#0D5DB8] font-medium hover:bg-blue-50"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Error / loading */}
          {err && (
            <div className="mb-4 border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {err}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 rounded-full border-4 border-[#0D5DB8]/20 border-t-[#0D5DB8] animate-spin mb-3"></div>
              <p className="text-sm text-gray-600">Loading your projects...</p>
            </div>
          )}

          {!loading && !hasProjects && !err && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-[#E0ECFF] flex items-center justify-center text-3xl text-[#0D5DB8] mb-4">
                📂
              </div>
              <h2 className="text-lg font-semibold text-[#0B4C92] mb-1">
                No projects found
              </h2>
              <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
                Kamu belum memiliki project. Buat project baru untuk mulai
                menggunakan EasyFix.
              </p>
              <button
                type="button"
                onClick={() => router.push("/onboarding")}
                className="px-5 py-2.5 rounded-lg bg-[#01559A] hover:bg-[#0468ba] text-white text-sm font-semibold shadow-md"
              >
                Create your first project
              </button>
            </div>
          )}

          {/* LIST ORG + PROJECTS (Responsif) */}
          {!loading && hasProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(orgGroups).map(([orgId, orgProjects]) => (
                <div
                  key={orgId}
                  className="flex flex-col bg-white border border-[#E0E7FF] rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Organization
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">
                        {orgId}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {orgProjects.length}{" "}
                        {orgProjects.length > 1 ? "projects" : "project"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!!deletingOrg}
                      onClick={() => handleDeleteOrg(orgId)}
                      className="px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60"
                    >
                      {deletingOrg === orgId
                        ? "Deleting..."
                        : "Delete Organization"}
                    </button>
                  </div>

                  <div className="mt-2 space-y-2">
                    {orgProjects.map((p, idx) => (
                      <div
                        key={`${p.project_id || p.project_name || idx}`}
                        className="border border-[#E4ECFF] rounded-lg px-3 py-2 text-xs sm:text-sm flex flex-col gap-1 bg-[#F8FAFF]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-gray-900 break-all">
                            {p.project_id || p.project_name || "Project"}
                          </span>
                          {p.role && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E0ECFF] text-[10px] text-[#0D5DB8] font-medium">
                              {p.role}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                          {p.org_id && (
                            <span>
                              Org ID:{" "}
                              <span className="font-mono">{p.org_id}</span>
                            </span>
                          )}
                          {p.project_id && (
                            <span>
                              Project ID:{" "}
                              <span className="font-mono">{p.project_id}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutCustom>
  );
}
