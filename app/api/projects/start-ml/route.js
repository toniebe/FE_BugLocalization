import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiFetch } from "@/app/_lib/fetcher";


export async function POST(req) {
  try {
    const cookieStore = cookies();
    const idToken = cookieStore.get("id_token")?.value;

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const organization_name = searchParams.get("organization_name");
    const project_name = searchParams.get("project_name");

    if (!organization_name || !project_name) {
      return NextResponse.json(
        { ok: false, error: "Missing organization_name or project_name" },
        { status: 400 }
      );
    }

    const qs = `?organization_name=${encodeURIComponent(
      organization_name
    )}&project_name=${encodeURIComponent(project_name)}`;

    // Panggil FastAPI: POST /projects/start-ml
    const data = await apiFetch(`/api/projects/start-ml${qs}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    // data = payload dari FastAPI (status, message, org_slug, dll)
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("start-ml error (route):", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Failed to start ML engine",
      },
      { status: 400 }
    );
  }
}
