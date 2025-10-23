const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(path, init = {}) {
  const { asJson = true, ...rest } = init;
  const headers = {
    ...(asJson ? { "content-type": "application/json" } : {}),
    ...(rest.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers, cache: "no-store" });

  let data = null;
  let text = null;
  try {
    data = await res.clone().json();
  } catch {
    try { text = await res.text(); } catch {}
  }

  if (!res.ok) {
    const detail = data?.detail || data?.error || text || `API ${res.status}`;
    const err = new Error(detail);
    err.status = res.status;
    err.upstream = { data, text };
    throw err;
  }
  return data ?? (text ? { text } : null);
}
