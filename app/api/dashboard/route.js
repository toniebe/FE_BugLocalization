// app/api/dashboard/route.js
import { cookies } from "next/headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const organization = searchParams.get("organization");
  const project = searchParams.get("project");

  if (!organization || !project) {
    return new Response(
      JSON.stringify({
        error: "organization and project query params are required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const cookieStore = cookies();
  const idToken = cookieStore.get("id_token")?.value;

  const backendUrl = `${API_BASE}/dashboard/?organization=${encodeURIComponent(
    organization
  )}&project=${encodeURIComponent(project)}`;

  const headers = {
    Accept: "application/json",
  };
  if (idToken) {
    headers.Authorization = `Bearer ${idToken}`;
  }

  const res = await fetch(backendUrl, {
    method: "GET",
    headers,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
