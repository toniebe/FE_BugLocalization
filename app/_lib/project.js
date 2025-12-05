async function handleJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text || "{}");
  } catch {
    return { raw: text };
  }
}

export async function uploadBugData(orgName, projectName, file) {


  const formData = new FormData();
  formData.append("file", file, file.name);

  const res = await fetch(
    `/api/projects/${encodeURIComponent(
      orgName
    )}/${encodeURIComponent(projectName)}/upload-bugs`,
    {
      method: "POST",
      body: formData,
      // kalau kamu pakai Bearer token, bisa forward di sini
      // headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await handleJson(res);

  if (!res.ok) {
    const msg = data.detail || data.message || "Failed to upload bug data";
    throw new Error(msg);
  }

  return data;
}

export async function createProject(organization_name, project_name) {
  const r = await fetch("/api/projects/create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ organization_name, project_name }),
  });
  const data = await r.json();
  if (!r.ok || !data.ok) {
    throw new Error(data.error || "Failed to create project");
  }
  return data;
}

export async function checkMlEnv(organizationName, projectName) {
  const params = new URLSearchParams({
    organization_name: organizationName,
    project_name: projectName,
  });

  const r = await fetch(`/api/projects/check-ml-env?${params.toString()}`, {
    method: "GET",
  });

  const data = await r.json();

  if (!r.ok || !data.ok) {
    throw new Error(data.error || "Failed to check environment");
  }

  return data;
}

export async function startMlEngine(organizationName, projectName) {
  const params = new URLSearchParams({
    organization_name: organizationName,
    project_name: projectName,
  });

  const r = await fetch(`/api/projects/start-ml?${params.toString()}`, {
    method: "POST",
  });

  const data = await r.json();
  if (!r.ok || !data.ok) {
    throw new Error(data.error || data.message || "Failed to start ML engine");
  }
  return data;
}

export async function getMlStatus(organizationName, projectName) {
  const params = new URLSearchParams({
    organization_name: organizationName,
    project_name: projectName,
  });

  const r = await fetch(`/api/projects/ml-status?${params.toString()}`, {
    method: "GET",
  });

  const data = await r.json();
  if (!r.ok || !data.ok) {
    throw new Error(data.error || "Failed to get ML status");
  }
  return data;
}
