const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(path, init = {}) {
  const { asJson = true, ...rest } = init;
  const headers = {
    ...(asJson ? { "content-type": "application/json" } : {}),
    ...(rest.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    cache: "no-store",
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    throw new Error((data && data.detail) || `API ${res.status}`);
  }
  return data;
}
