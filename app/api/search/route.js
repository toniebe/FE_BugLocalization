// app/api/search/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req) {
  const body = await req.json().catch(() => ({}));

  const q = body.q || body.query || "";
  const limit = body.limit ?? 25;
  const dev_limit = body.dev_limit ?? 10;

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query `q` minimal 2 karakter" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const upstream = `${API_BASE}/search`; // <-- TANPA query string

  const r = await fetch(upstream, {
    method: "POST",           // <-- ini yang bikin FastAPI nerima POST
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      query: q,               // <-- Cocok dengan SearchRequest.query
      limit: Number(limit),
      dev_limit: Number(dev_limit),
    }),
  });

  let data = null;
  try {
    data = await r.json();
  } catch (e) {
    // noop
  }

  if (!r.ok) {
    return NextResponse.json(
      {
        error: "UPSTREAM_ERROR",
        detail: data?.detail || data || r.statusText,
      },
      { status: r.status }
    );
  }

  return NextResponse.json(data);
}
