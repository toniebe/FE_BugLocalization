"use client";
import React from "react";
import Header from "./Header";

function LayoutCustom({ children }) {

  return (
    <main className="w-full min-h-screen bg-gray-100">
      <Header />
      {children}
    </main>
  );
}

export default LayoutCustom;
