// app/api/ltr/[organization]/[project]/train/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:8000/api";

export async function POST(req, { params }) {
  const { organization, project } = params || {};

  if (!organization || !project) {
    return NextResponse.json(
      { ok: false, error: "organization/project is required" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const forceRetrain = searchParams.get("force_retrain") ?? "false";

  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;
  if (!idToken) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated (no id_token cookie)" },
      { status: 401 }
    );
  }

  const url = `${API_BASE_URL}/api/ltr/${encodeURIComponent(
    organization
  )}/${encodeURIComponent(project)}/train?force_retrain=${forceRetrain}`;

  try {
    const backendRes = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: "",
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.detail || "Failed to train LTR model",
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("Error proxying LTR train:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
