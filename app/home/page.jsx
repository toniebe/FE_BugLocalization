"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import EasyfixBugGraph from "@/components/EasyFixBugGraph";
import { useRouter } from "next/navigation";
import LayoutCustom from "@/components/LayoutCustom";
import { searchBugs } from "../_lib/search-client";
import { bug_sample_data } from "./data";

const SAMPLE = bug_sample_data;

function useDebounce(value, delay = 500) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * SECTION: LIST DEVELOPERS (infinite scroll)
 */
function DeveloperListSection({ orgName, projectName }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const loaderRef = useRef(null);
  const LIMIT = 20;

  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setErr("");
  }, [orgName, projectName]);

  useEffect(() => {
    if (!orgName || !projectName) return;

    async function fetchPage() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({
          organization_name: orgName,
          project_name: projectName,
          limit: String(LIMIT),
          offset: String(page * LIMIT),
        });

        const res = await fetch(`/api/developers?${params.toString()}`);
        if (!res.ok) {
          let j = {};
          try {
            j = await res.json();
          } catch (e) {}
          throw new Error(j.detail || "Failed to fetch developers");
        }
        const json = await res.json();
        const newItems = Array.isArray(json.items) ? json.items : [];

        setItems((prev) => (page === 0 ? newItems : [...prev, ...newItems]));
        if (newItems.length < LIMIT) {
          setHasMore(false);
        }
      } catch (e) {
        setErr(e?.message || "Failed to fetch developers");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [page, orgName, projectName]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [hasMore, loading]);

  if (!orgName || !projectName) {
    return (
      <div className="bg-white border border-[#e4e4e4] rounded-lg p-4">
        <p className="text-sm text-gray-500">
          Organization / project belum diset. Selesaikan onboarding dulu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[calc(100vh-7rem)] overflow-auto">
      <h3 className="font-semibold mb-3 text-sm">All Developers</h3>

      {items.length === 0 && !loading && !err && (
        <div className="text-sm text-gray-500">Belum ada data developer.</div>
      )}

      {err && (
        <div className="text-sm text-red-600 mb-2 border border-red-200 bg-red-50 p-2 rounded">
          {err}
        </div>
      )}

      <ul className="space-y-2">
        {items.map((d, idx) => (
          <li
            key={`${d.email || "dev"}-${idx}`}
            className="border rounded px-3 py-2 text-xs text-gray-800 bg-gray-50"
          >
            {d.email || "-"}
          </li>
        ))}
      </ul>

      <div ref={loaderRef} className="h-10 flex items-center justify-center">
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
        {!hasMore && items.length > 0 && (
          <span className="text-[11px] text-gray-400">No more developers.</span>
        )}
      </div>
    </div>
  );
}

/**
 * SECTION: LIST BUGS (infinite scroll all bugs)
 */
function BugListSection({ orgName, projectName }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const loaderRef = useRef(null);
  const LIMIT = 20;

  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setErr("");
  }, [orgName, projectName]);

  useEffect(() => {
    if (!orgName || !projectName) return;

    async function fetchPage() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({
          organization_name: orgName,
          project_name: projectName,
          limit: String(LIMIT),
          offset: String(page * LIMIT),
        });

        const res = await fetch(`/api/bugs-list?${params.toString()}`);
        if (!res.ok) {
          let j = {};
          try {
            j = await res.json();
          } catch (e) {}
          throw new Error(j.detail || "Failed to fetch bugs");
        }
        const json = await res.json();
        const newItems = Array.isArray(json.items) ? json.items : [];

        setItems((prev) => (page === 0 ? newItems : [...prev, ...newItems]));
        if (newItems.length < LIMIT) {
          setHasMore(false);
        }
      } catch (e) {
        setErr(e?.message || "Failed to fetch bugs");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [page, orgName, projectName]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [hasMore, loading]);

  if (!orgName || !projectName) {
    return (
      <div className="bg-white border border-[#e4e4e4] rounded-lg p-4">
        <p className="text-sm text-gray-500">
          Organization / project belum diset. Selesaikan onboarding dulu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[calc(100vh-7rem)] overflow-auto">
      <h3 className="font-semibold mb-3 text-sm">All Bugs</h3>

      {items.length === 0 && !loading && !err && (
        <div className="text-sm text-gray-500">Belum ada data bug.</div>
      )}

      {err && (
        <div className="text-sm text-red-600 mb-2 border border-red-200 bg-red-50 p-2 rounded">
          {err}
        </div>
      )}

      <ul className="space-y-3">
        {items.map((b, idx) => (
          <li
            key={`${b.bug_id}-${idx}`}
            className="border rounded-lg p-3 cursor-pointer hover:border-[#0D5DB8] hover:bg-blue-50/40 transition-colors"
            onClick={() => router.push(`/bugs/${b.bug_id}`)}
          >
            <div className="font-medium text-sm text-gray-900">{b.summary}</div>
            <div className="text-xs text-gray-600 mt-1 space-x-2">
              <span>ID: {b.bug_id}</span>
              <span>Status: {b.status}</span>
              {b.asignee && <span>Assignee: {b.asignee}</span>}
            </div>
            {b.description && (
              <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                {b.description}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div ref={loaderRef} className="h-10 flex items-center justify-center">
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
        {!hasMore && items.length > 0 && (
          <span className="text-[11px] text-gray-400">No more bugs.</span>
        )}
      </div>
    </div>
  );
}

/**
 * SECTION: LIST TOPICS (infinite scroll)
 */
function TopicListSection({ orgName, projectName }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const loaderRef = useRef(null);
  const LIMIT = 20;

  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setErr("");
  }, [orgName, projectName]);

  useEffect(() => {
    if (!orgName || !projectName) return;

    async function fetchPage() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({
          organization_name: orgName,
          project_name: projectName,
          limit: String(LIMIT),
          offset: String(page * LIMIT),
        });

        const res = await fetch(`/api/topics?${params.toString()}`);
        if (!res.ok) {
          let j = {};
          try {
            j = await res.json();
          } catch (e) {}
          throw new Error(j.detail || "Failed to fetch topics");
        }
        const json = await res.json();
        const newItems = Array.isArray(json.items) ? json.items : [];

        setItems((prev) => (page === 0 ? newItems : [...prev, ...newItems]));
        if (newItems.length < LIMIT) {
          setHasMore(false);
        }
      } catch (e) {
        setErr(e?.message || "Failed to fetch topics");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [page, orgName, projectName]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [hasMore, loading]);

  if (!orgName || !projectName) {
    return (
      <div className="bg-white border border-[#e4e4e4] rounded-lg p-4">
        <p className="text-sm text-gray-500">
          Organization / project belum diset. Selesaikan onboarding dulu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[calc(100vh-7rem)] overflow-auto">
      <h3 className="font-semibold mb-3 text-sm">All Topics</h3>

      {items.length === 0 && !loading && !err && (
        <div className="text-sm text-gray-500">Belum ada data topic.</div>
      )}

      {err && (
        <div className="text-sm text-red-600 mb-2 border border-red-200 bg-red-50 p-2 rounded">
          {err}
        </div>
      )}

      <ul className="space-y-3">
        {items.map((t, idx) => (
          <li
            key={`${t.topic_id}-${idx}`}
            className="border rounded-lg p-3 bg-gray-50"
          >
            <div className="flex items-center justify-between text-xs text-gray-700">
              <span className="font-semibold">Topic #{t.topic_id}</span>
              {t.topic_label && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[10px] text-blue-700">
                  {t.topic_label}
                </span>
              )}
            </div>
            {t.terms && (
              <div className="mt-1 text-[11px] text-gray-600">{t.terms}</div>
            )}
          </li>
        ))}
      </ul>

      <div ref={loaderRef} className="h-10 flex items-center justify-center">
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
        {!hasMore && items.length > 0 && (
          <span className="text-[11px] text-gray-400">No more topics.</span>
        )}
      </div>
    </div>
  );
}

/**
 * MAIN PAGE: Search + graph/list + sections
 */
export default function SearchClient() {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(25);
  const [devLimit, setDevLimit] = useState(10);
  const [mode, setMode] = useState("graph"); // graph vs list
  const [section, setSection] = useState("search"); // search | developers | bugs | topics
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
    if (!orgName || !projectName) return;

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

    const bugs = (data.bugs || []).map((b) => ({
      id: b.bug_id,
      bug_id: b.bug_id,
      summary: b.title,
      title: b.title,
      description: b.description,
      status: b.status,
      created_at: b.created_at,
      topic_score:
        typeof b.score === "number" ? b.score : Number(b.score) || null,
    }));

    const developers = (data.developers || []).map((d) => ({
      id: d.developer_id,
      developer_id: d.developer_id,
      developer: d.email || d.name,
      name: d.name,
      email: d.email,
      bug_ids: d.bug_ids || [],
      total_fixed_bugs: d.total_fixed_bugs,
    }));

    const commits = (data.commits || []).map((c) => ({
      id: c.commit_id,
      commit_id: c.commit_id,
      hash: c.hash,
      message: c.message,
      repository: c.repository,
      committed_at: c.committed_at,
      bug_ids: c.bug_ids || [],
    }));

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
            {data.bugs.map((b, index) => (
              <li
                key={`${b.id || b.bug_id}-${index}`}
                onClick={() => router.push(`/bugs/${b.bug_id}`)}
                className="border rounded-lg p-3 cursor-pointer hover:border-[#0D5DB8] hover:bg-blue-50/40 transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">
                  {b.summary || b.title}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <span className="mr-2">ID: {b.id || b.bug_id}</span>
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
  }, [graphData, loading]);

  return (
    <LayoutCustom>
      <div className="mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        {/* SIDEBAR */}
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

        {/* MAIN */}
        <section className="col-span-12 md:col-span-9">
          {/* Section tabs */}
          <div className="bg-white py-3 px-4 text-sm border border-[#e4e4e4] rounded-lg mb-3 flex items-center gap-2">
            <button
              onClick={() => setSection("search")}
              className={`px-3 py-1 rounded border ${
                section === "search"
                  ? "bg-[#0D5DB8] text-white border-[#0D5DB8]"
                  : "bg-white text-gray-700 border-[#e4e4e4]"
              }`}
              type="button"
            >
              Graph / List
            </button>
            <button
              onClick={() => setSection("developers")}
              className={`px-3 py-1 rounded border ${
                section === "developers"
                  ? "bg-[#0D5DB8] text-white border-[#0D5DB8]"
                  : "bg-white text-gray-700 border-[#e4e4e4]"
              }`}
              type="button"
            >
              Developers
            </button>
            <button
              onClick={() => setSection("bugs")}
              className={`px-3 py-1 rounded border ${
                section === "bugs"
                  ? "bg-[#0D5DB8] text-white border-[#0D5DB8]"
                  : "bg-white text-gray-700 border-[#e4e4e4]"
              }`}
              type="button"
            >
              Bugs
            </button>
            <button
              onClick={() => setSection("topics")}
              className={`px-3 py-1 rounded border ${
                section === "topics"
                  ? "bg-[#0D5DB8] text-white border-[#0D5DB8]"
                  : "bg-white text-gray-700 border-[#e4e4e4]"
              }`}
              type="button"
            >
              Topics
            </button>

            {section === "search" && (
              <>
                {loading && (
                  <span className="ml-3 text-gray-500">Loading…</span>
                )}
                {!loading && data?.bugs?.length === 0 && (
                  <span className="ml-3 my-auto text-gray-500">No results</span>
                )}
              </>
            )}
          </div>

          {/* Body per section */}
          {section === "search" && (
            <>
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

                {loading && (
                  <span className="ml-3 text-gray-500">Loading…</span>
                )}
                {!loading && data?.bugs?.length === 0 && (
                  <span className="ml-3 my-auto text-gray-500">No results</span>
                )}
              </div>

              {mode === "graph" ? GraphPane : BugsList}
            </>
          )}

          {section === "developers" && (
            <DeveloperListSection orgName={orgName} projectName={projectName} />
          )}

          {section === "bugs" && (
            <BugListSection orgName={orgName} projectName={projectName} />
          )}

          {section === "topics" && (
            <TopicListSection orgName={orgName} projectName={projectName} />
          )}
        </section>
      </div>
    </LayoutCustom>
  );
}
