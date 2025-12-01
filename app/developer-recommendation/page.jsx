// app/developer-recommendation/page.jsx
"use client";

import LayoutCustom from "@/components/LayoutCustom";
import { useEffect, useState } from "react";

export default function DeveloperRecommendationPage() {
  const [organization, setOrganization] = useState("");
  const [project, setProject] = useState("");

  // mode pencarian: by Bug ID atau Summary
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

  // Ambil organization & project dari localStorage saat client mount
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
        "Organization dan Project belum tersedia (cek localStorage / onboarding)."
      );
      return;
    }

    try {
      setLoadingTrain(true);

      const res = await fetch(
        `/api/ltr/${encodeURIComponent(organization)}/${encodeURIComponent(
          project
        )}/train?force_retrain=false`,
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
      setError(err.message || "Gagal melatih model LTR");
    } finally {
      setLoadingTrain(false);
    }
  };

  const handleRecommend = async () => {
    setError("");
    setRecommendations([]);
    setRecMeta(null);

    if (!organization || !project) {
      setError("Organization dan Project belum tersedia.");
      return;
    }

    if (mode === "id" && !bugId) {
      setError("Bug ID harus diisi dulu.");
      return;
    }

    if (mode === "summary" && !summary.trim()) {
      setError("Summary bug harus diisi dulu.");
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
      console.log("LTR RESPONSE:", json); 
      if (!res.ok || json?.error || json?.detail) {
        throw new Error(
          json.error || json.detail || "Failed to get recommendations"
        );
      }

      setRecommendations(json.recommended_developers || []);
      setRecMeta(json);

    } catch (err) {
      console.error("Recommend error:", err);
      setError(err.message || "Gagal mengambil rekomendasi developer");
    } finally {
      setLoadingRecommend(false);
    }
  };

  return (
    <LayoutCustom>
      <main className="min-h-screen bg-white px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-[#01559A]">
              Developer Recommendation (Learning-to-Rank)
            </h1>
            <p className="text-gray-700">
              Halaman ini menggunakan model Learning-to-Rank untuk
              merekomendasikan developer berdasarkan data bug di EasyFix. Kamu
              bisa mencari berdasarkan <b>Bug ID</b> atau <b>Summary bug</b>.
            </p>
          </header>

          {/* Info Organization & Project */}
          <section className="border rounded-lg p-4 bg-gray-50 space-y-2">
            <h2 className="text-lg font-semibold text-[#01559A]">
              Project Context
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Organization (dari localStorage)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="contoh: jho"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Project (dari localStorage)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="contoh: cam"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Nilai ini otomatis diambil dari <code>localStorage</code> jika
              tersedia (<code>organization_name</code> &amp;{" "}
              <code>project_name</code>), tapi masih bisa diedit manual.
            </p>
          </section>

          {/* Train Section */}
          <section className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#01559A]">
                1. Train LTR Model
              </h2>
              <button
                onClick={handleTrain}
                disabled={loadingTrain}
                className={`px-4 py-2 rounded text-sm font-medium text-white ${
                  loadingTrain
                    ? "bg-gray-400"
                    : "bg-[#01559A] hover:bg-[#0468ba]"
                }`}
              >
                {loadingTrain ? "Training..." : "Train Model"}
              </button>
            </div>
            <p className="text-sm text-gray-700">
              Tombol ini akan memanggil endpoint:
              <br />
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                POST
                /api/ltr/&lt;org&gt;/&lt;project&gt;/train?force_retrain=false
              </code>
            </p>

            {trainResult && (
              <div className="mt-3 p-3 rounded bg-green-50 border border-green-200 text-sm text-green-800">
                <pre className="whitespace-pre-wrap break-all text-xs">
                  {JSON.stringify(trainResult, null, 2)}
                </pre>
              </div>
            )}
          </section>

          {/* Recommendation Section */}
          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#01559A]">
                2. Get Recommended Developers
              </h2>

              {/* Toggle mode Bug ID / Summary */}
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setMode("id")}
                  className={`px-3 py-1 text-xs md:text-sm font-medium rounded-md ${
                    mode === "id"
                      ? "bg-[#01559A] text-white"
                      : "text-[#01559A] hover:bg-gray-50"
                  }`}
                >
                  Bug ID
                </button>
                <button
                  type="button"
                  onClick={() => setMode("summary")}
                  className={`px-3 py-1 text-xs md:text-sm font-medium rounded-md ml-1 ${
                    mode === "summary"
                      ? "bg-[#01559A] text-white"
                      : "text-[#01559A] hover:bg-gray-50"
                  }`}
                >
                  Summary
                </button>
              </div>
            </div>

            {/* Input berdasarkan mode */}
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
                    placeholder="contoh: 1873153"
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
                    placeholder="Contoh: DevTools inspector tidak menampilkan teks ketika mengedit DOM pada Firefox Nightly..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Summary akan dipakai untuk mencari topic yang relevan lalu
                    merekomendasikan developer. Field <code>component</code>{" "}
                    dari FE otomatis dikirim kosong.
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
              className={`mt-2 px-4 py-2 rounded text-sm font-medium text-white ${
                loadingRecommend
                  ? "bg-gray-400"
                  : "bg-[#01559A] hover:bg-[#0468ba]"
              }`}
            >
              {loadingRecommend ? "Fetching..." : "Get Recommendations"}
            </button>

            {/* Meta summary dari backend */}
            {recMeta && (
              <div className="mt-3 text-xs text-gray-700 space-y-1">
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
            )}

            {/* Tabel rekomendasi */}
            {recommendations.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border-b text-left">#</th>
                      <th className="px-3 py-2 border-b text-left">
                        Developer (Email / ID)
                      </th>
                      <th className="px-3 py-2 border-b text-left">
                        Bugs Fixed (Total)
                      </th>
                      <th className="px-3 py-2 border-b text-left">
                        Bugs Fixed (Same Topic)
                      </th>
                      <th className="px-3 py-2 border-b text-left">Recency</th>
                      <th className="px-3 py-2 border-b text-left">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.map((dev, idx) => {
                      const recentLabel =
                        dev.recent_days === 9999 ||
                        dev.recent_days === null ||
                        dev.recent_days === undefined
                          ? "Not recent / unknown"
                          : `${dev.recent_days} days`;

                      return (
                        <tr
                          key={dev.developer_id || idx}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 border-b">{idx + 1}</td>
                          <td className="px-3 py-2 border-b font-medium text-gray-900">
                            {dev.developer_id || "-"}
                          </td>
                          <td className="px-3 py-2 border-b text-gray-700">
                            {dev.bugs_fixed_total ?? "-"}
                          </td>
                          <td className="px-3 py-2 border-b text-gray-700">
                            {dev.bugs_fixed_topic ?? "-"}
                          </td>
                          <td className="px-3 py-2 border-b text-gray-700">
                            {recentLabel}
                          </td>
                          <td className="px-3 py-2 border-b text-gray-700">
                            {typeof dev.score === "number"
                              ? dev.score.toFixed(4)
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Kalau belum ada hasil tapi sudah request, bisa tambahkan info */}
            {!loadingRecommend && recMeta && recommendations.length === 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Tidak ada developer yang direkomendasikan untuk query ini.
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
