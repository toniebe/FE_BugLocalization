"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function Register() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/home";

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (!email || !password) {
      setMsg("Email dan password wajib diisi");
      return;
    }
    if (password.length < 6) {
      setMsg("Password minimal 6 karakter");
      return;
    }
    if (password !== password2) {
      setMsg("Konfirmasi password tidak sama");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName || null,
        }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(data?.detail || data?.error || `Signup gagal (${r.status})`);
      }

      const rLogin = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const dLogin = await rLogin.json().catch(() => ({}));
      if (!rLogin.ok) {
        router.replace(`/login?next=${encodeURIComponent(next)}&email=${encodeURIComponent(email)}`);
        return;
      }

      router.replace(next);
    } catch (e) {
      setMsg(e.message || "Terjadi kesalahan saat register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <Image
          src="/easyfix-logo.png"
          alt="EasyFix Logo"
          width={150}
          height={150}
          className="mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold mb-2 text-center text-[#01559A]">
          Create an Account
        </h1>
        <p className="mb-4 text-center text-[#44444E]">
          Join us today! 👋 <br />
          Fill in the details below to get started
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-gray-700">Display Name (opsional)</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded border-[#44444E]"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded border-[#44444E]"
              placeholder="you@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
          </div>

          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded border-[#44444E]"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded border-[#44444E]"
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#01559A] text-white p-2 rounded hover:bg-blue-600 transition disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {msg && (
            <p className="text-red-500 text-center mt-2">{msg}</p>
          )}
        </form>

        <div>
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-[#01559A] font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
