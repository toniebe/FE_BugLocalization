// app/api/project-members/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req) {
  const body = await req.json();
  const { org_id, project_id, email, role } = body || {};

  if (!org_id || !project_id || !email) {
    return NextResponse.json(
      { detail: "org_id, project_id, and email are required" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.json(
      { detail: "Not authenticated (no id_token cookie)" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(
      `${BASE_URL}/api/${encodeURIComponent(
        org_id
      )}/${encodeURIComponent(project_id)}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email, role:role }),
      }
    );

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {
      data = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        data || { detail: "Failed to add member" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in /api/project-members:", err);
    return NextResponse.json(
      { detail: "Internal error in /api/project-members" },
      { status: 500 }
    );
  }
}
