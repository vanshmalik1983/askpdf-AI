/**
 * Thin fetch wrapper around the AskPDF AI backend.
 *
 * Every call attaches the access token if present. On a 401 (expired
 * access token) it tries exactly one silent refresh via /auth/refresh
 * before giving up and forcing a re-login — this mirrors the backend's
 * short-access/rotating-refresh design instead of re-implementing auth
 * rules on the client.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function getTokens() {
  return {
    accessToken: localStorage.getItem("askpdf_access_token"),
    refreshToken: localStorage.getItem("askpdf_refresh_token"),
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("askpdf_access_token", accessToken);
  localStorage.setItem("askpdf_refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("askpdf_access_token");
  localStorage.removeItem("askpdf_refresh_token");
}

async function tryRefresh(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    setTokens(json.data.accessToken, json.data.refreshToken);
    return json.data.accessToken as string;
  } catch {
    return null;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  isForm?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { auth = true, isForm = false, headers, ...rest } = options;
  const { accessToken } = getTokens();

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  if (!isForm) finalHeaders["Content-Type"] = "application/json";
  if (auth && accessToken) finalHeaders["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers: finalHeaders });

  if (res.status === 401 && auth && !isRetry) {
    const newToken = await tryRefresh();
    if (newToken) return request<T>(path, options, true);
    clearTokens();
    window.location.href = "/login";
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new ApiError(res.status, json.message || "Something went wrong", json.error);
  }

  return json.data as T;
}

export const api = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: { id: string; name: string; email: string }; accessToken: string; refreshToken: string }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data), auth: false }
    ),

  login: (data: { email: string; password: string }) =>
    request<{ user: { id: string; name: string; email: string }; accessToken: string; refreshToken: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data), auth: false }
    ),

  logout: () => request<null>("/auth/logout", { method: "POST" }),

  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ id: string; originalName: string; status: string }>("/documents", {
      method: "POST",
      body: form,
      isForm: true,
    });
  },

  listDocuments: (page = 1, limit = 12) =>
    request<{ items: DocumentItem[]; total: number; page: number; limit: number }>(
      `/documents?page=${page}&limit=${limit}`
    ),

  getDocumentStatus: (id: string) =>
    request<{ id: string; status: DocumentItem["status"]; pageCount: number; chunkCount: number; failureReason?: string }>(
      `/documents/${id}/status`
    ),

  deleteDocument: (id: string) => request<null>(`/documents/${id}`, { method: "DELETE" }),

  askQuestion: (documentId: string, question: string) =>
    request<ChatMessage>(`/chat/${documentId}/ask`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),

  requestSummary: (documentId: string) =>
    request<{ status: string }>(`/summary/${documentId}`, { method: "POST" }),

  getSummary: (documentId: string) => request<SummaryData>(`/summary/${documentId}`),

  getDocumentHistory: (documentId: string, page = 1, limit = 20) =>
    request<ChatMessage[]>(`/history/${documentId}?page=${page}&limit=${limit}`),

  getAllHistory: (page = 1, limit = 20) =>
    request<(ChatMessage & { document: { _id: string; originalName: string } })[]>(
      `/history?page=${page}&limit=${limit}`
    ),
};

export interface DocumentItem {
  _id: string;
  originalName: string;
  status: "uploaded" | "queued" | "processing" | "ready" | "failed";
  pageCount: number;
  chunkCount: number;
  fileSizeBytes: number;
  failureReason?: string;
  createdAt: string;
}

export interface Citation {
  pageNumber: number;
  snippet: string;
  score: number;
}

export interface ChatMessage {
  _id: string;
  question: string;
  answer: string;
  citations: Citation[];
  confidenceScore: number;
  isFallback: boolean;
  createdAt: string;
}

export interface SummaryData {
  status: "pending" | "ready" | "failed";
  overallSummary?: string;
  pageSummaries?: { pageNumber: number; summary: string }[];
}
