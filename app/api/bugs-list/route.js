// app/api/bugs-list/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const organization_name = searchParams.get("organization_name");
  const project_name = searchParams.get("project_name");
  const limit = searchParams.get("limit") ?? "20";
  const offset = searchParams.get("offset") ?? "0";

  if (!organization_name || !project_name) {
    return NextResponse.json(
      { detail: "organization_name and project_name are required" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("id_token")?.value;

  const qs = new URLSearchParams({
    organization_name,
    project_name,
    limit,
    offset,
  });

  const res = await fetch(`${API_BASE}/api/bug/?${qs.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
