import Image from "next/image";
import Link from "next/link";
import React from "react";

function Register() {
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
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded border-[#44444E]"
              placeholder=""
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded border-[#44444E]"
              placeholder=""
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded border-[#44444E]"
              placeholder=""
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#01559A] text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Register
          </button>
        </form>
        <div>
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#01559A] font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
