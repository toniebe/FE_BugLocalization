import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function PATCH(req) {
  const token = req.cookies.get("id_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await apiFetch("/auth/profile", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return NextResponse.json(data);
}