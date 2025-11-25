// app/api/bugs/add/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function POST(req) {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.json(
      { error: "Not authenticated (no id_token cookie)" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const organization =
    searchParams.get("organization") || searchParams.get("organization_name");
  const project =
    searchParams.get("project") || searchParams.get("project_name");

  if (!organization || !project) {
    return NextResponse.json(
      { error: "organization & project are required in query" },
      { status: 400 }
    );
  }

  // Body dari FE
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON payload from FE" },
      { status: 400 }
    );
  }

  console.log("[ADD BUG] body from FE:", body);
  console.log("[ADD BUG] org/project:", organization, project);

  const url = `${BACKEND_BASE}/api/bug/${encodeURIComponent(
    organization
  )}/${encodeURIComponent(project)}/addNewBug`;

  try {
    const backendRes = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = backendRes.headers.get("content-type") || "";
    const raw = contentType.includes("application/json")
      ? await backendRes.json()
      : await backendRes.text();

    console.log("[ADD BUG] backend status:", backendRes.status);
    console.log("[ADD BUG] backend raw:", raw);

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: "Backend returned error",
          status: backendRes.status,
          detail: raw,
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(raw, { status: 201 });
  } catch (e) {
    console.error("[ADD BUG] fetch to backend failed:", e);
    return NextResponse.json(
      { error: "Failed to call backend addNewBug", message: e.message },
      { status: 500 }
    );
  }
}
