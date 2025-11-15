// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function POST(req) {
  try {
    const body = await req.json();

    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    // SESUAIKAN FIELD DENGAN RESPONSE DARI FASTAPI
    // Kalau FastAPI mengembalikan id_token, refresh_token, expires_in, local_id, email
    const res = NextResponse.json({
      ok: true,
      uid: data.local_id ?? data.uid,
      email: data.email,
    });

    const maxAge = data.expires_in
      ? parseInt(data.expires_in, 10)
      : 3600;

    const isProd = process.env.NODE_ENV === "production";

    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge,
    };

    // Perhatikan nama field
    res.cookies.set("id_token", data.id_token ?? data.idToken, cookieOpts);

    if (data.refresh_token ?? data.refreshToken) {
      res.cookies.set("refresh_token", data.refresh_token ?? data.refreshToken, {
        ...cookieOpts,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (err) {
    console.error("Login error (route):", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Login failed",
      },
      { status: 400 }
    );
  }
}
