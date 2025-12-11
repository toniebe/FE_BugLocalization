import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const organization = searchParams.get("organization");
  const project = searchParams.get("project");

  if (!organization || !project) {
    return NextResponse.json(
      { error: "Missing organization or project query parameters" },
      { status: 400 }
    );
  }

  const url = `${BACKEND_URL}/ml/lda/evaluate?organization=${encodeURIComponent(
    organization
  )}&project=${encodeURIComponent(project)}`;

  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  let backendRes;
  try {
    backendRes = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      cache: "no-store",
    });
  } catch (err) {
    console.error("Error calling LDA backend:", err);
    return NextResponse.json(
      { error: "Failed to reach LDA backend" },
      { status: 502 }
    );
  }

  const data = await backendRes.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendRes.status });
}
