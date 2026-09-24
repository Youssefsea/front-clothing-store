// Central fetch-based API client.
// - Uses HTTP-only cookie authentication (credentials: "include")
// - Normalizes backend error shapes into ApiError
// - Never stores tokens in localStorage

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://backendclothes.vercel.app"
).replace(/\/+$/, "");

const DEFAULT_MESSAGES = {
  400: "The request you sent is missing required information.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to perform this action.",
  404: "We couldn't find what you were looking for.",
  409: "This account already exists. Try signing in instead.",
  429: "Too many requests. Please try again shortly.",
  500: "Something went wrong on our end. Please try again.",
};

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, details = [] } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.details = details;
  }
}

export function isApiError(error) {
  return error instanceof ApiError;
}

function defaultMessage(status) {
  return DEFAULT_MESSAGES[status] || "Something went wrong. Please try again.";
}

async function decodeResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeErrorData(data) {
  if (!data) return null;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return { message: data };
    }
  }
  return data;
}

function buildError(data, status) {
  const normalized = normalizeErrorData(data);
  const message =
    (normalized?.message && String(normalized.message)) ||
    (normalized?.error && String(normalized.error)) ||
    defaultMessage(status);
  return new ApiError(message, {
    status,
    data: normalized,
    details: Array.isArray(normalized?.details) ? normalized.details : [],
  });
}

export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    fields, // plain object -> JSON
    formData, // FormData -> multipart (browser sets boundary)
    query, // object -> search params
    headers: extraHeaders = {},
  } = options;

  const target = new URL(API_BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        target.searchParams.set(key, String(value));
      }
    });
  }

  const headers = { ...extraHeaders };
  if (fields && !formData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let requestBody;
  if (formData) {
    requestBody = formData;
  } else if (fields) {
    requestBody = JSON.stringify(fields);
  } else if (body) {
    requestBody = body;
  }

  let res;
  try {
    res = await fetch(target.toString(), {
      method,
      headers,
      body: requestBody,
      credentials: "include",
    });
  } catch (err) {
    throw new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      { status: 0 }
    );
  }

  const data = normalizeErrorData(await decodeResponse(res));

  if (!res.ok) {
    throw buildError(data, res.status);
  }

  return data;
}

export const api = {
  get: (path, query) => apiFetch(path, { method: "GET", query }),
  post: (path, fields) => apiFetch(path, { method: "POST", fields }),
  put: (path, fields) => apiFetch(path, { method: "PUT", fields }),
  del: (path, fields) => apiFetch(path, { method: "DELETE", fields }),
  form: (path, formData) => apiFetch(path, { method: "POST", formData }),
  fetch: (path, options) => apiFetch(path, options),
};

// Some documented backend routes (e.g. admin order lookup by user id) use a
// GET with a JSON body. Browsers reject a body on fetch(GET/...), so this one
// preserved contract goes through XMLHttpRequest, which still transmits it.
export function apiGetWithBody(path, fields) {
  const url = API_BASE_URL + path;

  if (typeof XMLHttpRequest === "undefined") {
    return apiFetch(path, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = xhr.responseText || null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(normalizeErrorData(data));
      } else {
        reject(buildError(data, xhr.status));
      }
    };
    xhr.onerror = () =>
      reject(
        new ApiError("Unable to reach the server. Check your connection.", {
          status: 0,
        })
      );
    xhr.send(JSON.stringify(fields ?? {}));
  });
}