import { API_URL } from "@/lib/constants";
import { ApiError, type ApiErrorPayload } from "@/types/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text) as unknown; } catch { return { message: text }; }
}

function friendlyMessage(status: number, payload: unknown) {
  const message = typeof payload === "object" && payload !== null && "message" in payload ? String((payload as { message?: unknown }).message ?? "") : "";
  if (message) return message;
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not found";
  if (status === 409) return "Conflict";
  if (status === 422) return "Validation failed";
  if (status === 429) return "Too many requests";
  return "Request failed";
}

function xhrGetWithBody(url: string, body: string, headers: HeadersInit, signal?: AbortSignal): Promise<{ response: Response; data: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.withCredentials = true;
    const headerEntries = Object.entries(headers);
    headerEntries.forEach(([key, value]) => xhr.setRequestHeader(key, String(value)));
    const onAbort = () => { xhr.abort(); reject(new DOMException("Aborted", "AbortError")); };
    signal?.addEventListener("abort", onAbort, { once: true });
    xhr.onload = async () => {
      signal?.removeEventListener("abort", onAbort);
      const headersObj = new Headers();
      xhr.getAllResponseHeaders().trim().split(/\r?\n/).forEach((line) => {
        const index = line.indexOf(":");
        if (index > 0) headersObj.set(line.slice(0,index).trim(), line.slice(index+1).trim());
      });
      const response = new Response(xhr.responseText, { status: xhr.status, headers: headersObj });
      resolve({ response, data: await parseResponse(response) });
    };
    xhr.onerror = () => reject(new TypeError("Network request failed"));
    xhr.ontimeout = () => reject(new TypeError("Request timed out"));
    xhr.timeout = 20000;
    xhr.send(body);
  });
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) throw new ApiError("API URL is not configured.", 0);
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  if (!options.formData) headers.set("Accept", "application/json");
  let body: BodyInit | undefined;
  if (options.formData) body = options.formData;
  else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  let response: Response;
  let data: unknown;
  try {
    if (method === "GET" && options.body !== undefined) {
      const result = await xhrGetWithBody(API_URL + path, JSON.stringify(options.body), headers, options.signal);
      response = result.response;
      data = result.data;
    } else {
      response = await fetch(API_URL + path, { method, headers, body, credentials: "include", signal: options.signal, cache: "no-store" });
      data = await parseResponse(response);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Network error", 0);
  }

  if (!response.ok) {
    throw new ApiError(friendlyMessage(response.status, data), response.status, (typeof data === "object" && data !== null ? data as ApiErrorPayload : undefined));
  }
  return data as T;
}
