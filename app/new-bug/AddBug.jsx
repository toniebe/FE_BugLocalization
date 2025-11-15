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
      <section className="max-w-4xl mx-auto mt-8 px-4 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Add New Bug
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Buat tiket bug baru lengkap dengan konteks produk, relasi bug, dan
            informasi commit supaya EasyFix-BKG bisa bekerja maksimal.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/90 border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8"
        >
          {/* SECTION: Bug Summary */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Bug Summary
            </h2>
            <p className="text-xs text-gray-500">
              Ringkas namun jelas. Gunakan satu kalimat yang menggambarkan inti masalah.
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
                Contoh: <code>Password prompt shows "rememberPassword"…</code>
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
                Tentukan status lifecycle bug dan resolusinya (jika sudah diketahui).
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
                  <span className="font-medium">NEW</span> untuk bug yang baru
                  dibuat dan belum diproses.
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
                  placeholder="FIXED, WONTFIX, DUPLICATE, dll (optional)"
                />
                <p className="text-xs text-gray-500">
                  Kosongkan jika bug belum di-resolve.
                </p>
              </div>
            </div>

            {/* Product & Component */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Product & Component
              </h2>
              <p className="text-xs text-gray-500">
                Menentukan konteks aplikasi dan modul tempat bug terjadi.
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
                  Nama aplikasi / produk utama, misalnya{" "}
                  <code>Thunderbird</code>.
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
                  Modul / bagian spesifik dalam produk, contoh:{" "}
                  <code>General</code>, <code>UI</code>, <code>Storage</code>.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION: Reporter & Assignee */}
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Reporter
              </h2>
              <p className="text-xs text-gray-500">
                Informasi pembuat bug report untuk keperluan follow-up.
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
                  Email atau identifier pengguna yang melaporkan bug.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Assignee
              </h2>
              <p className="text-xs text-gray-500">
                Developer atau owner yang bertanggung jawab terhadap bug ini.
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
                  Bisa berupa email, username Git, atau ID internal developer.
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
                Link terkait bug, misalnya halaman reproduksi, dokumentasi, atau
                issue lain.
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
                Contoh: <code>perf, regression, crash</code>. Membantu pencarian
                bug serupa di EasyFix-BKG.
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
                ID bug lain yang harus diselesaikan terlebih dahulu.
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
                Jika bug ini duplikasi dari bug lain, isi ID bug aslinya.
              </p>
            </div>
          </div>

          {/* SECTION: Commit & Files */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Commit Messages (satu per baris)
              </label>
              <textarea
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                rows={3}
                value={commitMessages}
                onChange={(e) => setCommitMessages(e.target.value)}
                placeholder={`Password prompt shows "..." r=#thunderbird-reviewers\nPassword prompt shows "..." r=leftmostcat`}
              />
              <p className="text-xs text-gray-500">
                Satu commit message per baris untuk menghubungkan bug dengan
                riwayat perubahan kode.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Commit Refs (satu per baris / dipisah spasi)
              </label>
              <textarea
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                rows={2}
                value={commitRefs}
                onChange={(e) => setCommitRefs(e.target.value)}
                placeholder="https://hg.mozilla.org/comm-central/rev/d5ccf2809341"
              />
              <p className="text-xs text-gray-500">
                Bisa berupa URL repo, hash commit, atau ref lain terkait
                perubahan.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Files Changed (satu per baris)
              </label>
              <textarea
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5DB8]/60 focus:border-[#0D5DB8]/70"
                rows={3}
                value={filesChanged}
                onChange={(e) => setFilesChanged(e.target.value)}
                placeholder={`path/to/file1.cpp\npath/to/file2.js`}
              />
              <p className="text-xs text-gray-500">
                Path file yang terdampak, memudahkan analisis graph antara bug–file–commit.
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
      </section>
    </LayoutCustom>
  );
}
