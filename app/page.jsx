"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PriceCard from "@/components/PriceCard";
import Chatbot from "@/components/Chatbot";


export default function Home() {
  const [open, setOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false); // ⬅️ TAMBAH INI

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <nav className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/easyfix-logo.png"
                alt="EasyFix Logo"
                width={140}
                height={40}
                className="object-contain h-8 w-auto md:h-9"
                priority
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#Feature"
              className="text-sm font-medium text-[#01559A] hover:opacity-80"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-[#01559A]  transition"
            >
              About Us
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#01559A] hover:opacity-80"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-[#01559A] px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition"
            >
              Sign Up
            </Link>
          </div>

          <button
            aria-label="Toggle menu"
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 border border-gray-200"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-[#01559A]"
            >
              {open ? (
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M3.75 5.25a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75zm0 6a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75zm0 6a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>
        </nav>

        {open && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-4 sm:px-6 py-3 flex flex-col gap-3">
              <Link
                href="#Feature"
                className="text-sm font-medium text-[#01559A]"
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-[#01559A]"
              >
                About Us
              </Link>
              <div className="h-px bg-gray-100 my-1" />
              <Link
                href="/login"
                className="text-sm font-semibold text-[#01559A]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#01559A] px-4 py-2 text-sm font-medium text-white rounded-lg w-full text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24 grid gap-10 items-center">
          <div className="text-center ">
            <h1 className="font-extrabold tracking-tight text-[#01559A] text-3xl sm:text-4xl md:text-5xl leading-tight">
              Accelerate debugging with
              <br className="hidden md:block" />
              <span className="md:whitespace-nowrap">
                {" "}
                AI-powered bug resolution
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-700">
              Learning to type twice as fast will only speed up overall
              development time by a few percent. If you really want to
              accelerate software development, focus on reducing the time spent
              on debugging.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base sm:text-lg font-medium text-white bg-[#01559A] hover:opacity-90 transition"
              >
                Get Started
              </Link>

              {/* Tombol buat munculin Chatbot */}
              <button
                type="button"
                onClick={() => setShowChatbot((v) => !v)}
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base sm:text-lg font-medium text-[#01559A] border border-[#01559A] hover:bg-[#01559A]/5 transition"
              >
                {"Open AI Assistant"}
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="Feature"
          className="bg-[#01559A] px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-10 md:pb-24"
        >
          {/* Headline row */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Features
            </h2>
            <h3 className="text-lg md:text-xl font-normal text-white/95 md:text-right mt-2 md:mt-0">
              Simple, Transparent, Flexible
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-stretch">
            <PriceCard
              packageName="Relevant Information"
              price={null}
              billingCycle=""
              subtitle="Bug, code, and developer context in one place."
              features={[
                "Concise and clear bug descriptions.",
                "History of code changes and related commits.",
                "Developers relevant to the same code areas.",
              ]}
              className="mx-auto w-full max-w-sm"
            />

            <PriceCard
              packageName="Visualization Dashboard"
              price={null}
              billingCycle=""
              subtitle="Interactive knowledge graph to understand bug–code–developer relationships."
              features={[
                "Visualize relationships between bugs ↔ code ↔ commits ↔ developers.",
                "Quickly see patterns, dependencies, and bug context.",
                "Interactive visual view for team exploration.",
              ]}
              className="mx-auto w-full max-w-md md:translate-y-[-6px]"
            />

            <PriceCard
              packageName="Developer Recommendation"
              price={null}
              billingCycle=""
              subtitle="Suggests the most relevant developers to handle each bug."
              features={[
                "Recommendations based on code contribution and commit history.",
                "Takes into account expertise and frequently worked-on modules.",
                "Speeds up assigning bugs to the right developer.",
              ]}
              className="mx-auto w-full max-w-sm"
            />
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="grid grid-cols-1 md:grid-cols-2 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24"
        >
          <div className="my-auto">
            <img
              src="banner-landing.jpg"
              alt="About EasyFix"
              className="object-contain w-full h-auto"
            />
          </div>
          <div className="ml-8 max-w-3xl ">
            <div>
              <h2 className="font-bold tracking-tight text-[#01559A] text-2xl sm:text-4xl md:text-5xl leading-tight">
                About Us
              </h2>
              <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-700">
                <span className="text-[#01559A] font-bold">EASYFIX</span> is an
                AI-powered bug resolution solution that integrates Machine
                Learning and Knowledge Graphs to help developers discover
                relevant bug information, so that bug fixing can be done much
                faster. Through an interactive dashboard, EASYFIX presents
                visual graphs and information related to bugs, commits, and the
                developers involved. By cutting down debugging time, EASYFIX
                helps organizations reduce costs, increase productivity, and
                accelerate the release cycle of high-quality software.
              </p>
            </div>
            <div className="mt-8">
              <h2 className="font-bold tracking-tight text-[#01559A] text-2xl sm:text-4xl md:text-5xl leading-tight">
                Contact Us
              </h2>
              <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-700">
                23524302@mahasiswa.itb.ac.id
                <br />
                23524304@mahasiswa.itb.ac.id
                <br />
                23524319@mahasiswa.itb.ac.id
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} EasyFix. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#privacy" className="hover:text-gray-700">
              Privacy
            </Link>
            <Link href="#terms" className="hover:text-gray-700">
              Terms
            </Link>
            <Link href="#contact" className="hover:text-gray-700">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      {/* CHATBOT: tampil kalau showChatbot = true */}
      {showChatbot && (
        
          <Chatbot />

      )}
    </div>
  );
}
