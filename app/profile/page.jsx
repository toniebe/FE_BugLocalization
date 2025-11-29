"use client";
import LayoutCustom from "@/components/LayoutCustom";
import { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: "",
    jobTitle: "",
    email: "toiniebe48@gmail.com", // bisa kamu ganti / ambil dari props / context
    phone: "",
    photoUrl: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null); // { type: "success" | "error", text: string }

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // === UPDATE PROFILE -> /api/profile (Next.js API route) ===
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage(null);

    try {
      setProfileLoading(true);

      // BE cuma kenal 2 field ini
      const payload = {
        display_name: profile.fullName.trim() || "",
        photo_url: profile.photoUrl?.trim() || "",
      };

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.detail || data?.error?.message || "Failed to update profile."
        );
      }

      setProfileMessage({
        type: "success",
        text:
          data?.message === "Nothing to update"
            ? "Nothing to update."
            : "Profile updated successfully.",
      });

      // sync balik kalau BE kirim display_name & photo_url
      setProfile((prev) => ({
        ...prev,
        fullName: data.display_name ?? prev.fullName,
        photoUrl: data.photo_url ?? prev.photoUrl,
      }));
    } catch (err) {
      console.error("Update profile error:", err);
      setProfileMessage({
        type: "error",
        text: err.message,
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // === CHANGE PASSWORD -> /api/change-password (Next.js API route) ===
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordMessage({
        type: "error",
        text: "Current password and new password are required.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirmation do not match.",
      });
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_password: passwordForm.newPassword,
          current_password: passwordForm.currentPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.error?.message ||
          "Failed to update password. Please try again.";
        throw new Error(msg);
      }

      setPasswordMessage({
        type: "success",
        text: "Password updated successfully.",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Change password error:", err);
      setPasswordMessage({
        type: "error",
        text: err.message || "Failed to update password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LayoutCustom>
        {/* Blue banner */}
        <div className="bg-[#2E78CE] h-32 md:h-40" />

        <main className="flex-1 -mt-20 md:-mt-24 pb-10">
          <div className="max-w-6xl mx-auto px-4 space-y-8">
            {/* Profile card */}
            <section className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 relative">
              {/* Avatar */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center shadow-md overflow-hidden">
                  {profile.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.photoUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-12 w-12 text-slate-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 20c0-2.21 2.686-4 6-4s6 1.79 6 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Title + tabs */}
              <div className="mt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                    Profile Settings
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Perbarui informasi akun dan kontakmu.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 p-1 bg-slate-50">
                  <button className="px-4 py-1.5 text-xs md:text-sm rounded-full bg-white shadow-sm text-slate-900 font-medium">
                    Team
                  </button>
                  <button className="px-4 py-1.5 text-xs md:text-sm rounded-full text-slate-500 hover:text-slate-800">
                    Personal
                  </button>
                </div>
              </div>

              {/* Alert profile */}
              {profileMessage && (
                <div
                  className={`mt-4 text-sm rounded-xl px-4 py-3 ${
                    profileMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              {/* Profile form */}
              <form
                onSubmit={handleProfileSubmit}
                className="mt-8 space-y-6 text-sm md:text-base"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="fullName"
                      className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                    >
                      Fullname
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      className="h-11 rounded-xl border border-slate-200 px-3 md:px-4 bg-slate-50/60 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="jobTitle"
                      className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                    >
                      Role / Job Title
                    </label>
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      placeholder="Contoh: Backend Engineer"
                      value={profile.jobTitle}
                      onChange={handleProfileChange}
                      className="h-11 rounded-xl border border-slate-200 px-3 md:px-4 bg-slate-50/60 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="photoUrl"
                    className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                  >
                    Photo URL (Avatar)
                  </label>
                  <input
                    id="photoUrl"
                    name="photoUrl"
                    type="url"
                    placeholder="https://example.com/avatar.png"
                    value={profile.photoUrl}
                    onChange={handleProfileChange}
                    className="h-11 rounded-xl border border-slate-200 px-3 md:px-4 bg-slate-50/60 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Link ke gambar profil, akan tersimpan sebagai{" "}
                    <code>photo_url</code> di backend.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="h-11 rounded-xl border border-slate-300 px-3 md:px-4 bg-slate-300/70 text-slate-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email digunakan sebagai akun login dan tidak dapat diubah.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="phone"
                    className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Contoh: +62 812 3456 7890"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="h-11 rounded-xl border border-slate-200 px-3 md:px-4 bg-slate-50/60 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-2">
                  <div className="flex-1 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full md:w-40 h-11 rounded-xl bg-[#01559A] text-white font-semibold shadow-md hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {profileLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* Change Password card */}
            <section
              id="change-password"
              className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    Change Password
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Demi keamanan, gunakan password yang kuat dan unik.
                  </p>
                </div>
              </div>

              {/* Alert change password */}
              {passwordMessage && (
                <div
                  className={`mt-4 text-sm rounded-xl px-4 py-3 ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <form
                onSubmit={handlePasswordSubmit}
                className="mt-6 space-y-5 text-sm md:text-base"
              >
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="currentPassword"
                    className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                  >
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Masukkan password saat ini"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="h-11 rounded-xl border border-slate-200 px-3 md:px-4 bg-slate-50/60 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="newPassword"
                      className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                    >
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="h-11 rounded-xl border border-slate-200 px-3 md:px-4 bg-slate-50/60 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Gunakan kombinasi huruf besar, kecil, angka, dan simbol.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="confirmPassword"
                      className="text-xs font-medium text-slate-600 uppercase tracking-wide"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Ulangi password baru"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="h-11 rounded-xl border border-slate-200 px-3 md:px-4 bg-slate-50/60 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-2 md:items-center md:justify-between">
                  <p className="text-xs text-slate-500">
                    Setelah password diganti, kamu mungkin diminta login ulang
                    di beberapa device.
                  </p>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full md:w-48 h-11 rounded-xl bg-[#01559A] text-white font-semibold shadow-md hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </main>
      </LayoutCustom>
    </div>
  );
}
