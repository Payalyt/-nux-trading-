/**
 * Safe API Client for Quotex Platform
 * Ensures all requests and responses are strictly parsed with JSON validation,
 * proper Content-Type headers, error interception, and graceful failure handling.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Retrieve the current authentication JWT token from document cookies or localStorage
 */
export function getStoredAuthToken(): string | null {
  if (typeof document !== 'undefined') {
    const tokenFromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('qx_token='))
      ?.split('=')[1];
    if (tokenFromCookie) return tokenFromCookie;
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const userSession = localStorage.getItem('qx_user_session');
      if (userSession) {
        const parsed = JSON.parse(userSession);
        if (parsed.token) return parsed.token;
      }
    } catch {}
  }

  return null;
}

/**
 * Universal safe fetch function that guarantees no Unexpected Token crashes
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredAuthToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    let parsedData: any = null;
    let errorText = '';

    if (contentType.includes('application/json')) {
      try {
        parsedData = await response.json();
      } catch (jsonErr: any) {
        console.warn(`[apiClient] JSON parsing error on ${url}:`, jsonErr);
        errorText = 'Invalid JSON response from server';
      }
    } else {
      // Non-JSON response (e.g. HTML error page or plain text)
      try {
        const rawText = await response.text();
        if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
          errorText = `Server returned an unexpected HTML response (${response.status})`;
        } else {
          errorText = rawText || `Server returned HTTP ${response.status}`;
        }
      } catch {
        errorText = `Server returned HTTP ${response.status}`;
      }
    }

    if (!response.ok) {
      const serverErrorMessage = parsedData?.error || parsedData?.message || errorText || `Request failed with status ${response.status}`;
      return {
        ok: false,
        status: response.status,
        data: parsedData,
        error: serverErrorMessage,
        message: serverErrorMessage,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsedData as T,
      message: parsedData?.message,
    };
  } catch (netErr: any) {
    console.error(`[apiClient] Network request failed on ${url}:`, netErr);
    const message = netErr?.message || 'Network connection error. Please try again.';
    return {
      ok: false,
      status: 0,
      error: message,
      message,
    };
  }
}

export const apiClient = {
  get: <T = any>(url: string, headers?: Record<string, string>) =>
    safeFetchJson<T>(url, { method: 'GET', headers }),

  post: <T = any>(url: string, body?: any, headers?: Record<string, string>) =>
    safeFetchJson<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  put: <T = any>(url: string, body?: any, headers?: Record<string, string>) =>
    safeFetchJson<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  delete: <T = any>(url: string, headers?: Record<string, string>) =>
    safeFetchJson<T>(url, { method: 'DELETE', headers }),
};
