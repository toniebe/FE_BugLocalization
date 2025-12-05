import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "";

export async function POST(req, { params }) {
  const { orgId, projectId } = params;

  if (!API_BASE) {
    return NextResponse.json(
      { error: "API_BASE_URL is not configured" },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!file) {
    return NextResponse.json(
      { error: "File is required (field name: file)" },
      { status: 400 }
    );
  }


  const backendForm = new FormData();
  backendForm.append("file", file, file.name);

  const cookieStore = cookies();
  const idToken = cookieStore.get("id_token")?.value;

  const backendRes = await fetch(
    `${API_BASE}/api/${encodeURIComponent(orgId)}/${encodeURIComponent(
      projectId
    )}/upload-datacollection`,
    {
      method: "POST",
      body: backendForm,
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  const text = await backendRes.text();
  let data;
  try {
    data = JSON.parse(text || "{}");
  } catch {
    data = { raw: text };
  }

  return NextResponse.json(data, { status: backendRes.status });
}
