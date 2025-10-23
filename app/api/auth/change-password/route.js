import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function POST(req) {
  const token = req.cookies.get("id_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json(); // { new_password }
  const data = await apiFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ id_token: token, new_password: body.new_password }),
  });

  const res = NextResponse.json({ ok: true, data });
  res.cookies.set("id_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("refresh_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
