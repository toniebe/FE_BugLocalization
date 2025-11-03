"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import EasyfixBugGraph from "@/components/EasyFixBugGraph";

async function searchBugs({ q, limit = 25, dev_limit = 10, signal } = {}) {
  const qs = new URLSearchParams({
    q,
    limit: String(limit),
    dev_limit: String(dev_limit),
  }).toString();

  const res = await fetch(`/api/search?${qs}`, {
    method: "GET",
    cache: "no-store",
    signal,
    headers: { accept: "application/json" },
  });

  let data = null;
  let text = null;
  try {
    data = await res.clone().json();
  } catch {}
  if (!data) {
    try {
      text = await res.text();
    } catch {}
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.error)) || text || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.upstream = data || text;
    throw err;
  }
  return data ?? (text ? { text } : null);
}

const SAMPLE = {
  query: "app crash when open",
  bugs: [
    {
      id: 1931228,
      summary: "Include app version when storing a crash",
      assigned_to: "mtighe@mozilla.com",
      status: "RESOLVED",
      resolution: "FIXED",
      topic: null,
      topic_label: "UI: Toolbar / PDF / Android",
      topic_score: 0.6009,
    },
    {
      id: 1965490,
      summary: "New messaging ACTION to open app",
      assigned_to: "anpopa@mozilla.com",
      status: "NEW",
      resolution: null,
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.6263,
    },
    {
      id: 1912002,
      summary: "Auto-open PiP on app switch",
      assigned_to: "danieleferla1@gmail.com",
      status: "ASSIGNED",
      resolution: null,
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.85,
    },
    {
      id: 1979967,
      summary: "Accessibility annotation for disabled 'Open in app' button",
      assigned_to: "azinovyev@mozilla.com",
      status: "RESOLVED",
      resolution: "FIXED",
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.6555,
    },
    {
      id: 1899329,
      summary: '[Menu Redesign] Implement "Open in app" menu functionality',
      assigned_to: "smathiyarasan@mozilla.com",
      status: "RESOLVED",
      resolution: "FIXED",
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.8875,
    },
    {
      id: 1929028,
      summary:
        "website loads in background while ask to open in app prompt is open",
      assigned_to: "royang@mozilla.com",
      status: "RESOLVED",
      resolution: "FIXED",
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.7812,
    },
    {
      id: 1930355,
      summary: "Open in app also opens website from a search",
      assigned_to: "tthibaud@mozilla.com",
      status: "RESOLVED",
      resolution: "FIXED",
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.8714,
    },
    {
      id: 1936952,
      summary: "[Headless] nsColorPicker::Open crash under automation",
      assigned_to: "hskupin@gmail.com",
      status: "RESOLVED",
      resolution: "FIXED",
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.275,
    },
    {
      id: 1992083,
      summary: "The open in app prompt buttons text is barely visible",
      assigned_to: "mcarare@mozilla.com",
      status: "VERIFIED",
      resolution: "FIXED",
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.5549,
    },
    {
      id: 1979924,
      summary:
        'Crash when opening "Report Broken Site" screen while app is in Russian (RU) locale',
      assigned_to: "apindiprolu@mozilla.com",
      status: "VERIFIED",
      resolution: "FIXED",
      topic: null,
      topic_label: "Search / Telemetry / History",
      topic_score: 0.677,
    },
  ],
  developers: [
    { developer: "emilio@crisal.io", freq: 1554, score: 7981.103328227997 },
    { developer: "dao+bmo@mozilla.com", freq: 1147, score: 5858.826421260834 },
    {
      developer: "wptsync@mozilla.bugs",
      freq: 1177,
      score: 5710.8364906311035,
    },
    {
      developer: "twisniewski@mozilla.com",
      freq: 914,
      score: 4667.319995880127,
    },
    { developer: "petru@mozilla.com", freq: 770, score: 3938.82492351532 },
    {
      developer: "nchevobbe@mozilla.com",
      freq: 430,
      score: 2216.0865864753723,
    },
    { developer: "nsharpley@mozilla.com", freq: 430, score: 2209.679582118988 },
    { developer: "giorga@mozilla.com", freq: 426, score: 2182.430679798126 },
    { developer: "royang@mozilla.com", freq: 419, score: 2153.2524094581604 },
    {
      developer: "rmalicdem@mozilla.com",
      freq: 351,
      score: 1798.0578722953796,
    },
  ],
};

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
  const [data, setData] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const debouncedQ = useDebounce(q, 500);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) return;

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setErr("");

    searchBugs({
      q: debouncedQ,
      limit,
      dev_limit: devLimit,
      signal: ctrl.signal,
    })
      .then((res) => setData(res))
      .catch((e) => {
        if (e?.name === "AbortError") return; // diabaikan
        setErr(e?.message || "Search failed");
      })
      .finally(() => {
        if (abortRef.current === ctrl) abortRef.current = null;
        setLoading(false);
      });

    // cleanup saat dependency berubah/unmount
    return () => ctrl.abort();
  }, [debouncedQ, limit, devLimit]);

  // tombol Search (manual trigger)
  async function doSearch() {
    if (!q || q.length < 2) {
      setErr(q ? "Query minimal 2 karakter" : "Masukkan query");
      return;
    }
    // batalkan request sebelumnya sebelum fire yang baru
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
        signal: ctrl.signal,
      });
      setData(res);
    } catch (e) {
      if (e?.name !== "AbortError") setErr(e?.message || "Search failed");
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

  const BugsList = useMemo(() => {
    return (
      <div className="bg-white border border-[#e4e4e4] rounded-lg p-4 h-[calc(100vh-7rem)] overflow-auto">
        {!data?.bugs?.length ? (
          <div className="text-sm text-gray-500">Tidak ada hasil.</div>
        ) : (
          <ul className="space-y-3">
            {data.bugs.map((b) => (
              <li key={b.id} className="border rounded p-3">
                <div className="font-medium">{b.summary}</div>
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
                    Assignee: {b.assigned_to}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }, [data]);

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
          <EasyfixBugGraph data={data} />
        </div>
      </div>

    );
  }, [data, loading, mode]);

  return (
    <main className="w-full min-h-screen bg-gray-100">
      <header className="w-full border-b border-[#e4e4e4] bg-white">
        <div className=" px-4 h-14 flex items-center justify-between">
          <img src="/easyfix-logo.png" alt="EasyFix Logo" className="h-8" />
          <div className="w-8 h-8 rounded-full bg-gray-300" />
        </div>
      </header>

      <div className=" mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-3 bg-white border border-[#e4e4e4] rounded-lg p-4">
          <h3 className="font-semibold mb-2">Search bug</h3>

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
          <div className="w-full bg-white py-3 px-4 text-sm border border-[#e4e4e4] rounded-lg mb-3">
            {/* <span className="font-medium text-[#0D5DB8]">View:</span> */}
            {/* <span className="mx-2">
              <button
                onClick={() => setMode("graph")}
                className={`underline-offset-4 ${
                  mode === "graph"
                    ? "text-[#0D5DB8] underline"
                    : "text-gray-600 hover:underline"
                }`}
                type="button"
              >
                Graph
              </button>
            </span>
            <span className="text-gray-400">/</span>
            <span className="mx-2">
              <button
                onClick={() => setMode("list")}
                className={`underline-offset-4 ${
                  mode === "list"
                    ? "text-[#0D5DB8] underline"
                    : "text-gray-600 hover:underline"
                }`}
                type="button"
              >
                List
              </button>
            </span> */}

            <button
              onClick={() => setMode("graph")}
              className={`px-3 py-1 rounded border ${
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
              <span className="ml-3 text-gray-500">No results</span>
            )}
          </div>

          {mode === "graph" ? GraphPane : BugsList}
        </section>
      </div>
    </main>
  );
}
