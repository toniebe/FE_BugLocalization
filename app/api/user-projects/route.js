import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ detail: "email is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;
  if (!idToken) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated (no id_token cookie)" },
      { status: 401 }
    );
  }

  const res = await fetch(
    `${BASE_URL}/user/projects/${encodeURIComponent(email)}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // kalau perlu
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    let j = {};
    try {
      j = await res.json();
    } catch (e) {}
    return NextResponse.json(j || { detail: "Failed to fetch projects" }, {
      status: res.status,
    });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
