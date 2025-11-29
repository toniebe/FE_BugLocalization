import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Ganti domain di bawah dengan domain kamu
const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || "http://146.190.202.14/";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "EasyFix – AI Bug Resolution & Bug Localization Assistant",
  description:
    "EasyFix adalah AI bug resolution & bug localization assistant untuk developer. Temukan solusi bug lebih cepat dari Bugzilla, GitHub, dan repository kode Anda.",
  keywords: [
    // Brand & umum
    "EasyFix",
    "EasyFix cloud",
    "EasyFix app",
    "EasyFix bug resolution",
    "EasyFix bug localization",
    "aplikasi EasyFix",

    // ITB & tugas kuliah
    "EasyFix ITB",
    "aplikasi bug resolusi ITB",
    "aplikasi bug resolution ITB",
    "aplikasi bug localization ITB",
    "aplikasi bug untuk tugas kuliah ITB",
    "EasyFix kelompok 3 ITB",
    "proyek kelompok 3 ITB EasyFix",
    "aplikasi tugas kuliah informatika ITB",
    "aplikasi tugas kuliah teknik informatika ITB",

    // Fungsi produk
    "aplikasi bug resolution",
    "aplikasi bug resolusi",
    "aplikasi bug localization",
    "alat debugging untuk developer",
    "alat debugging untuk mahasiswa",
    "bug resolution assistant",
    "bug localization assistant",
    "AI bug resolution",
    "AI bug localization",

    // Teknis / niche
    "bug knowledge graph",
    "bug knowledge graph EasyFix",
    "Neo4j bug graph",
    "aplikasi analisis bug",
    "tool pencari solusi bug",
  ],
  openGraph: {
    title: "EasyFix – AI Bug Resolution & Bug Localization Assistant",
    description:
      "Percepat bug resolution dengan EasyFix. AI assistant yang membangun bug knowledge graph dari repository dan bug tracker.",
    url: BASE_URL,
    siteName: "EasyFix",
    images: [
      {
        url: "/easyfix-logo.png", // siapkan image ini di /public
        width: 1200,
        height: 630,
        alt: "EasyFix – AI Bug Resolution Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
