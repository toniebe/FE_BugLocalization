"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import EasyfixBugGraph from "@/components/EasyFixBugGraph";
import { useRouter } from "next/navigation";
import { logout } from "../_lib/auth-client";
import LayoutCustom from "@/components/LayoutCustom";
import { searchBugs } from "../_lib/search-client"; // ⬅️ pakai helper baru
import { bug_sample_data } from "./data";

const SAMPLE = bug_sample_data

function useDebounce(value, delay = 500) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function SearchClient() {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(25);
  const [devLimit, setDevLimit] = useState(10);
  const [mode, setMode] = useState("graph");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [orgName, setOrgName] = useState("");
  const [projectName, setProjectName] = useState("");

  const router = useRouter();
  const debouncedQ = useDebounce(q, 500);
  const abortRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const org = localStorage.getItem("organization_name") || "";
    const proj = localStorage.getItem("project_name") || "";
    setOrgName(org);
    setProjectName(proj);
  }, []);

  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) return;
    if (!orgName || !projectName) {
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setErr("");

    searchBugs({
      q: debouncedQ,
      limit,
      dev_limit: devLimit,
      organization: orgName,
      project: projectName,
      signal: ctrl.signal,
    })
      .then((res) => {
        setData(res);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Search failed");
      })
      .finally(() => {
        if (abortRef.current === ctrl) abortRef.current = null;
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [debouncedQ, limit, devLimit, orgName, projectName]);

  async function doSearch() {
    if (!q || q.length < 2) {
      setErr(q ? "Query minimal 2 karakter" : "Masukkan query");
      return;
    }
    if (!orgName || !projectName) {
      setErr("Organization and project are not set. Please finish onboarding.");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setErr("");

    try {
      const res = await searchBugs({
        q,
        limit,
        dev_limit: devLimit,
        organization: orgName,
        project: projectName,
        signal: ctrl.signal,
      });
      setData(res);
    } catch (e) {
      if (e?.name !== "AbortError") {
        setErr(e?.message || "Search failed");
      }
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!loading) doSearch();
    }
  }

  const graphData = useMemo(() => {
    if (!data) return null;

    // Normalisasi bugs -> pakai field yang cocok untuk graph/list
    const bugs = (data.bugs || []).map((b) => ({
      id: b.bug_id, // sebelumnya mungkin pakai b.id
      bug_id: b.bug_id,
      summary: b.title, // mapping ke summary
      title: b.title,
      description: b.description,
      status: b.status,
      created_at: b.created_at,
      // pakai 'score' sebagai topic_score / similarity score
      topic_score:
        typeof b.score === "number" ? b.score : Number(b.score) || null,
    }));

    // Normalisasi developers
    const developers = (data.developers || []).map((d) => ({
      id: d.developer_id,
      developer_id: d.developer_id,
      developer: d.email || d.name, // biar kompatibel dengan kode lama
      name: d.name,
      email: d.email,
      bug_ids: d.bug_ids || [],
      total_fixed_bugs: d.total_fixed_bugs,
    }));

    // Normalisasi commits (kalau graph kamu sudah support commit node)
    const commits = (data.commits || []).map((c) => ({
      id: c.commit_id,
      commit_id: c.commit_id,
      hash: c.hash,
      message: c.message,
      repository: c.repository,
      committed_at: c.committed_at,
      bug_ids: c.bug_ids || [],
    }));

    // edges sudah siap dipakai
    const edges = Array.isArray(data.edges) ? data.edges : [];

    return {
      query: data.query,
      limit: data.limit,
      bugs,
      developers,
      commits,
      edges,
    };
  }, [data]);

  const BugsList = useMemo(() => {
    return (
      <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[calc(100vh-7rem)] overflow-auto">
        {!data?.bugs?.length ? (
          <div className="text-sm text-gray-500">Tidak ada hasil.</div>
        ) : (
          <ul className="space-y-3">
            {data.bugs.map((b,index) => (
              <li
                key={`${b.id}-${index}`}
                onClick={() => router.push(`/bugs/${b.bug_id}`)}
                className="border rounded-lg p-3 cursor-pointer hover:border-[#0D5DB8] hover:bg-blue-50/40 transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">
                  {b.summary || b.title}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <span className="mr-2">ID: {b.id}</span>
                  <span className="mr-2">Status: {b.status}</span>
                  {b.topic_label && (
                    <span className="mr-2">Topic: {b.topic_label}</span>
                  )}
                  {typeof b.topic_score === "number" && (
                    <span>Score: {b.topic_score.toFixed(3)}</span>
                  )}
                </div>
                {b.assigned_to && (
                  <div className="text-xs text-gray-600 mt-1">
                    Assignee:{" "}
                    {typeof b.assigned_to === "string"
                      ? b.assigned_to
                      : b.assigned_to.email || b.assigned_to.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }, [data, router]);

  const GraphPane = useMemo(() => {
    return (
      <div
        className="relative bg-white border border-[#e4e4e4] rounded-lg"
        style={{ height: "calc(100vh - 7rem)", minHeight: 420 }}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center text-sm text-gray-700">
            Loading…
          </div>
        )}

        <div className="w-full h-full ">
          <EasyfixBugGraph
            data={
              graphData || {
                bugs: [],
                developers: [],
                commits: [],
                edges: [],
              }
            }
          />
        </div>
      </div>
    );
  }, [data, loading, mode]);

  return (
    <LayoutCustom>
      <div className="mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-3 bg-white border border-[#e4e4e4] rounded-lg p-4">
          <h3 className="font-semibold mb-2">Search bug</h3>

          {orgName && projectName && (
            <p className="text-[11px] text-gray-500 mb-2">
              Project: <span className="font-semibold">{orgName}</span> /{" "}
              <span className="font-semibold">{projectName}</span>
            </p>
          )}

          <label className="text-sm text-gray-500">Input your query</label>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setErr("");
            }}
            onKeyDown={onKeyDown}
            className="mt-2 w-full border rounded px-3 py-2 outline-none focus:ring focus:ring-blue-200"
            placeholder="e.g. app crash when open"
          />

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="text-xs text-gray-500">limit</label>
              <input
                type="number"
                min={1}
                max={200}
                value={limit}
                onChange={(e) =>
                  setLimit(
                    Math.max(1, Math.min(200, Number(e.target.value || 1)))
                  )
                }
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">dev_limit</label>
              <input
                type="number"
                min={1}
                max={100}
                value={devLimit}
                onChange={(e) =>
                  setDevLimit(
                    Math.max(1, Math.min(100, Number(e.target.value || 1)))
                  )
                }
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              className="text-sm text-[#0D5DB8] font-semibold hover:underline"
              onClick={() => {
                setQ("");
                setErr("");
              }}
              type="button"
              disabled={loading}
            >
              Clear
            </button>
            <button
              className="ml-auto w-1/2 bg-[#0D5DB8] text-white text-sm px-4 py-2 rounded disabled:opacity-60"
              onClick={doSearch}
              disabled={loading || !q || q.length < 2}
              type="button"
              title={!q || q.length < 2 ? "Minimal 2 karakter" : "Cari"}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {err && (
            <div className="mt-3 text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded">
              {err}
            </div>
          )}

          <div className="mt-6 text-sm flex items-center gap-3">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `search_${(data?.query || q || "result").replace(
                  /\s+/g,
                  "_"
                )}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="ml-auto px-3 py-1 rounded border bg-white text-gray-700 border-[#e4e4e4]"
              type="button"
              title="Download JSON"
              disabled={loading}
            >
              ⬇ JSON
            </button>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9">
          <div className="grid grid-cols-8 bg-white py-3 px-4 text-sm border border-[#e4e4e4] rounded-lg mb-3">
            <button
              onClick={() => setMode("graph")}
              className={` px-3 py-1 rounded border ${
                mode === "graph"
                  ? "bg-[#0D5DB8] text-white border-[#0D5DB8]"
                  : "bg-white text-gray-700 border-[#e4e4e4]"
              }`}
              type="button"
            >
              Graph
            </button>
            <button
              onClick={() => setMode("list")}
              className={`px-3 py-1 rounded border ${
                mode === "list"
                  ? "bg-[#0D5DB8] text-white border-[#0D5DB8]"
                  : "bg-white text-gray-700 border-[#e4e4e4]"
              }`}
              type="button"
            >
              List
            </button>

            {loading && <span className="ml-3 text-gray-500">Loading…</span>}
            {!loading && data?.bugs?.length === 0 && (
              <span className="ml-3 my-auto text-gray-500">No results</span>
            )}
          </div>

          {mode === "graph" ? GraphPane : BugsList}
        </section>
      </div>
    </LayoutCustom>
  );
}
