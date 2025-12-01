// app/developer-recommendation/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function DeveloperRecommendationPage() {
  const [organization, setOrganization] = useState("");
  const [project, setProject] = useState("");
  const [bugId, setBugId] = useState("");
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
    if (!bugId) {
      setError("Bug ID harus diisi dulu.");
      return;
    }

    try {
      setLoadingRecommend(true);

      const res = await fetch(
        `/api/ltr/${encodeURIComponent(organization)}/${encodeURIComponent(
          project
        )}/recommended-developers/${encodeURIComponent(
          bugId
        )}?top_k=${encodeURIComponent(topK)}`,
        {
          method: "GET",
        }
      );

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to get recommendations");
      }

      // backend mengembalikan result["recommended_developers"]
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
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-[#01559A]">
            Developer Recommendation (Learning-to-Rank)
          </h1>
          <p className="text-gray-700">
            Halaman ini menggunakan model Learning-to-Rank untuk
            merekomendasikan developer berdasarkan Bug ID dari EasyFix.
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
            tersedia (organization_name &amp; project_name), tapi masih bisa
            diedit manual.
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
                loadingTrain ? "bg-gray-400" : "bg-[#01559A] hover:bg-[#0468ba]"
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
          <h2 className="text-lg font-semibold text-[#01559A]">
            2. Get Recommended Developers
          </h2>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Bug ID</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm"
                value={bugId}
                onChange={(e) => setBugId(e.target.value)}
                placeholder="contoh: 1873153"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Top K</label>
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
                {recMeta.bug_id || bugId}
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
              Tidak ada developer yang direkomendasikan untuk bug ini.
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
  );
}
