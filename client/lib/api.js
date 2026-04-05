const API_BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("fd_token");
}

export function setStoredToken(token) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem("fd_token", token);
  else sessionStorage.removeItem("fd_token");
}

/**
 * JSON fetch with optional Bearer token from sessionStorage.
 */
export async function api(path, options = {}) {
  const { skipAuth, body, headers: hdrs, ...rest } = options;
  const headers = new Headers(hdrs || {});
  if (!headers.has("Content-Type") && body && typeof body === "object" && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = skipAuth ? null : getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body:
      body instanceof FormData
        ? body
        : body && typeof body === "object"
          ? JSON.stringify(body)
          : body,
    credentials: "include",
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || "Invalid response" };
  }

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
