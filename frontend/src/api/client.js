// Single place that talks to the FastAPI backend.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new Error("Cannot reach the API. Is the backend running on " + BASE + "?");
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail))
        detail = body.detail.map((d) => `${d.loc?.slice(1).join(".")}: ${d.msg}`).join("; ");
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export const getHealth = () => request("/health");
export const getDashboard = () => request("/dashboard");
export const getModels = () => request("/models");

export const predictOne = (features) =>
  request("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });

export const predictBatch = (file) => {
  const form = new FormData();
  form.append("file", file);
  return request("/predict/batch", { method: "POST", body: form });
};
