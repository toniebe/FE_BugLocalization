import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_EASYFIX_API_BASE_URL ||
  process.env.EASYFIX_API_BASE_URL ||
  "http://localhost:8000"; // sesuaikan sama base URL FastAPI kamu

export async function GET(req, { params }) {
  const { organization, project } = params;

  if (!organization || !project) {
    return NextResponse.json(
      { detail: "organization & project are required" },
      { status: 400 }
    );
  }

    const cookieStore = cookies();
    const idToken = cookieStore.get("id_token")?.value;

  const backendUrl = `${API_BASE}/api/${encodeURIComponent(
    organization
  )}/${encodeURIComponent(project)}`;

  try {
    const authHeader = req.headers.get("authorization");

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${idToken}`,
      },
      // jangan cache, biar selalu fresh
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          detail:
            data?.detail ||
            data?.error ||
            `Failed to fetch project members (${res.status})`,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Error proxying project-members:", err);
    return NextResponse.json(
      { detail: "Internal error while fetching project members" },
      { status: 500 }
    );
  }
}