// app/select-project/page.js
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutCustom from "@/components/LayoutCustom";
import { getProjectStatus } from "@/app/_lib/project";

export default function SelectProjectPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectingKey, setSelectingKey] = useState(null); // indikator ketika klik project
  const [deletingOrg, setDeletingOrg] = useState(""); // indikator delete org

  // load email dari localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("user_email") || "";
    if (!storedEmail) {
      router.push("/login");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  // fetch list projects
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

  // group project berdasarkan org
  const orgGroups = useMemo(() => {
    const map = {};
    for (const p of projects) {
      const orgId = p.org_id || p.organization_name || "unknown-org";
      if (!map[orgId]) map[orgId] = [];
      map[orgId].push(p);
    }
    return map;
  }, [projects]);

  // pilih project → cek status onboarding → redirect
  const handleSelectProject = async (p) => {
    if (typeof window === "undefined") return;

    const org = p.org_id || p.organization_name;
    const proj = p.project_id || p.project_name;

    if (!org || !proj) {
      console.error("Missing org or project in selected project", p);
      return;
    }

    // simpan ke localStorage
    localStorage.setItem("organization_name", org);
    localStorage.setItem("project_name", proj);

    if (p.org_id) localStorage.setItem("organization_id", p.org_id);
    if (p.project_id) localStorage.setItem("project_id", p.project_id);

    const projectKey = `${org}-${proj}`;
    setSelectingKey(projectKey);

    try {
      // panggil status project ke backend
      const status = await getProjectStatus(org, proj);

      const steps = status?.steps || {};
      const isCompleted =
        steps.project_created &&
        steps.datasource_created &&
        steps.model_created &&
        steps.db_stored;

      if (isCompleted) {
        // semua step onboarding selesai → langsung ke home
        localStorage.removeItem("onboarding_step");
        router.push("/home");
      } else {
        // belum selesai → lanjut onboarding dari current_step
        const currentStep = Number(status.current_step) || 1;
        localStorage.setItem("onboarding_step", String(currentStep));
        router.push("/onboarding");
      }
    } catch (e) {
      console.error("Failed to fetch project status:", e);
      // fallback: kalau gagal cek status, mulai dari step 1
      localStorage.setItem("onboarding_step", "1");
      router.push("/onboarding");
    } finally {
      setSelectingKey(null);
    }
  };

  // create project baru
  const handleCreateProject = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("organization_name");
      localStorage.removeItem("project_name");
      localStorage.setItem("onboarding_step", "1");
    }
    router.push("/onboarding");
  };

  // delete organization
  const handleDeleteOrg = async (orgId) => {
    if (!orgId) return;
    if (typeof window === "undefined") return;

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
          data.detail || data.error || "Failed to delete organization"
        );
      }

      // buang semua projects org tersebut dari state
      setProjects((prev) =>
        prev.filter(
          (p) =>
            (p.org_id || p.organization_name || "unknown-org") !== orgId
        )
      );

      // kalau org yg dihapus sedang aktif → reset localStorage
      const currentOrg = localStorage.getItem("organization_name");
      if (currentOrg === orgId) {
        localStorage.removeItem("organization_name");
        localStorage.removeItem("project_name");
        localStorage.removeItem("organization_id");
        localStorage.removeItem("project_id");
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#ECF4FF] via-white to-[#F5F7FB]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0B4C92] flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0ECFF] text-[#0D5DB8] text-xl">
                  🧩
                </span>
                Select Your Project
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Choose an existing project or create a new one to start
                exploring EasyFix Bug Graph.
              </p>
              {email && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Logged in as <span className="font-semibold">{email}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3">
              <button
                type="button"
                onClick={handleCreateProject}
                className="px-4 py-2.5 rounded-lg bg-[#01559A] hover:bg-[#0468ba] text-white text-xs md:text-sm font-semibold shadow-md"
              >
                + Create New Project
              </button>
            </div>
          </div>

          {/* Error */}
          {err && (
            <div className="mb-4 border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {err}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-12 w-12 rounded-full border-4 border-[#0D5DB8]/20 border-t-[#0D5DB8] animate-spin mb-4"></div>
              <p className="text-sm text-gray-600">Fetching your projects...</p>
            </div>
          )}

          {/* Tidak ada project */}
          {!loading && !hasProjects && !err && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-[#E0ECFF] flex items-center justify-center text-3xl text-[#0D5DB8] mb-4">
                📂
              </div>
              <h2 className="text-lg font-semibold text-[#0B4C92] mb-1">
                No projects found
              </h2>
              <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
                You don&apos;t have any projects yet. Create your first project
                to start tracking bugs, developers, and topics.
              </p>
              <button
                type="button"
                onClick={handleCreateProject}
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
                    {orgProjects.map((p, idx) => {
                      const org = p.org_id || p.organization_name || orgId;
                      const proj =
                        p.project_id || p.project_name || `project-${idx}`;
                      const key = `${org}-${proj}`;
                      const isSelecting = selectingKey === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectProject(p)}
                          disabled={isSelecting}
                          className="w-full text-left border border-[#E4ECFF] rounded-lg px-3 py-2 text-xs sm:text-sm flex flex-col gap-1 bg-[#F8FAFF] hover:border-[#0D5DB8] hover:bg-[#EEF4FF] transition disabled:opacity-60"
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
                                <span className="font-mono">
                                  {p.org_id}
                                </span>
                              </span>
                            )}
                            {p.project_id && (
                              <span>
                                Project ID:{" "}
                                <span className="font-mono">
                                  {p.project_id}
                                </span>
                              </span>
                            )}
                          </div>
                          <span className="mt-1 inline-flex items-center text-[11px] font-semibold text-[#0D5DB8]">
                            {isSelecting ? "Loading..." : "Use this project"}
                            <span className="ml-1">→</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* extra card create project */}
              <button
                type="button"
                onClick={handleCreateProject}
                className="border-2 border-dashed border-[#BFD3FF] rounded-xl p-4 bg-[#F5F7FF] hover:border-[#0D5DB8] hover:bg-[#E9F1FF] transition flex flex-col items-start justify-center gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-[#0D5DB8]">
                    ➕
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0B4C92]">
                      Create a new project
                    </p>
                    <p className="text-xs text-gray-600">
                      Setup a new organization / project workspace in EasyFix.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </LayoutCustom>
  );
}
