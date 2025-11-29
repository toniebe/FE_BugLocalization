// app/api/auth/change-password/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

export async function POST(request) {
  try {
    const body = await request.json();

    const cookieStore = cookies();
    const idToken = cookieStore.get("id_token")?.value;

    if (!idToken) {
      return NextResponse.json(
        { detail: "Unauthorized: missing id_token cookie" },
        { status: 401 }
      );
    }

    if (!body?.new_password || !body?.current_password) {
      return NextResponse.json(
        { detail: "current_password and new_password are required" },
        { status: 400 }
      );
    }

    const payload = {
      id_token: idToken,
      new_password: body.new_password,
      current_password: body.current_password, // <--- PENTING
    };

    const apiRes = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (err) {
    console.error("Error in /api/auth/change-password POST:", err);
    return NextResponse.json(
      { detail: "Internal error calling change-password API" },
      { status: 500 }
    );
  }
}
