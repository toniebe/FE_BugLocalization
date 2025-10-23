import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function POST(req) {
  const body = await req.json();
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body), // { email, password }
  });

  const res = NextResponse.json({ ok: true, uid: data.uid, email: data.email });
  const maxAge = data.expiresIn ? parseInt(data.expiresIn, 10) : 3600;

  res.cookies.set("id_token", data.idToken, {
    httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge,
  });

  if (data.refreshToken) {
    res.cookies.set("refresh_token", data.refreshToken, {
      httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60*60*24*30,
    });
  }
  return res;
}
