import { NextResponse } from "next/server";
import { apiFetch } from "@/app/_lib/fetcher";

export async function POST(req) {
  const body = await req.json();
  const data = await apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      display_name: body.display_name ?? null,
    }),
  });
  return NextResponse.json(data);
}
