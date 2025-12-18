// app/developer-recommendation/page.jsx
"use client";

import LayoutCustom from "@/components/LayoutCustom";
import { useEffect, useState } from "react";

export default function DeveloperRecommendationPage() {
  const [organization, setOrganization] = useState("");
  const [project, setProject] = useState("");

  // search mode: by Bug ID or Summary
  const [mode, setMode] = useState("id"); // "id" | "summary"

  const [bugId, setBugId] = useState("");
  const [summary, setSummary] = useState("");
  const [topK, setTopK] = useState(5);

  const [loadingTrain, setLoadingTrain] = useState(false);
  const [trainResult, setTrainResult] = useState(null);

  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recMeta, setRecMeta] = useState(null);

  const [error, setError] = useState("");

  // new: view mode untuk rekomendasi: "cards" | "table"
  const [viewMode, setViewMode] = useState("table");

  // Get organization & project from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const org = localStorage.getItem("organization_name") || "";
      const proj = localStorage.getItem("project_name") || "";
      setOrganization(org);
      setProject(proj);
    }
  }, []);

  const handleTrain = async () => {
    setError("");
    setTrainResult(null);

    if (!organization || !project) {
      setError(
        "Organization and Project are not available (check localStorage / onboarding)."
      );
      return;
    }

    try {
      setLoadingTrain(true);

      const res = await fetch(
        `/api/ltr/${encodeURIComponent(organization)}/${encodeURIComponent(
          project
        )}/train?force_retrain=true`,
        {
          method: "POST",
        }
      );

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to train LTR model");
      }

      setTrainResult(json);
    } catch (err) {
      console.error("Train error:", err);
      setError(err.message || "Failed to train LTR model");
    } finally {
      setLoadingTrain(false);
    }
  };

  const handleRecommend = async () => {
    setError("");
    setRecommendations([]);
    setRecMeta(null);

    if (!organization || !project) {
      setError("Organization and Project are not available.");
      return;
    }

    if (mode === "id" && !bugId) {
      setError("Bug ID is required.");
      return;
    }

    if (mode === "summary" && !summary.trim()) {
      setError("Bug summary is required.");
      return;
    }

    try {
      setLoadingRecommend(true);

      let res;

      if (mode === "id") {
        res = await fetch(
          `/api/ltr/${encodeURIComponent(organization)}/${encodeURIComponent(
            project
          )}/recommended-developers/${encodeURIComponent(
            bugId
          )}?top_k=${encodeURIComponent(topK)}`,
          {
            method: "GET",
          }
        );
      } else {
        res = await fetch(
          `/api/ltr/${encodeURIComponent(organization)}/${encodeURIComponent(
            project
          )}/recommended-developers/ltr?top_k=${encodeURIComponent(topK)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              summary: summary.trim(),
              component: "",
            }),
          }
        );
      }

      const json = await res.json();
      if (!res.ok || json?.error || json?.detail) {
        throw new Error(
          json.error || json.detail || "Failed to get recommendations"
        );
      }

      setRecommendations(json.recommended_developers || []);
      setRecMeta(json);
      setViewMode("table");
    } catch (err) {
      console.error("Recommend error:", err);
      setError(err.message || "Failed to fetch developer recommendations");
    } finally {
      setLoadingRecommend(false);
    }
  };

  // Untuk normalisasi score (kalau mau dipakai bar kecil)
  const maxScore =
    recommendations.length > 0
      ? Math.max(
          ...recommendations.map((d) =>
            typeof d.score === "number" ? d.score : 0
          )
        ) || 1
      : 1;

  return (
    <LayoutCustom>
      <main className="min-h-screen bg-white px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-[#01559A]">
              Developer Recommendation (Learning-to-Rank)
            </h1>
            <p className="text-gray-700">
              This page uses a Learning-to-Rank (LTR) model to recommend
              developers based on historical bug-fixing data in EasyFix. You can
              search by <b>Bug ID</b> or <b>Bug Summary</b>, then see ranked
              candidates with experience signals.
            </p>
          </header>

          {/* Organization & Project Info */}
          <section className="border rounded-lg p-4 bg-gray-50 space-y-2">
            <h2 className="text-lg font-semibold text-[#01559A]">
              Project Context
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Organization (from localStorage)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. jho"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Project (from localStorage)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="e.g. cam"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Automatically loaded from <code>localStorage</code> (
              <code>organization_name</code> &amp; <code>project_name</code>),
              but can be edited manually.
            </p>
          </section>

          {/* Train Section */}
          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#01559A]">
                  1. Train LTR Model
                </h2>
                <p className="text-sm text-gray-600">
                  Train or refresh the ranking model using the latest bug
                  history stored in Neo4j.
                </p>
              </div>
              <button
                onClick={handleTrain}
                disabled={loadingTrain}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm ${
                  loadingTrain
                    ? "bg-gray-400"
                    : "bg-[#01559A] hover:bg-[#0468ba]"
                }`}
              >
                {loadingTrain ? "Training..." : "Train Model"}
              </button>
            </div>

            {/* Pretty train result */}
            {trainResult && (
              <div className="mt-3 space-y-4">
                {/* Top summary cards */}
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wide text-blue-500">
                      Model status
                    </div>
                    <div className="mt-1 text-sm font-semibold text-blue-900">
                      {trainResult.status || "Trained"}
                    </div>
                    <div className="mt-1 text-[11px] text-blue-700">
                      {trainResult.model_path?.split("/").pop() ||
                        "LTR model file"}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      Training bugs
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {trainResult.num_training_bugs ?? "-"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      Used for learning ranking patterns.
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      Test bugs
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {trainResult.num_test_bugs ?? "-"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      Held-out for evaluation.
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      Dataset rows
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {trainResult.rows ?? "-"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      Bug–developer pairs.
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#01559A]">
                    Evaluation Metrics
                  </h3>
                  <div className="grid gap-3 md:grid-cols-5">
                    <MetricCard
                      label="MAP"
                      value={trainResult.eval_metrics?.map}
                      tooltip={trainResult.metric_definitions?.MAP}
                    />
                    <MetricCard
                      label="NDCG@1"
                      value={trainResult.eval_metrics?.["ndcg@1"]}
                      tooltip={trainResult.metric_definitions?.["NDCG@k"]}
                    />
                    <MetricCard
                      label="Precision@1"
                      value={trainResult.eval_metrics?.["precision@1"]}
                      tooltip={trainResult.metric_definitions?.["Precision@k"]}
                    />
                    <MetricCard
                      label="NDCG@3"
                      value={trainResult.eval_metrics?.["ndcg@3"]}
                      tooltip={trainResult.metric_definitions?.["NDCG@k"]}
                    />
                    <MetricCard
                      label="NDCG@5"
                      value={trainResult.eval_metrics?.["ndcg@5"]}
                      tooltip={trainResult.metric_definitions?.["NDCG@k"]}
                    />
                  </div>
                  {trainResult.eval_explanation && (
                    <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-md p-2">
                      {trainResult.eval_explanation}
                    </p>
                  )}
                </div>

                {/* Features chips */}
                {Array.isArray(trainResult.features) &&
                  trainResult.features.length > 0 && (
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-[#01559A]">
                        Features used by the model
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {trainResult.features.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Raw JSON collapsible (debug) */}
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                    Show raw JSON payload
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all bg-gray-900 text-gray-100 p-3 rounded-md text-[10px] overflow-x-auto">
                    {JSON.stringify(trainResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </section>

          {/* Recommendation Section */}
          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#01559A]">
                  2. Get Recommended Developers
                </h2>
                <p className="text-sm text-gray-600">
                  This feature recommends the developers who are most likely to
                  be a good fit to fix your issue, based on how often they have
                  handled similar bugs in the past
                </p>
              </div>

              {/* Toggle mode Bug ID / Summary */}
              <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setMode("id")}
                  className={`px-3 py-1 text-xs md:text-sm font-medium rounded-full ${
                    mode === "id"
                      ? "bg-[#01559A] text-white shadow-sm"
                      : "text-[#01559A] hover:bg-gray-50"
                  }`}
                >
                  Bug ID
                </button>
                <button
                  type="button"
                  onClick={() => setMode("summary")}
                  className={`px-3 py-1 text-xs md:text-sm font-medium rounded-full ml-1 ${
                    mode === "summary"
                      ? "bg-[#01559A] text-white shadow-sm"
                      : "text-[#01559A] hover:bg-gray-50"
                  }`}
                >
                  Summary
                </button>
              </div>
            </div>

            {mode === "id" ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    Bug ID
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={bugId}
                    onChange={(e) => setBugId(e.target.value)}
                    placeholder="e.g. 1873153"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Top K
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value) || 5)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Bug Summary / Description
                  </label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm resize-y"
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Example: DevTools inspector does not show text when editing DOM in Firefox Nightly..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The summary will be embedded into a topic, then used to rank
                    developers. The <code>component</code> field from FE is
                    currently sent as empty.
                  </p>
                </div>
                <div className="max-w-xs">
                  <label className="block text-sm text-gray-600 mb-1">
                    Top K
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value) || 5)}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleRecommend}
              disabled={loadingRecommend}
              className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm ${
                loadingRecommend
                  ? "bg-gray-400"
                  : "bg-[#01559A] hover:bg-[#0468ba]"
              }`}
            >
              {loadingRecommend ? "Fetching..." : "Get Recommendations"}
            </button>

            {/* Meta summary from backend */}
            {recMeta && (
              <div className="mt-3 text-xs text-gray-700 space-y-1 bg-gray-50 border border-gray-100 rounded-md p-2">
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <div>
                    <span className="font-semibold">Bug ID:</span>{" "}
                    {recMeta.bug_id || (mode === "id" ? bugId : "-")}
                  </div>
                  {recMeta.topic_id && (
                    <div>
                      <span className="font-semibold">Topic ID:</span>{" "}
                      {recMeta.topic_id}
                    </div>
                  )}
                  {typeof recMeta.total_candidates === "number" && (
                    <div>
                      <span className="font-semibold">Total Candidates:</span>{" "}
                      {recMeta.total_candidates}
                    </div>
                  )}
                </div>
                {recMeta.bug_summary && (
                  <div className="mt-1 text-[11px] text-gray-600">
                    <span className="font-semibold">Bug summary:</span>{" "}
                    {recMeta.bug_summary}
                  </div>
                )}
              </div>
            )}

            {/* Recommendation cards / table + tabs */}
            {recommendations.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#01559A]">
                    Top {recommendations.length} recommended developers
                  </h3>

                  {/* Tabs: Cards / Table */}
                  <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs md:text-sm">
                    <button
                      type="button"
                      onClick={() => setViewMode("cards")}
                      className={`px-3 py-1 rounded-full font-medium ${
                        viewMode === "cards"
                          ? "bg-[#01559A] text-white shadow-sm"
                          : "text-[#01559A] hover:bg-gray-50"
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-1 rounded-full font-medium ml-1 ${
                        viewMode === "table"
                          ? "bg-[#01559A] text-white shadow-sm"
                          : "text-[#01559A] hover:bg-gray-50"
                      }`}
                    >
                      Table
                    </button>
                  </div>
                </div>

                {/* View: CARDS */}
                {viewMode === "cards" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {recommendations.map((dev, idx) => {
                      const score =
                        typeof dev.score === "number" ? dev.score : 0;
                      const scorePct = Math.max(
                        0,
                        Math.min(100, Math.round((score / maxScore) * 100))
                      );

                      return (
                        <div
                          key={dev.developer_id || idx}
                          className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Rank badge */}
                          <div className="absolute -top-3 left-4">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              #{idx + 1}
                            </span>
                          </div>

                          <div className="mt-1 space-y-3">
                            {/* Developer ID */}
                            <div>
                              <div className="text-xs font-semibold text-gray-500">
                                Developer ID
                              </div>
                              <div className="text-sm font-semibold text-gray-900 break-all">
                                {dev.developer_id || "-"}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-1 text-xs text-gray-700">
                              <div>
                                <span className="font-semibold">
                                  Bugs fixed (total):
                                </span>{" "}
                                {dev.bugs_fixed_total ?? "-"}
                              </div>
                              <div>
                                <span className="font-semibold">
                                  Bugs fixed (topic):
                                </span>{" "}
                                {dev.bugs_fixed_topic ?? "-"}
                              </div>
                            </div>

                            {/* LTR score */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-gray-600">
                                <span>LTR score</span>
                                <span className="font-mono">
                                  {score.toFixed(4)}
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#01559A]"
                                  style={{ width: `${scorePct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* View: TABLE */}
                {viewMode === "table" && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-[#01559A] mb-2">
                      Developer table
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-xs md:text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">
                              Rank
                            </th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">
                              Developer ID
                            </th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b">
                              Bugs fixed (total)
                            </th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b">
                              Bugs fixed (topic)
                            </th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-700 border-b">
                              LTR score
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recommendations.map((dev, idx) => {
                            const score =
                              typeof dev.score === "number"
                                ? dev.score
                                : Number(dev.score) || 0;

                            return (
                              <tr
                                key={`row-${dev.developer_id || idx}`}
                                className="odd:bg-white even:bg-gray-50"
                              >
                                <td className="px-3 py-2 border-b text-gray-800">
                                  #{idx + 1}
                                </td>
                                <td className="px-3 py-2 border-b text-gray-900 break-all">
                                  {dev.developer_id || "-"}
                                </td>
                                <td className="px-3 py-2 border-b text-right text-gray-800">
                                  {dev.bugs_fixed_total ?? "-"}
                                </td>
                                <td className="px-3 py-2 border-b text-right text-gray-800">
                                  {dev.bugs_fixed_topic ?? "-"}
                                </td>
                                <td className="px-3 py-2 border-b text-right font-mono text-gray-900">
                                  {score.toFixed(4)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No result state */}
            {!loadingRecommend && recMeta && recommendations.length === 0 && (
              <p className="mt-3 text-sm text-gray-600">
                No developers were recommended for this query.
              </p>
            )}
          </section>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </main>
    </LayoutCustom>
  );
}

/**
 * Small card for metrics
 */
function MetricCard({ label, value, tooltip }) {
  const display =
    typeof value === "number"
      ? value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
      : "-";
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-1">
        <div className="text-[11px] font-medium text-gray-500">{label}</div>
      </div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{display}</div>
      {tooltip && (
        <p className="mt-1 text-[10px] text-gray-500 line-clamp-3">{tooltip}</p>
      )}
    </div>
  );
}
