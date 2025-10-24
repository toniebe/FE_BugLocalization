// app/_lib/fetcher.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(path, init = {}) {
  const { asJson = true, ...rest } = init;
  const headers = {
    ...(asJson && rest.body ? { "content-type": "application/json" } : {}),
    ...(rest.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers, cache: "no-store" });
  if (res.status === 204) return null;

  let data = null;
  let text = null;
  try { data = await res.clone().json(); } catch { try { text = await res.text(); } catch {} }

  if (!res.ok) {
    const detail = data?.detail || data?.error || text || `API ${res.status}`;
    const err = new Error(detail);
    err.status = res.status;
    err.upstream = { data, text };
    throw err;
  }
  return data ?? (text ? { text } : null);
}


export function apiGet(path, params = {}, init = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)])
  ).toString();
  const url = qs ? `${path}?${qs}` : path;
  return apiFetch(url, { ...init, method: "GET" });
}
