// app/api/user-projects/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Missing email query param" },
      { status: 400 }
    );
  }

  // Next 15: cookies() harus di-await
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated (no id_token cookie)" },
      { status: 401 }
    );
  }

  // Pakai base URL API yang benar, support 2 nama env:
  const baseApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!baseApiUrl) {
    console.error(
      "user-projects error: NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_API_URL tidak diset"
    );
    return NextResponse.json(
      { ok: false, error: "API base URL not configured" },
      { status: 500 }
    );
  }

  // buang trailing slash kalau ada, lalu tambahkan path
  const normalizedBase = baseApiUrl.replace(/\/+$/, "");
  const apiUrl = `${normalizedBase}/user/projects/?email=${encodeURIComponent(
    email
  )}`;

  async function fetchWithRetry(attempt = 1) {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      // optional, supaya selalu fresh:
      // cache: "no-store",
    });

    if (res.ok) return res;

    let text = "";
    try {
      text = await res.text();
    } catch {
      text = "";
    }

    const isTooEarly =
      text.includes("Token used too early") ||
      text.includes("used before allowed");

    // kalau errornya "Token used too early" dan ini attempt pertama -> tunggu, retry sekali
    if (isTooEarly && attempt === 1) {
      await new Promise((r) => setTimeout(r, 1200)); // 1,2 detik
      return fetchWithRetry(2);
    }

    // kalau bukan error itu atau sudah pernah retry → lempar error
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  try {
    const upstreamRes = await fetchWithRetry();
    const data = await upstreamRes.json();
    // lempar balik apa adanya dari BE (status ikut upstream)
    return NextResponse.json(data, { status: upstreamRes.status });
  } catch (err) {
    console.error("user-projects error:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
