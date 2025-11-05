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

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      setDisabled(true);
      await login(email, password);
      router.replace(nextUrl);
      setDisabled(false);
    } catch (e) {
      setDisabled(false);
      setMsg(e.message || "Login gagal");
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
          Welcome Back
        </h1>
        <p className="mb-4 text-center text-[#44444E]">
          Glad to see you again 👋 <br />
          Login to your account below
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded border-[#44444E]"
              placeholder="youre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>

          <button
            type="submit"
            disabled={disabled}
            className={`w-full ${
              disabled
                ? "bg-gray-400"
                : "bg-[#01559A] hover:bg-[#0468ba] transition"
            }  text-white p-2 rounded `}
          >
            Login
          </button>

          {msg && <p className="text-red-500 text-center mt-2">{msg}</p>}
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#01559A] font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
