// app/api/delete-organization/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const organization_name = searchParams.get("organization_name");

    if (!organization_name) {
      return NextResponse.json(
        { detail: "organization_name is required" },
        { status: 400 }
      );
    }

    const backendUrl = `${API_BASE_URL}/api/organizations/deleteOrganization?organization_name=${encodeURIComponent(
      organization_name
    )}`;

    const headers = new Headers();
    const reqHeaders = req.headers;

    const auth = reqHeaders.get("authorization");
    if (auth) {
      headers.set("authorization", auth);
    }

    headers.set("accept", "application/json");
    const cookieStore = await cookies();
    const token = cookieStore.get("id_token")?.value;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const backendRes = await fetch(backendUrl, {
      method: "DELETE",
      headers,
    });

    const data = await backendRes.json().catch(() => ({}));

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[DELETE /api/delete-organization] error:", err);
    return NextResponse.json(
      { detail: "Internal error on delete-organization" },
      { status: 500 }
    );
  }
}
