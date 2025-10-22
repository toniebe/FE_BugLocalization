import React from "react";

function login() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-[#01559A]">Welcome Back</h1>
        <p className="mb-4 text-center text-[#44444E]">
          Glad to see you again 👋 <br/>Login to your account below
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
          <button
            type="submit"
            className="w-full bg-[#01559A] text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
        <div>
          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{" "}
            <a href="#" className="text-[#01559A] font-semibold">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default login;
