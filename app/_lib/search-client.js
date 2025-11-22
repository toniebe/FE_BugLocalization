async function safeJSON(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function request(url, init = {}, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      cache: "no-store",
      ...init,
      signal: ctrl.signal,
    });
  } catch (e) {
    clearTimeout(t);
    if (e?.name === "AbortError") {
      const err = new Error("Request timeout");
      err.name = "AbortError";
      throw err;
    }
    throw new Error(e?.message || "Network error");
  }

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


export async function searchBugs({
  q,
  limit = 25,
  dev_limit = 10,
  organization,
  project,
  signal,
} = {}) {
  return request(
    "/api/search",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        q,
        limit,
        dev_limit,
        organization,
        project,
      }),
      signal,
    },
    { timeoutMs: 15000 }
  );
}