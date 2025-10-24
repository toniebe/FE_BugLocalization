async function safeJSON(res) {
  try { return await res.json(); } catch { return null; }
}

async function request(url, init = {}, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const res = await fetch(url, { cache: "no-store", ...init, signal: ctrl.signal })
    .catch((e) => {
      clearTimeout(t);
      throw new Error(e?.name === "AbortError" ? "Request timeout" : (e?.message || "Network error"));
    });
  clearTimeout(t);
  const body = await safeJSON(res);
  if (!res.ok) {
    const msg = body?.detail || body?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}


export async function searchBugs({ q, limit = 25, dev_limit = 10 }) {
  const qs = new URLSearchParams({
    q,
    limit: String(limit),
    dev_limit: String(dev_limit),
  }).toString();
  return request(`/api/search?${qs}`, { method: "GET" });
}
