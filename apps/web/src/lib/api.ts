import { webEnv } from './env';

const API_BASE = webEnv.apiUrl;
const DEFAULT_TIMEOUT_MS = 25_000;

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let accessTokenMemory: string | null = localStorage.getItem('nippia_access_token');
let refreshPromise: Promise<string | null> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export function setAuthTokens(access: string | null, refresh?: string | null) {
  accessTokenMemory = access;
  if (access) localStorage.setItem('nippia_access_token', access);
  else localStorage.removeItem('nippia_access_token');

  if (refresh !== undefined) {
    if (refresh) localStorage.setItem('nippia_refresh_token', refresh);
    else localStorage.removeItem('nippia_refresh_token');
  }
}

export function getAccessToken() {
  return accessTokenMemory || localStorage.getItem('nippia_access_token');
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const externalSignal = options.signal;
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(408, 'Permintaan ke server melebihi batas waktu. Periksa koneksi Anda.', 'REQUEST_TIMEOUT');
    }
    throw new ApiError(
      0,
      'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
      'NETWORK_ERROR',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = localStorage.getItem('nippia_refresh_token');
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const resp = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!resp.ok) {
        setAuthTokens(null, null);
        unauthorizedHandler?.();
        return null;
      }
      const json = (await resp.json()) as {
        success: boolean;
        data?: { accessToken: string; refreshToken: string };
      };
      if (json.success && json.data) {
        setAuthTokens(json.data.accessToken, json.data.refreshToken);
        return json.data.accessToken;
      }
      setAuthTokens(null, null);
      unauthorizedHandler?.();
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs, ...fetchInit } = options;
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchInit.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let resp = await fetchWithTimeout(`${API_BASE}${path}`, { ...fetchInit, headers }, timeoutMs);

  const isPublicAuthPath =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register') ||
    path.startsWith('/auth/google') ||
    path.startsWith('/auth/refresh');

  if (resp.status === 401 && !isPublicAuthPath) {
    if (localStorage.getItem('nippia_refresh_token')) {
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        headers.Authorization = `Bearer ${newAccess}`;
        resp = await fetchWithTimeout(`${API_BASE}${path}`, { ...fetchInit, headers }, timeoutMs);
      }
    } else if (token) {
      setAuthTokens(null, null);
      unauthorizedHandler?.();
    }
  }

  const json = (await resp.json().catch(() => ({}))) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string; details?: unknown };
  };

  if (!resp.ok || !json.success) {
    if (resp.status === 401 && !isPublicAuthPath && token) {
      setAuthTokens(null, null);
      unauthorizedHandler?.();
    }
    throw new ApiError(
      resp.status,
      json.error?.message || 'Permintaan gagal diproses.',
      json.error?.code || 'REQUEST_FAILED',
      json.error?.details,
    );
  }

  return json.data as T;
}
