import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiFetch } from "@/app/_lib/fetcher";


export async function GET(req) {
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

    const data = await apiFetch(`/api/projects/ml-status${qs}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });


    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("ml-status error (route):", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Failed to get ML status",
      },
      { status: 400 }
    );
  }
}
