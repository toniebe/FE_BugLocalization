export async function signup(email, password, displayName) {
  const r = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Signup failed");
  return r.json();
}

export async function login(email, password) {
  const r = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Login failed");
  return r.json();
}


export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function me() {
  const r = await fetch("/api/auth/me", { method: "GET", cache: "no-store" });
  if (r.status === 401) return null;
  if (!r.ok) throw new Error("Failed to fetch me");
  return r.json();
}

export async function updateProfile(patch) {
  const r = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("Update profile failed");
  return r.json();
}

export async function changePassword(newPassword) {
  const r = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!r.ok) throw new Error("Change password failed");
  return r.json();
}

export async function sendPasswordReset(email) {
  const r = await fetch("/api/auth/send-password-reset", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }), // BFF akan mengubah ke query param
  });
  if (!r.ok) throw new Error("Send reset failed");
  return r.json();
}
