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

  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated (no id_token cookie)" },
      { status: 401 }
    );
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/projects/?email=${encodeURIComponent(
    email
  )}`;

  

  async function fetchWithRetry(attempt = 1) {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    // kalau ok langsung return
    if (res.ok) return res;

    const text = await res.text();

    const isTooEarly =
      text.includes("Token used too early") ||
      text.includes("used before allowed");

    // kalau errornya "Token used too early" dan ini attempt pertama -> tunggu, retry sekali
    if (isTooEarly && attempt === 1) {
      await new Promise((r) => setTimeout(r, 1200)); // 1,2 detik
      return fetchWithRetry(2);
    }

    // kalau bukan error itu, atau sudah pernah retry → lempar error
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  try {
    const res = await fetchWithRetry();
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("user-projects error:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
