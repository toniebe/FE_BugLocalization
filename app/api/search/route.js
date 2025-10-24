import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = searchParams.get("limit") || "25";
  const dev_limit = searchParams.get("dev_limit") || "10";

  if (q.length < 2) {
    return NextResponse.json({ error: "BAD_REQUEST", detail: "Query `q` minimal 2 karakter" }, { status: 400 });
  }

  const upstreamUrl = `${API_BASE.replace(/\/+$/,"")}/search?` +
    new URLSearchParams({ q, limit, dev_limit }).toString();

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);

  try {
    const r = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: ctrl.signal,
    });
    clearTimeout(t);

    // coba json, fallback ke text
    let body = null, text = null;
    try { body = await r.clone().json(); } catch {}
    if (!body) { try { text = await r.text(); } catch {} }

    if (!r.ok) {
      return NextResponse.json(
        {
          error: "UPSTREAM_ERROR",
          status: r.status,
          detail: body?.detail || body?.error || text || r.statusText,
          upstreamUrl,
        },
        { status: r.status }
      );
    }

    return NextResponse.json(body ?? { text });
  } catch (e) {
    clearTimeout(t);
    const isTimeout = e?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_FETCH_FAILED",
        detail: isTimeout ? "Upstream timeout (15s)" : (e?.message || String(e)),
        upstreamUrl,
      },
      { status: 504 }
    );
  }
}
