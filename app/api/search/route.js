import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = searchParams.get("limit") || "25";
  const dev_limit = searchParams.get("dev_limit") || "10";

  if (q.length < 2) {
    return NextResponse.json({ error: "Query `q` minimal 2 karakter" }, { status: 400 });
  }

  const upstream = `${API_BASE}/search?` + new URLSearchParams({ q, limit, dev_limit }).toString();
  const r = await fetch(upstream, { cache: "no-store" });

  let data = null;
  try { data = await r.json(); } catch {}

  if (!r.ok) {
    return NextResponse.json(
      { error: "UPSTREAM_ERROR", detail: data?.detail || data || r.statusText },
      { status: r.status }
    );
  }

  return NextResponse.json(data);
}
