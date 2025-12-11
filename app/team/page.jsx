"use client";

import { useEffect, useState } from "react";
import LayoutCustom from "@/components/LayoutCustom";

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [orgId, setOrgId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // --- state tambahan untuk evaluasi LDA ---
  const [ldaEval, setLdaEval] = useState(null);
  const [ldaLoading, setLdaLoading] = useState(false);
  const [ldaError, setLdaError] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const org =
      localStorage.getItem("organization_name") ||
      localStorage.getItem("org_id") ||
      "";
    const proj =
      localStorage.getItem("project_name") ||
      localStorage.getItem("project_id") ||
      "";

    setOrgId(org);
    setProjectId(proj);
  }, []);

  useEffect(() => {
    if (!orgId || !projectId) return;

    const controller = new AbortController();

    async function fetchMembers() {
      setMembersLoading(true);
      setMembersError("");

      try {
        const res = await fetch(
          `/api/project-members/${encodeURIComponent(
            orgId
          )}/${encodeURIComponent(projectId)}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data?.detail || data?.error || "Failed to fetch project members"
          );
        }
        const membersFromApi = Array.isArray(data.members) ? data.members : [];

        const normalized = membersFromApi.map((m) => ({
          email: m.email || "",
          role: m.primary_role || "member",
          display_name: m.display_name || "",
          raw: m,
        }));

        setMembers(normalized);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Fetch members error:", err);
        setMembersError(err.message || "Failed to fetch project members");
        setMembers([]); // kosongin aja kalau error
      } finally {
        setMembersLoading(false);
      }
    }

    fetchMembers();

    return () => controller.abort();
  }, [orgId, projectId]);

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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to add member");
      }

      // Tambahkan ke list members di FE
      setMembers((prev) => [
        ...prev,
        {
          email: data.email || email,
          role: data.role || role || "member",
        },
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

  // --- handler evaluasi LDA ---
  const handleEvaluateLda = async () => {
    setLdaError("");
    setLdaEval(null);

    if (!orgId || !projectId) {
      setLdaError("Organization & project are not set.");
      return;
    }

    try {
      setLdaLoading(true);

      const res = await fetch(
        `/api/ml/lda/${encodeURIComponent(orgId)}/${encodeURIComponent(
          projectId
        )}/evaluate?organization=${encodeURIComponent(
          orgId
        )}&project=${encodeURIComponent(projectId)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to evaluate LDA");
      }

      setLdaEval(data);
      // otomatis pilih topik pertama
      const topicKeys = Object.keys(data.top_keywords || {});
      if (topicKeys.length > 0) {
        setSelectedTopic(topicKeys[0]);
      } else {
        setSelectedTopic(null);
      }
    } catch (err) {
      console.error("LDA evaluate error:", err);
      setLdaError(err.message || "Failed to evaluate LDA model");
    } finally {
      setLdaLoading(false);
    }
  };

  const topicKeys = ldaEval ? Object.keys(ldaEval.top_keywords || {}) : [];
  const keywordsForSelectedTopic =
    ldaEval && selectedTopic ? ldaEval.top_keywords?.[selectedTopic] || [] : [];

  const coherence = ldaEval?.metrics?.coherence_score;
  const coherenceType = ldaEval?.metrics?.coherence_type;
  const logPerplexity = ldaEval?.metrics?.log_perplexity;
  const numTopics = ldaEval?.num_topics;
  const numDocs = ldaEval?.num_documents;

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

            {membersLoading && (
              <p className="text-sm text-gray-500 mb-2">Loading members…</p>
            )}

            {membersError && (
              <p className="text-xs text-red-600 mb-2 bg-red-50 border border-red-100 rounded-md px-2 py-1.5">
                {membersError}
              </p>
            )}

            {!membersLoading && !membersError && members.length === 0 && (
              <p className="text-sm text-gray-500">
                Belum ada anggota. Tambahkan email di panel sebelah.
              </p>
            )}

            {members.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {members.map((m, idx) => (
                  <li
                    key={`${m.email || "member"}-${idx}`}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0D5DB8] to-[#4F8DFF] text-white flex items-center justify-center text-sm font-semibold">
                        {m.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {m.email || "Unknown user"}
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

        {/* --- SECTION BARU: Topic Model Evaluation (LDA) --- */}
        <div className="mt-8 bg-white rounded-xl border border-[#e4e4e4] shadow-sm p-4 md:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[#0D5DB8] text-base">
                  📊
                </span>
                Topic Model Evaluation (LDA)
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                See how well the topic model summarizes your project bugs:
                coherence, perplexity, and top keywords per topic.
              </p>
            </div>
            <button
              type="button"
              onClick={handleEvaluateLda}
              disabled={ldaLoading || !orgId || !projectId}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs md:text-sm font-medium text-white bg-[#0D5DB8] hover:bg-[#0b51aa] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {ldaLoading && (
                <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              )}
              <span>{ldaLoading ? "Evaluating…" : "Evaluate topic model"}</span>
            </button>
          </div>

          {!orgId || !projectId ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
              Select an active project first to run LDA evaluation.
            </p>
          ) : null}

          {ldaError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {ldaError}
            </p>
          )}

          {ldaEval && (
            <div className="space-y-4">
              {/* Top-level metrics */}
              <div className="grid gap-3 md:grid-cols-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-wide text-[#0D5DB8]">
                    Coherence ({coherenceType || "c_v"})
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[#0D5DB8]">
                    {typeof coherence === "number" ? coherence.toFixed(3) : "-"}
                  </div>
                  <p className="mt-1 text-[11px] text-[#0D5DB8]">
                    {ldaEval.explanations?.coherence_score}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-600">
                    Log-perplexity
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {typeof logPerplexity === "number"
                      ? logPerplexity.toFixed(3)
                      : "-"}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {ldaEval.explanations?.log_perplexity}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-600">
                    Number of topics
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {numTopics ?? "-"}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {ldaEval.explanations?.num_topics}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-600">
                    Documents (bugs)
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {numDocs ?? "-"}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    Topic matrix shape:{" "}
                    <span className="font-mono">
                      ({numDocs ?? "?"} × {numTopics ?? "?"})
                    </span>
                  </p>
                </div>
              </div>

              {/* Topics & keywords */}
              {topicKeys.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-gray-700">
                        Topics
                      </h3>
                      <span className="text-[10px] text-gray-500">
                        {topicKeys.length} topics
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-auto pr-1">
                      {topicKeys.map((tKey) => (
                        <button
                          key={tKey}
                          type="button"
                          onClick={() => setSelectedTopic(tKey)}
                          className={`text-[11px] px-2 py-1 rounded-full border ${
                            selectedTopic === tKey
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {tKey.replace("topic_", "Topic ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-700">
                      Top keywords for{" "}
                      {selectedTopic
                        ? selectedTopic.replace("topic_", "Topic ")
                        : "–"}
                    </h3>
                    {keywordsForSelectedTopic.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        Select a topic to see its keywords.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {keywordsForSelectedTopic.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[11px] text-gray-700"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {ldaEval.explanations?.top_keywords && (
                      <p className="mt-1 text-[11px] text-gray-500">
                        {ldaEval.explanations.top_keywords}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Artefak path (optional, buat power user) */}
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  Show artifact paths (bugs_clean.csv, lda_model.gensim, ...)
                </summary>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {Object.entries(ldaEval.artifacts || {}).map(([key, val]) => (
                    <div
                      key={key}
                      className="bg-gray-50 border border-gray-100 rounded-md p-2"
                    >
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        {key}
                      </div>
                      <div className="mt-1 text-[11px] font-mono text-gray-700 break-all">
                        {val || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </LayoutCustom>
  );
}
