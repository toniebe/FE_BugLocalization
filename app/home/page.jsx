"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutCustom from "@/components/LayoutCustom";

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
      <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[260px]">
        <p className="text-sm text-gray-500">
          Organization / project belum diset. Selesaikan onboarding dulu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[420px] overflow-auto">
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
      <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[260px]">
        <p className="text-sm text-gray-500">
          Organization / project belum diset. Selesaikan onboarding dulu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[420px] overflow-auto">
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
      <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[260px]">
        <p className="text-sm text-gray-500">
          Organization / project belum diset. Selesaikan onboarding dulu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[420px] overflow-auto">
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
 * HOME PAGE: hanya summary + 3 list (bugs, developers, topics)
 */
export default function HomePage() {
  const [orgName, setOrgName] = useState("");
  const [projectName, setProjectName] = useState("");

  // Hardcoded totals
  const TOTAL_BUGS = 1234;
  const TOTAL_DEVELOPERS = 56;
  const TOTAL_TOPICS = 78;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const org = localStorage.getItem("organization_name") || "";
    const proj = localStorage.getItem("project_name") || "";
    setOrgName(org);
    setProjectName(proj);
  }, []);

  return (
    <LayoutCustom>
      <div className="mx-auto px-4 py-4">
        {/* Header + info project */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>

            {orgName && projectName && (
              <p className="text-xs text-gray-500 mt-1">
                Project: <span className="font-semibold">{orgName}</span> /{" "}
                <span className="font-semibold">{projectName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e4e4e4] rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Bugs</p>
            <p className="text-2xl font-semibold text-[#0D5DB8] mt-1">
              {TOTAL_BUGS}
            </p>
          </div>
          <div className="bg-white border border-[#e4e4e4] rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Developers</p>
            <p className="text-2xl font-semibold text-emerald-600 mt-1">
              {TOTAL_DEVELOPERS}
            </p>
          </div>
          <div className="bg-white border border-[#e4e4e4] rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Topics</p>
            <p className="text-2xl font-semibold text-amber-600 mt-1">
              {TOTAL_TOPICS}
            </p>
          </div>
        </div>

        {/* 3 kolom list */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
          <BugListSection orgName={orgName} projectName={projectName} />
          <DeveloperListSection orgName={orgName} projectName={projectName} />
          <TopicListSection orgName={orgName} projectName={projectName} />
        </div>
      </div>
    </LayoutCustom>
  );
}
