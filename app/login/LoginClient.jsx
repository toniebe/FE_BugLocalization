"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { login } from "@/app/_lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginClient({ nextUrl = "/home" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const [disabled, setDisabled] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setDisabled(true);

    try {
      const data = await login(email, password);

      if (email) {
        localStorage.setItem("user_email", email);
      }

      console.log("Login successful:", data);
      router.push("/select-project");
    } catch (err) {
      console.error("Login error:", err);
      setMsg(err.message || "Login failed");
    } finally {
      setDisabled(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F3F6FB]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-[#E0E7FF]">
        <Image
          src="/easyfix-logo.png"
          alt="EasyFix Logo"
          width={150}
          height={150}
          className="mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold mb-2 text-center text-[#01559A]">
          Welcome Back
        </h1>
        <p className="mb-4 text-center text-[#44444E] text-sm">
          Glad to see you again 👋 <br />
          Login to your account below
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-gray-700 text-sm">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded-md border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#01559A]"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-md border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#01559A]"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={disabled}
            className={`w-full mt-2 text-white p-2 rounded-md font-medium
              ${
                disabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#01559A] hover:bg-[#0468ba] transition"
              }`}
          >
            {disabled ? "Signing in..." : "Login"}
          </button>

          {msg && <p className="text-red-500 text-center mt-2 text-sm">{msg}</p>}
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#01559A] font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
