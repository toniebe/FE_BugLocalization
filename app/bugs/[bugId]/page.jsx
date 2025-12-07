"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import LayoutCustom from "@/components/LayoutCustom";

export default function BugDetailClient({ params }) {
  const { bugId } = use(params);
  const router = useRouter();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const org =
          (typeof window !== "undefined" &&
            localStorage.getItem("organization_name")) ||
          "";
        const proj =
          (typeof window !== "undefined" &&
            localStorage.getItem("project_name")) ||
          "";

        const qs = new URLSearchParams({
          organization_name: org,
          project_name: proj,
        });

        const res = await fetch(`/api/bugs/${bugId}?${qs.toString()}`, {
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

  const bug = data?.bug;
  const dev = data?.developers?.[0];

  const handleBack = () => {
    router.back();
  };

  return (
    <LayoutCustom>
      <section className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-lg border border-gray-200">
        {/* Header + Back button */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <h1 className="text-xl font-semibold">Bug Detail #{bugId}</h1>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading…</p>}

        {err && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded">
            {err}
          </p>
        )}

        {bug && (
          <div className="space-y-4">
            {/* Judul & deskripsi */}
            <div>
              <h2 className="text-lg font-medium mb-1">{bug.summary}</h2>
              <p className="text-sm text-gray-700">
                {bug.clean_text || "No description"}
              </p>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-700">Status</div>
                <div className="mt-1 inline-flex flex-wrap items-center gap-2">
                  <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-xs text-slate-700">
                    {bug.status || "-"}
                  </span>
                  {bug.resolution && (
                    <span className="inline-flex px-2 py-1 rounded bg-emerald-50 text-xs text-emerald-700">
                      {bug.resolution}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-700">Assigned To</div>
                <div className="mt-1 text-gray-700">
                  {bug.assigned_to || dev?.dev_id || "-"}
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-700">
                  Product / Component
                </div>
                <div className="mt-1 text-gray-700">
                  {bug.product || "-"}
                  {bug.component && (
                    <span className="text-gray-500"> · {bug.component}</span>
                  )}
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-700">Topic</div>
                <div className="mt-1 text-gray-700">
                  {bug.topic_label || "-"}
                  {bug.topic_score && (
                    <span className="text-xs text-gray-400 ml-1">
                      ({Number(bug.topic_score).toFixed(3)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Commit Refs */}
            {bug.commit_refs && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Commit Refs
                </h3>
                <ul className="space-y-1 text-xs">
                  {bug.commit_refs.split(";").map((href, i) =>
                    href ? (
                      <li key={i}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {href}
                        </a>
                      </li>
                    ) : null
                  )}
                </ul>
              </div>
            )}

            {/* Commit Messages */}
            {bug.commit_messages && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Commit Messages
                </h3>
                <ul className="space-y-1 text-sm">
                  {bug.commit_messages
                    .split(";")
                    .filter(Boolean)
                    .map((msg, i) => (
                      <li
                        key={i}
                        className="border border-gray-200 rounded px-2 py-1"
                      >
                        {msg}
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
