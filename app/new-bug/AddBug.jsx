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
    const orgName = localStorage.getItem("organization_name");
    const projectName = localStorage.getItem("project_name");

    if (!orgName || !projectName) {
      setErr(
        "Organization & Project are not set. Make sure you’ve completed onboarding / selected a project."
      );
      setLoading(false);
      return;
    }

    const now = new Date();
    const isoNow = now.toISOString().replace(/\.\d{3}Z$/, "Z");

    const payload = {
      id:
        Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 999),
      summary,
      status,
      resolution: resolution || null,
      product,
      component,
      creation_time: isoNow,
      last_change_time: isoNow,
      creator,
      assigned_to: assignedTo,
      keywords: keywords
        ? keywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      url: url || "",
      depends_on: dependsOn
        ? dependsOn
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => Number(s))
            .filter((n) => !Number.isNaN(n))
        : [],
      dupe_of: dupeOf ? Number(dupeOf) : null,
      commit_messages: commitMessages
        ? commitMessages
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      commit_refs: commitRefs
        ? commitRefs
            .split(/\s+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      files_changed: filesChanged
        ? filesChanged
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const url = `/api/bugs/add?organization=${encodeURIComponent(
        orgName
      )}&project=${encodeURIComponent(projectName)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.error ||
            (typeof json?.detail === "string"
              ? json.detail
              : JSON.stringify(json.detail || json))
        );
      }

      router.push("/home");
      router.refresh();
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to save bug");
    } finally {
      setLoading(false);
    }
  }

  const renderForm = () => {
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8"
      >
        {/* SECTION: Bug Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Bug Summary</h2>
          <p className="text-xs text-gray-500">
            Keep it short but clear. Use one sentence that captures the core
            problem.
          </p>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              placeholder='e.g. Password prompt shows "rememberPassword" instead of "Use Password Manager to remember this password."'
            />
            <p className="text-xs text-gray-500">
              Example: <code>Password prompt shows "rememberPassword"…</code>
            </p>
          </div>
        </div>

        {/* SECTION: Status & Product */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Status & Resolution */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Status & Resolution
            </h2>
            <p className="text-xs text-gray-500">
              Define the bug lifecycle status and its resolution (if already
              known).
            </p>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>NEW</option>
                <option>ASSIGNED</option>
                <option>RESOLVED</option>
                <option>VERIFIED</option>
                <option>REOPENED</option>
              </select>
              <p className="text-xs text-gray-500">
                <span className="font-medium">NEW</span> for newly created bugs
                that haven’t been processed yet.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Resolution
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="FIXED, WONTFIX, DUPLICATE, etc. (optional)"
              />
              <p className="text-xs text-gray-500">
                Leave empty if the bug is not resolved yet.
              </p>
            </div>
          </div>

          {/* Product & Component */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Product & Component
            </h2>
            <p className="text-xs text-gray-500">
              Defines the app context and the module where the bug happens.
            </p>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Product
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Thunderbird"
              />
              <p className="text-xs text-gray-500">
                Main application / product name, e.g. <code>Thunderbird</code>.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Component
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                placeholder="General"
              />
              <p className="text-xs text-gray-500">
                Specific module / part within the product, e.g.{" "}
                <code>General</code>, <code>UI</code>, <code>Storage</code>.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: Reporter & Assignee */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Reporter</h2>
            <p className="text-xs text-gray-500">
              Information about who created the bug report for follow-up
              purposes.
            </p>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Creator (Reporter)
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="kevin@kevinlocke.name"
              />
              <p className="text-xs text-gray-500">
                Email or identifier of the user who reported the bug.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Assignee</h2>
            <p className="text-xs text-gray-500">
              Developer or owner responsible for this bug.
            </p>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Assigned To
              </label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="mkmelin+mozilla@iki.fi"
              />
              <p className="text-xs text-gray-500">
                Can be an email, Git username, or internal developer ID.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: URL & Keywords */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              URL (optional)
            </label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
            <p className="text-xs text-gray-500">
              Related link, e.g. reproduction page, docs, or another issue.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Keywords (comma-separated)
            </label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="perf, regression, crash"
            />
            <p className="mt-1 text-xs text-gray-500">
              Example: <code>perf, regression, crash</code>. Helps search for
              similar bugs in EasyFix-BKG.
            </p>
          </div>
        </div>

        {/* SECTION: Bug Relationships */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Depends On (bug IDs, comma-separated)
            </label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
              value={dependsOn}
              onChange={(e) => setDependsOn(e.target.value)}
              placeholder="1872001, 1872002"
            />
            <p className="text-xs text-gray-500">
              IDs of other bugs that must be resolved first.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Duplicate Of (bug ID)
            </label>
            <input
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
              value={dupeOf}
              onChange={(e) => setDupeOf(e.target.value)}
              placeholder="1872550"
            />
            <p className="text-xs text-gray-500">
              If this bug is a duplicate of another, fill in the original bug
              ID.
            </p>
          </div>
        </div>

        {/* SECTION: Commit & Files */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Commit Messages (one per line)
            </label>
            <textarea
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
              rows={3}
              value={commitMessages}
              onChange={(e) => setCommitMessages(e.target.value)}
              placeholder={`Password prompt shows "..." r=#thunderbird-reviewers\nPassword prompt shows "..." r=leftmostcat`}
            />
            <p className="text-xs text-gray-500">
              One commit message per line to link the bug with code change
              history.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Commit Refs (one per line / space-separated)
            </label>
            <textarea
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
              rows={2}
              value={commitRefs}
              onChange={(e) => setCommitRefs(e.target.value)}
              placeholder="https://hg.mozilla.org/comm-central/rev/d5ccf2809341"
            />
            <p className="text-xs text-gray-500">
              Can be repository URLs, commit hashes, or other related refs.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Files Changed (one per line)
            </label>
            <textarea
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
              rows={3}
              value={filesChanged}
              onChange={(e) => setFilesChanged(e.target.value)}
              placeholder={`path/to/file1.cpp\npath/to/file2.js`}
            />
            <p className="text-xs text-gray-500">
              File paths impacted by this bug, useful to build the bug–file–commit
              graph.
            </p>
          </div>
        </div>

        {err && (
          <div className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 rounded-lg">
            {err}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-60"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-[#0D5DB8] text-white hover:opacity-90 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Bug"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <LayoutCustom>
      <section className="max-w-4xl mx-auto mt-8 px-4 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Bug</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new bug ticket with full product context, bug relationships,
            and commit information so EasyFix-BKG can work at its best.
          </p>
        </div>

        {renderForm()}
      </section>
    </LayoutCustom>
  );
}
