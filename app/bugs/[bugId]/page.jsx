// app/bugs/[bugId]/BugDetailClient.jsx
"use client";

import React, { use, useEffect, useState } from "react";
import LayoutCustom from "@/components/LayoutCustom";

export default function BugDetailClient({ params }) {
  // ✅ Unwrap Promise params
  const { bugId } = use(params); // sama dengan React.use(params)

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch(`/api/bugs/${bugId}`, {
          method: "GET",
          cache: "no-store",
          headers: { accept: "application/json" },
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.detail || d.error || `HTTP ${res.status}`);
        }

        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load bug detail");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [bugId]);

  return (
    <LayoutCustom>
      <section className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-lg border border-gray-200">
        <h1 className="text-xl font-semibold mb-4">
          Bug Detail #{bugId}
        </h1>

        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {err && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded">
            {err}
          </p>
        )}

        {data && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-1">{data.title}</h2>
              <p className="text-sm text-gray-700">
                {data.description || "No description"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-700">Status</div>
                <div className="mt-1 inline-flex px-2 py-1 rounded bg-slate-100 text-xs text-slate-700">
                  {data.status || "-"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Assigned To</div>
                <div className="mt-1 text-gray-700">
                  {data.assigned_to?.email || "-"}
                </div>
              </div>
            </div>

            {data.commits?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Commits
                </h3>
                <ul className="space-y-2 text-sm">
                  {data.commits.map((c) => (
                    <li
                      key={c.id}
                      className="border border-gray-200 rounded p-2"
                    >
                      <div className="font-mono text-xs text-gray-600">
                        {c.sha || c.id}
                      </div>
                      {c.message && (
                        <div className="mt-1 text-gray-800">{c.message}</div>
                      )}
                      {c.author?.email && (
                        <div className="mt-1 text-xs text-gray-600">
                          Author: {c.author.email}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </LayoutCustom>
  );
}
