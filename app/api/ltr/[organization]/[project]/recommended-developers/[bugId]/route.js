// app/api/ltr/[organization]/[project]/recommended-developers/[bugId]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000/api";

export async function GET(req, { params }) {
  const { organization, project, bugId } = params || {};

  if (!organization || !project || !bugId) {
    return NextResponse.json(
      { ok: false, error: "organization/project/bugId is required" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const topK = searchParams.get("top_k") ?? "5";

  const idToken = cookies().get("id_token")?.value;
  if (!idToken) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated (no id_token cookie)" },
      { status: 401 }
    );
  }

  const url = `${API_BASE_URL}/api/ltr/${encodeURIComponent(
    organization
  )}/${encodeURIComponent(
    project
  )}/recommended-developers/${encodeURIComponent(
    bugId
  )}?top_k=${encodeURIComponent(topK)}`;

  try {
    const backendRes = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.detail || "Failed to fetch recommended developers",
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("Error proxying LTR recommend:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
