import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function POST(req) {
  const body = await req.json(); // { id_token? }
  const idToken = body?.id_token || req.cookies.get("id_token")?.value;
  if (!idToken) return NextResponse.json({ error: "No token" }, { status: 400 });

  const data = await apiFetch("/auth/verify-token", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
  return NextResponse.json(data);
}
