import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function POST(req) {
  const body = await req.json(); // { email }
  const enc = encodeURIComponent(body.email);
  const data = await apiFetch(`/auth/send-password-reset?email=${enc}`, {
    method: "POST",
  });
  return NextResponse.json(data);
}
