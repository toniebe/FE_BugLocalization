// app/api/bugs/[bugId]/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";
import { cookies } from "next/headers";

export async function GET(_req, { params }) {
  const { bugId } = params;
  const cookieStore = cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const data = await apiFetch(`/bugs/${bugId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Bug detail error:", err);

    const status = err?.status || 500;
    const msg = err?.message || "Failed to fetch bug detail";

    return NextResponse.json(
      { error: msg },
      { status }
    );
  }
}
