import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function POST(req) {
  try {
    const body = await req.json();
    const payload = {
      email: (body?.email || "").trim(),
      password: body?.password || "",
      display_name: body?.display_name ?? null,
    };

    if (!payload.email || !payload.password) {
      return NextResponse.json(
        { error: "BAD_REQUEST", detail: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }
    if (payload.password.length < 6) {
      return NextResponse.json(
        { error: "BAD_REQUEST", detail: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }


    const data = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data); 
  } catch (e) {
    const status = e?.status || 500;
    const detail = e?.message || "SIGNUP_FAILED";


    const code =
      status === 409 ? "EMAIL_EXISTS" :
      status === 400 ? "BAD_REQUEST" :
      "UPSTREAM_ERROR";

    return NextResponse.json(
      { error: code, detail, ...(e?.upstream ? { upstream: e.upstream } : {}) },
      { status }
    );
  }
}
