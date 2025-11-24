"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutCustom from "@/components/LayoutCustom";

export default function DeveloperDetailClient({ params }) {
  const { devKey } = params;
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

        const res = await fetch(`/api/developers/${devKey}?${qs.toString()}`, {
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
        if (!cancelled) setErr(e?.message || "Failed to load developer detail");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [devKey]);

  const developer = data?.developer;
  const bugs = data?.bugs || [];

  const handleBack = () => {
    router.back();
  };

  return (
    <LayoutCustom>
      <section className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-lg border border-gray-200">
        {/* Header + Back button */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back</span>
          </button>

          <h1 className="text-xl font-semibold truncate">
            Developer Detail: {devKey}
          </h1>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading…</p>}

        {err && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded">
            {err}
          </p>
        )}

        {developer && (
          <div className="space-y-6">
            {/* Info developer */}
            <div className="border border-gray-200 rounded-lg p-4 bg-slate-50">
              <h2 className="text-lg font-medium mb-2">Developer Info</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-semibold text-gray-700">
                    Dev ID / Email
                  </dt>
                  <dd className="mt-1 text-gray-800 break-all">
                    {developer.dev_id || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-700">Source</dt>
                  <dd className="mt-1 text-gray-800">
                    {developer.source || "-"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Bugs yang terkait dengan developer */}
            <div>
              <h2 className="text-lg font-medium mb-2">
                Bugs assigned / related ({bugs.length})
              </h2>

              {bugs.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada bug yang terkait developer ini.
                </p>
              ) : (
                <ul className="space-y-3">
                  {bugs.map((b) => (
                    <li
                      key={b.bug_id || b.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-[#0D5DB8] hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => router.push(`/bugs/${b.bug_id || b.id}`)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-gray-900">
                          #{b.bug_id || b.id} · {b.summary}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {b.status}
                          </span>
                          {b.resolution && (
                            <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                              {b.resolution}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 text-xs text-gray-600">
                        <span className="mr-2">
                          Product: {b.product || "-"}
                        </span>
                        {b.component && (
                          <span className="mr-2">
                            · Component: {b.component}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-gray-600">
                        {b.topic_label && (
                          <>
                            Topic: {b.topic_label}
                            {b.topic_score && (
                              <span className="text-gray-400 ml-1">
                                ({Number(b.topic_score).toFixed(3)})
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {b.creation_time && (
                        <div className="mt-1 text-[11px] text-gray-500">
                          Created: {b.creation_time}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </LayoutCustom>
  );
}
