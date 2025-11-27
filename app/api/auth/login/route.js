import { apiFetch } from "@/app/_lib/fetcher";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const res = NextResponse.json({
      ok: true,
      uid: data.local_id ?? data.uid,
      email: data.email,
      organization_name: data.organization_name ?? null,
      project_name: data.project_name ?? null,
    });

    const maxAge = data.expires_in ? parseInt(data.expires_in, 10) : 3600;

    const cookieSecure =
      process.env.COOKIE_SECURE === "true" ||
      (process.env.NODE_ENV === "production" &&
        process.env.FORCE_HTTPS === "true");

    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax",
      secure: cookieSecure,
      path: "/",
      maxAge,
    };

    res.cookies.set("id_token", data.id_token ?? data.idToken, cookieOpts);

    if (data.refresh_token ?? data.refreshToken) {
      res.cookies.set(
        "refresh_token",
        data.refresh_token ?? data.refreshToken,
        {
          ...cookieOpts,
          maxAge: 60 * 60 * 24 * 30,
        }
      );
    }

    if (data.organization_name) {
      res.cookies.set("org_name", data.organization_name, cookieOpts);
    }
    if (data.project_name) {
      res.cookies.set("project_name", data.project_name, cookieOpts);
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
