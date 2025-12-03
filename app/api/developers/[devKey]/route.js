import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
  const { devKey } = params;
  const cookieStore = cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }


  const { searchParams } = new URL(req.url);
  const org = searchParams.get("organization_name") || "";
  const proj = searchParams.get("project_name") || "";

  if (!org || !proj) {
    return NextResponse.json(
      { error: "organization_name & project_name are required" },
      { status: 400 }
    );
  }

  try {
    const data = await apiFetch(
      `/api/developers/{organization}/{project}/${encodeURIComponent(devKey)}?organization_name=${encodeURIComponent(
        org
      )}&project_name=${encodeURIComponent(proj)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error("Developer detail error:", err);

    const status = err?.status || 500;
    const msg = err?.message || "Failed to fetch developer detail";

    return NextResponse.json({ error: msg }, { status });
  }
}
