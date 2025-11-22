// app/api/projects/create/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiFetch } from "@/app/_lib/fetcher";


export async function POST(req) {
  try {
    const body = await req.json();
    const cookieStore = cookies();
    const idToken = cookieStore.get("id_token")?.value;

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const data = await apiFetch("/api/createProjects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("Create project error (route):", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Failed to create project",
      },
      { status: 400 }
    );
  }
}
