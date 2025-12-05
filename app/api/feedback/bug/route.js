// app/api/feedback/bug/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE =
  process.env.EASYFIX_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export async function POST(request) {
  try {
    const body = await request.json();

    const { organization, project, bug_id, topic_id, query, is_relevant } =
      body || {};

    if (
      !organization ||
      !project ||
      !bug_id ||
      typeof is_relevant !== "boolean"
    ) {
      return NextResponse.json(
        {
          detail: "organization, project, bug_id, dan is_relevant wajib diisi",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("id_token")?.value;

    const backendUrl = `${API_BASE}/${encodeURIComponent(
      organization
    )}/${encodeURIComponent(project)}/feedback/bug`;

    const backendRes = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        organization,
        project,
        bug_id,
        topic_id,
        query,
        is_relevant,
      }),
    });

    const json = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(json || { detail: "Backend error" }, {
        status: backendRes.status,
      });
    }

    return NextResponse.json(json, { status: 201 });
  } catch (err) {
    console.error("Feedback proxy error:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
