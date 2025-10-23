import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function GET(req) {
  const token = req.cookies.get("id_token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const me = await apiFetch("/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return NextResponse.json(me);
}