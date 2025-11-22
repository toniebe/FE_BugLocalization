"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { signup } from "@/app/_lib/auth-client";

export default function Register({ nextPath = "/home" }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg, setMsg] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [display_name, setDisplay_name] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (pwd !== pwd2) {
      setMsg("Password tidak sama");
      return;
    }
    try {
      setDisabled(true);
      await signup(email, pwd,display_name);
      // redirect manual jika perlu:
      window.location.replace(nextPath);
      setDisabled(false);
    } catch (err) {
      setMsg(err?.message || "Gagal daftar");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <Image src="/easyfix-logo.png" alt="EasyFix Logo" width={150} height={150} className="mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2 text-center text-[#01559A]">Create an Account</h1>
        <p className="mb-4 text-center text-[#44444E]">Join us today! 👋</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-gray-700">Email</label>
            <input type="email" className="w-full mt-1 p-2 border rounded border-[#44444E]"
                   value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700">Display Name</label>
            <input type="text" className="w-full mt-1 p-2 border rounded border-[#44444E]"
                   value={display_name} onChange={(e)=>setDisplay_name(e.target.value)} required />

          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input type="password" className="w-full mt-1 p-2 border rounded border-[#44444E]"
                   value={pwd} onChange={(e)=>setPwd(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input type="password" className="w-full mt-1 p-2 border rounded border-[#44444E]"
                   value={pwd2} onChange={(e)=>setPwd2(e.target.value)} required />
          </div>

          <button disabled={disabled} type="submit" 
          className={`w-full ${disabled ? "bg-gray-400": "bg-[#01559A] hover:bg-[#0468ba] transition"}  text-white p-2 rounded `}
          >
            Register
          </button>

          {msg && <p className="mt-2 text-center text-red-600 text-sm">{msg}</p>}
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="text-[#01559A] font-semibold">Login</Link>
        </p>
      </div>
    </main>
  );
}
