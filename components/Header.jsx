import { logout } from "@/app/_lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";

function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("organization_name");
      localStorage.removeItem("project_name");
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      router.replace("/login");
    }
  };
  return (
    <header className="w-full border-b border-[#e4e4e4] bg-white">
      <div className="px-4 h-14 flex items-center justify-between">
        <button
          className="text-[#0D5DB8] font-semibold text-left px-3 py-2 text-sm"
          onClick={() => {
            router.push("/home");
          }}
        >
          <img src="/easyfix-logo.png" alt="EasyFix Logo" className="h-8" />
        </button>
        <div>
          <button
            className="text-[#0D5DB8] font-semibold text-left px-3 py-2 text-sm"
            onClick={() => {
              router.push("/home");
            }}
          >
            Home
          </button>
          <button
            className="text-[#0D5DB8] font-semibold text-left px-3 py-2 text-sm"
            onClick={() => {
              router.push("/new-bug");
            }}
          >
            New Bug
          </button>
        </div>
        <div className="relative group">
          <div className="w-8 h-8 rounded-full bg-gray-300 cursor-pointer" />

          <div
            className="
                absolute right-0 top-full pt-2
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                transition-opacity duration-150
                z-50
              "
          >
            <div className="w-40 bg-white border border-gray-200 rounded-md shadow-lg">
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => router.push("/profile")}
              >
                Edit Profile
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => handleLogout()}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
