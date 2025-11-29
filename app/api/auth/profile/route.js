// app/api/auth/profile/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Contoh env:
// LOCAL:  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
// SERVER: NEXT_PUBLIC_API_BASE_URL=http://146.190.202.14/backend
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(
    /\/+$/,
    ""
  );

export async function PATCH(request) {
  try {
    const body = await request.json();

    // token dari cookie: id_token (sesuai yg ada di curl & cookie-mu)
    const cookieStore = cookies();
    const idToken = cookieStore.get("id_token")?.value;

    if (!idToken) {
      return NextResponse.json(
        { detail: "Unauthorized: missing id_token cookie" },
        { status: 401 }
      );
    }

    const payload = {
      display_name: body.display_name ?? null,
      photo_url: body.photo_url ?? null,
    };

    const url = `${API_BASE_URL}/auth/profile`;
    console.log("DEBUG /auth/profile URL:", url, "payload:", payload);

    const apiRes = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        Authorization: `Bearer ${idToken}`, // persis kaya curl
      },
      body: JSON.stringify(payload),
    });

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (err) {
    console.error("Error in /api/auth/profile PATCH:", err);
    return NextResponse.json(
      { detail: "Internal error calling profile API" },
      { status: 500 }
    );
  }
}
