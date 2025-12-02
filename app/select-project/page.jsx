"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutCustom from "@/components/LayoutCustom";

export default function SelectProjectPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("user_email") || "";
    if (!storedEmail) {
      router.push("/login");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

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

  const handleSelectProject = (p) => {
    if (typeof window !== "undefined") {
      if (p.organization_name) {
        localStorage.setItem("organization_name", p.organization_name);
      }
      if (p.project_name) {
        localStorage.setItem("project_name", p.project_name);
      }
      if (p.org_id) localStorage.setItem("organization_name", p.org_id);
      if (p.project_id) localStorage.setItem("project_name", p.project_id);
    }

    router.push("/home");
  };

  const handleCreateProject = () => {
    router.push("/onboarding");
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

          </div>


          {err && (
            <div className="mb-4 border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {err}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-12 w-12 rounded-full border-4 border-[#0D5DB8]/20 border-t-[#0D5DB8] animate-spin mb-4"></div>
              <p className="text-sm text-gray-600">Fetching your projects...</p>
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


          {!loading && hasProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p, idx) => (
                <button
                  key={`${p.org_id || "org"}-${p.project_id || idx}`}
                  type="button"
                  onClick={() => handleSelectProject(p)}
                  className="group text-left bg-white border border-[#E0E7FF] rounded-xl p-4 hover:border-[#0D5DB8] hover:shadow-md transition flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-[#E0ECFF] flex items-center justify-center text-[#0D5DB8]">
                        🏷️
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {p.organization_name || "Organization"}
                        </p>
                        <p className="text-sm md:text-base font-semibold text-gray-900">
                          {p.project_name || "Project name"}
                        </p>
                      </div>
                    </div>
                    {p.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#E0ECFF] text-[#0D5DB8] font-medium">
                        {p.role}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col text-[11px] text-gray-500">
                      {p.org_id && (
                        <span>
                          Org ID: <span className="font-mono">{p.org_id}</span>
                        </span>
                      )}
                      {p.project_id && (
                        <span>
                          Project ID:{" "}
                          <span className="font-mono">{p.project_id}</span>
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center text-xs font-semibold text-[#0D5DB8] group-hover:translate-x-0.5 transition-transform">
                      Use this project
                      <span className="ml-1">→</span>
                    </span>
                  </div>
                </button>
              ))}

              {/* Extra card: Create new project */}
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
