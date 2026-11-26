const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

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

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = localStorage.getItem('nippia_refresh_token');
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const resp = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!resp.ok) {
        setAuthTokens(null, null);
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
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let resp = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (resp.status === 401 && localStorage.getItem('nippia_refresh_token')) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.Authorization = `Bearer ${newAccess}`;
      resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const json = (await resp.json().catch(() => ({}))) as {
    success?: boolean;
    data?: T;
    error?: { code?: string; message?: string; details?: unknown };
  };

  if (!resp.ok || !json.success) {
    throw new ApiError(
      resp.status,
      json.error?.message || 'Permintaan gagal diproses.',
      json.error?.code || 'REQUEST_FAILED',
      json.error?.details,
    );
  }

  return json.data as T;
}
