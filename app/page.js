"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PriceCard from "@/components/PriceCard";

export default function Home() {
  const [open, setOpen] = useState(false);

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
              href="#pricing"
              className="text-sm font-medium text-[#01559A] hover:opacity-80"
            >
              Pricing
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
              href="#login"
              className="text-sm font-semibold text-[#01559A] hover:opacity-80"
            >
              Login
            </Link>
            <Link
              href="#signup"
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
                href="#pricing"
                className="text-sm font-medium text-[#01559A]"
              >
                Pricing
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-[#01559A]"
              >
                About Us
              </Link>
              <div className="h-px bg-gray-100 my-1" />
              <Link
                href="#login"
                className="text-sm font-semibold text-[#01559A]"
              >
                Login
              </Link>
              <Link
                href="#signup"
                className="bg-[#01559A] px-4 py-2 text-sm font-medium text-white rounded-lg w-full text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 md:pt-14 md:pb-24 grid gap-10 items-center">
          <div className="text-center ">
            <h1 className="font-extrabold tracking-tight text-[#01559A] text-3xl sm:text-4xl md:text-5xl leading-tight">
              Percepat debugging dengan bug
              <br className="hidden md:block" />
              <span className="md:whitespace-nowrap">
                {" "}
                resolution berbasis AI
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-700">
              Belajar mengetik dua kali lebih cepat hanya akan mempercepat waktu
              pengembangan keseluruhan beberapa persen saja. Jadi, jika ingin
              mempercepat proses pengembangan perangkat lunak hingga selesai,
              fokuslah pada upaya mengurangi waktu yang dihabiskan untuk
              debugging.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="#get-started"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base sm:text-lg font-medium text-white bg-[#01559A] hover:opacity-90 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>
        <section
          id="pricing"
          className="bg-[#01559A] px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-10 md:pb-24"
        >
          {/* Headline row */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Pricing
            </h2>
            <h3 className="text-lg md:text-xl font-normal text-white/95 md:text-right mt-2 md:mt-0">
              Simple, Transparent, Flexible
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-stretch">
            <PriceCard
              packageName="Pro"
              price={22}
              billingCycle="User"
              subtitle="for small dev"
              features={[
                "1-50 Users",
                "no limit transactions",
                "unlimited query search",
              ]}
              className="mx-auto w-full max-w-sm"
            />

            <PriceCard
              isPopular
              packageName="Team"
              price={12}
              billingCycle="User"
              subtitle="For medium team"
              features={[
                "50-150 Users",
                "no limit transactions",
                "unlimited query search",
              ]}
              className="mx-auto w-full max-w-md md:translate-y-[-6px]"
            />

            <PriceCard
              packageName="Enterprise"
              price={10}
              billingCycle="User"
              subtitle="For Large Team"
              features={[
                "> 150 Users",
                "no limit transactions",
                "unlimited query search",
              ]}
              className="mx-auto w-full max-w-sm"
            />
          </div>
        </section>
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
                Tentang Kami
              </h2>
              <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-700">
                <span className="text-[#01559A] font-bold">EASYFIX</span> adalah
                solusi bug resolution berbasis AI yang mengintegrasikan Machine
                Learning, dan Knowledge Graph untuk membantu developer menemukan
                informasi bug yang relevan, sehingga proses perbaikan bug dapat
                dilakukan dengan lebih cepat.​ Melalui dashboard interaktif,
                EASYFIX menampilkan graf visual dan informasi terkait bug,
                commit, serta developer yang berhubungan. Dengan memangkas waktu
                debugging, EASYFIX membantu organisasi menekan biaya,
                meningkatkan produktivitas, dan mempercepat siklus rilis
                perangkat lunak berkualitas tinggi.
              </p>
            </div>
            <div>
              <h2 className="font-bold tracking-tight text-[#01559A] text-2xl sm:text-4xl md:text-5xl leading-tight">
                Hubungi Kami
              </h2>
              <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-700">
                23524302@mahasiswa.itb.ac.id​ <br /> 
                23524304@mahasiswa.itb.ac.id​ <br />
                23524319@mahasiswa.itb.ac.id​
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
    </div>
  );
}
