import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_BASE_URL || // fallback kalau kamu pakai nama lain
  "http://localhost:8000"; // sesuaikan dengan BE-mu saat dev

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const org = searchParams.get("org");
  const proj = searchParams.get("proj");

  if (!org || !proj) {
    return NextResponse.json(
      { detail: "Missing org or proj parameter" },
      { status: 400 }
    );
  }
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated (no id_token cookie)" },
      { status: 401 }
    );
  }

  // contoh: BE path: /projects/{org}/{proj}/status
  // SESUAIKAN prefix router-nya (misal /projects, /onboarding, dll)
  const backendUrl = `${API_BASE}/api/${org}/${proj}/status`;

  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      // kalau auth pakai cookie/session, biasanya cukup forward default
      // kalau butuh Bearer token dari header/cookie, tambahkan di sini
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // kalau perlu
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { detail: data.detail || "Failed to fetch project status" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error calling backend project status:", err);
    return NextResponse.json(
      { detail: "Internal error when fetching project status" },
      { status: 500 }
    );
  }
}
