const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function request(path, { csrfToken, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (csrfToken) headers.set("X-CSRF-Token", csrfToken);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
  } catch {
    throw new ApiError("Cannot reach the backend. Make sure it is running on port 8000.", 0, "backend_unavailable");
  }

  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      body.message || body.detail?.message || `Request failed (${response.status})`,
      response.status,
      body.code || body.detail?.code,
      body.details || body.detail?.details,
    );
  }
  return body;
}

export const apiBase = API_BASE;
