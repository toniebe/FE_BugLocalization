// app/api/ltr/[organization]/[project]/recommended-developers/ltr/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://easyfix.cloud/backend";

export async function POST(req, { params }) {
  const { organization, project } = params;

  const url = new URL(req.url);
  const topK = url.searchParams.get("top_k") || "5";

  // Ambil token dari cookie (sesuai pola login EasyFix)
  const cookieStore = cookies();
  const token = cookieStore.get("id_token")?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated (no token in cookies)" },
      { status: 401 }
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const summary = payload?.summary?.trim();
  // component dari FE sengaja di-override jadi string kosong
  const component = "";

  if (!summary) {
    return NextResponse.json(
      { ok: false, error: "Summary is required" },
      { status: 400 }
    );
  }

  const backendUrl = `${API_BASE}/api/ltr/${encodeURIComponent(
    organization
  )}/${encodeURIComponent(
    project
  )}/recommended-developers/ltr?top_k=${encodeURIComponent(topK)}`;

  try {
    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        summary,
        component, // selalu "" sesuai permintaan
      }),
    });

    const data = await backendRes.json().catch(() => null);

    // Teruskan status & payload dari backend ke FE
    return NextResponse.json(
      data || {
        ok: false,
        error: "Empty response from backend",
      },
      { status: backendRes.status }
    );
  } catch (err) {
    console.error("Error calling backend LTR (summary):", err);
    return NextResponse.json(
      { ok: false, error: "Failed to call backend LTR (summary)" },
      { status: 500 }
    );
  }
}
