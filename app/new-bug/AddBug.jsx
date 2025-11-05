"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LayoutCustom from "@/components/LayoutCustom";

export default function NewBugPage() {
  const router = useRouter();

  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("NEW");
  const [resolution, setResolution] = useState("");
  const [product, setProduct] = useState("Thunderbird");
  const [component, setComponent] = useState("General");
  const [creator, setCreator] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [url, setUrl] = useState("");

  const [keywords, setKeywords] = useState("");
  const [dependsOn, setDependsOn] = useState("");
  const [dupeOf, setDupeOf] = useState("");
  const [commitMessages, setCommitMessages] = useState("");
  const [commitRefs, setCommitRefs] = useState("");
  const [filesChanged, setFilesChanged] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const payload = {
      summary,
      status,
      resolution: resolution || null,
      product,
      component,
      creator,
      assigned_to: assignedTo,
      url,
      keywords: keywords
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),

      depends_on: dependsOn
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => Number(s))
        .filter((n) => !Number.isNaN(n)),

      dupe_of: dupeOf ? Number(dupeOf) : null,

      commit_messages: commitMessages
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),

      commit_refs: commitRefs
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean),

      files_changed: filesChanged
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || `HTTP ${res.status}`);
      }

      router.push("/home");
      router.refresh();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Gagal menyimpan bug");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutCustom>
      <section className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <div className="max-w-3xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-semibold mb-4">Add New Bug</h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Summary
              </label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                placeholder='e.g. Password prompt shows "rememberPassword"...'
              />
            </div>

            {/* Status & Resolution */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>NEW</option>
                  <option>ASSIGNED</option>
                  <option>RESOLVED</option>
                  <option>VERIFIED</option>
                  <option>REOPENED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Resolution
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="FIXED, WONTFIX, DUPLICATE, dll (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Thunderbird"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Component
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  placeholder="General"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Creator
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  placeholder="kevin@kevinlocke.name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assigned To
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="mkmelin+mozilla@iki.fi"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL (optional)
              </label>
              <input
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Keywords (comma-separated)
              </label>
              <input
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="perf, regression, crash"
              />
              <p className="mt-1 text-xs text-gray-500">
                Contoh: <code>perf, regression, crash</code>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Depends On (bug ids, comma-separated)
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={dependsOn}
                  onChange={(e) => setDependsOn(e.target.value)}
                  placeholder="1872001, 1872002"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duplicate Of (bug id)
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={dupeOf}
                  onChange={(e) => setDupeOf(e.target.value)}
                  placeholder="1872550"
                />
              </div>
            </div>

            {/* Commit Messages */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Commit Messages (satu per baris)
              </label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={commitMessages}
                onChange={(e) => setCommitMessages(e.target.value)}
                placeholder={`Password prompt shows "...". r=#thunderbird-reviewers\nPassword prompt shows "...". r=leftmostcat`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Commit Refs (satu per baris / dipisah spasi)
              </label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                rows={2}
                value={commitRefs}
                onChange={(e) => setCommitRefs(e.target.value)}
                placeholder="https://hg.mozilla.org/comm-central/rev/d5ccf2809341"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Files Changed (satu per baris)
              </label>
              <textarea
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={filesChanged}
                onChange={(e) => setFilesChanged(e.target.value)}
                placeholder={`//hg.m\npath/to/file2.cpp`}
              />
            </div>

            {err && (
              <div className="text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded">
                {err}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm border rounded"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded bg-[#0D5DB8] text-white disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Bug"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </LayoutCustom>
  );
}
