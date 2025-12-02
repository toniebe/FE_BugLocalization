"use client";

import { logout } from "@/app/_lib/auth-client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

function Header() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [currentOrg, setCurrentOrg] = useState("");
  const [currentProject, setCurrentProject] = useState("");
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const projectBtnRef = useRef(null);
  const userBtnRef = useRef(null);

  // Load current org/project + email, lalu fetch list project
  useEffect(() => {
    if (typeof window === "undefined") return;

    const org = localStorage.getItem("organization_name") || "";
    const proj = localStorage.getItem("project_name") || "";
    const email = localStorage.getItem("user_email") || "";

    setCurrentOrg(org);
    setCurrentProject(proj);

    if (!email) return;

    async function fetchProjects() {
      setProjectsLoading(true);
      setProjectsError("");
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
        console.error("fetch projects error:", e);
        setProjectsError(e?.message || "Failed to fetch projects");
      } finally {
        setProjectsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // click outside untuk nutup dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        projectBtnRef.current &&
        !projectBtnRef.current.contains(e.target)
      ) {
        setProjectMenuOpen(false);
      }
      if (userBtnRef.current && !userBtnRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    if (projectMenuOpen || userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [projectMenuOpen, userMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("organization_name");
      localStorage.removeItem("project_name");
      localStorage.removeItem("org_id");
      localStorage.removeItem("project_id");
      localStorage.removeItem("user_email");
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      router.replace("/login");
    }
  };

  const handleSelectProject = (p) => {
    if (typeof window !== "undefined") {
      if (p.organization_name) {
        localStorage.setItem("organization_name", p.organization_name);
      }
      if (p.project_name) {
        localStorage.setItem("project_name", p.project_name);
      }
      if (p.org_id) {
        localStorage.setItem("organization_name", p.org_id);
      }
      if (p.project_id) {
        localStorage.setItem("project_name", p.project_id);
      }
    }

    setCurrentOrg(p.org_id || "");
    setCurrentProject(p.project_id || "");
    setProjectMenuOpen(false);

    // arahkan ke home (atau refresh current page)
    router.push("/home");
  };

  const handleGoOnboarding = () => {
    setProjectMenuOpen(false);
    router.push("/onboarding");
  };

  const projectLabel =
    currentOrg && currentProject
      ? `${currentOrg} / ${currentProject}`
      : "Select project";

  return (
    <header className="w-full border-b border-[#e4e4e4] bg-white">
      <div className="px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <button
          className="flex items-center gap-2 text-[#0D5DB8] font-semibold text-left px-2 py-1 rounded hover:bg-blue-50/60 transition"
          onClick={() => {
            router.push("/home");
          }}
        >
          <img src="/easyfix-logo.png" alt="EasyFix Logo" className="h-8" />
        </button>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            className="text-[#0D5DB8] font-medium px-3 py-2 text-sm rounded hover:bg-blue-50/60 transition"
            onClick={() => {
              router.push("/home");
            }}
          >
            Home
          </button>
          <button
            className="text-[#0D5DB8] font-medium px-3 py-2 text-sm rounded hover:bg-blue-50/60 transition"
            onClick={() => {
              router.push("/find-bug");
            }}
          >
            Find Bug
          </button>
          <button
            className="text-[#0D5DB8] font-medium px-3 py-2 text-sm rounded hover:bg-blue-50/60 transition"
            onClick={() => {
              router.push("/new-bug");
            }}
          >
            New Bug
          </button>
          <button
            className="text-[#0D5DB8] font-medium px-3 py-2 text-sm rounded hover:bg-blue-50/60 transition"
            onClick={() => {
              router.push("/developer-recommendation");
            }}
          >
            Developer Recommendation
          </button>
        </nav>

        {/* Right: Project dropdown + user dropdown */}
        <div className="flex items-center gap-3">
          {/* PROJECT DROPDOWN */}
          <div className="relative" ref={projectBtnRef}>
            <button
              type="button"
              onClick={() => setProjectMenuOpen((o) => !o)}
              className="flex items-center max-w-xs md:max-w-sm gap-2 px-3 py-1.5 rounded-full border border-[#D0E2FF] bg-[#F3F7FF] hover:bg-[#E6F0FF] text-xs md:text-sm text-[#0D5DB8] font-medium shadow-sm transition"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E0ECFF] text-[#0D5DB8] text-sm">
                🧩
              </span>
              <span className="truncate">{projectLabel}</span>
              <span className="text-[10px] md:text-xs text-[#0D5DB8]">
                {projectMenuOpen ? "▲" : "▼"}
              </span>
            </button>

            {projectMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 md:w-72 bg-white border border-[#E0E7FF] rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-[#E5EDFF] bg-[#F5F7FF] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#0D5DB8]">
                      Projects
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Switch projects
                    </p>
                  </div>
                </div>

                <div className="max-h-64 overflow-auto">
                  {projectsLoading && (
                    <div className="px-3 py-3 text-xs text-gray-500 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border-2 border-[#0D5DB8]/30 border-t-[#0D5DB8] animate-spin" />
                      Loading projects...
                    </div>
                  )}

                  {projectsError && !projectsLoading && (
                    <div className="px-3 py-3 text-xs text-red-600">
                      {projectsError}
                    </div>
                  )}

                  {!projectsLoading &&
                    !projectsError &&
                    projects.length === 0 && (
                      <div className="px-3 py-3 text-xs text-gray-500">
                        You don&apos;t have any projects yet.
                      </div>
                    )}

                  {projects.map((p, idx) => {
                    const isActive =
                      p.org_id === currentOrg &&
                      p.project_id === currentProject;
                    return (
                      <button
                        key={`${p.org_id || "org"}-${p.project_id || idx}`}
                        type="button"
                        onClick={() => handleSelectProject(p)}
                        className={`w-full text-left px-3 py-2 text-xs md:text-sm flex items-start justify-between gap-2 hover:bg-blue-50 transition ${
                          isActive ? "bg-blue-50/80" : "bg-white"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[11px] text-gray-500">
                            {p.org_id || "Organization"}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {p.project_id || "Project"}
                          </span>
                          {p.role && (
                            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-[#E0ECFF] text-[10px] text-[#0D5DB8] font-medium">
                              {p.role}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <span className="text-[11px] text-[#0D5DB8] font-semibold mt-1">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

          {/* USER DROPDOWN */}
          <div className="relative" ref={userBtnRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0D5DB8] to-[#4F8DFF] text-white flex items-center justify-center text-sm font-semibold shadow cursor-pointer"
            >
              {/* Bisa diganti inisial user */}
              U
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/team");
                  }}
                >
                  Team
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/profile");
                  }}
                >
                  Edit Profile
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
