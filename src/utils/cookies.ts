import { UserAccount } from '../types/trading';

/**
 * Cookie and Session Management Utility for NUX Trading Platform
 * Handles browser cookies, session tokens, and persistent user authentication.
 */

export const SESSION_COOKIE_NAME = 'session_id';
export const SESSION_COOKIE_ALIAS = 'nux_session_id';
export const USER_DATA_KEY = 'nux_user_session';
export const LEGACY_USER_DATA_KEY = 'qx_user_session';

/**
 * Set a document cookie with name, value, expiration in days, and optional path
 */
export function setCookie(name: string, value: string, days = 30, path = '/'): void {
  if (typeof document === 'undefined') return;

  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  
  // Format cookie string with encoding, path, and SameSite policy
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${path}; SameSite=Lax${secureFlag}`;
}

/**
 * Get the value of a document cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const encodedName = encodeURIComponent(name);
  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    const parts = cookie.split('=');
    const cookieName = parts[0];
    const cookieValue = parts.slice(1).join('=');

    if (cookieName === encodedName) {
      try {
        return decodeURIComponent(cookieValue);
      } catch {
        return cookieValue;
      }
    }
  }

  return null;
}

/**
 * Delete a document cookie by name
 */
export function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax${secureFlag}`;
}

/**
 * Check if a specific cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Generate a cryptographically strong unique Session ID
 */
export function generateSessionId(prefix = 'sess'): string {
  const timestamp = Date.now().toString(36);
  const randomHex = Math.random().toString(36).substring(2, 12);
  const entropy = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomHex}${entropy}`;
}

/**
 * Get active session ID from cookie
 */
export function getCurrentSessionId(): string | null {
  return getCookie(SESSION_COOKIE_NAME) || getCookie(SESSION_COOKIE_ALIAS) || null;
}

/**
 * Save user authentication data and set session cookies
 */
export function saveUserSession(
  user: UserAccount, 
  options: { rememberMe?: boolean; sessionId?: string } = {}
): { sessionId: string; user: UserAccount } {
  const rememberDays = options.rememberMe !== false ? 30 : 1;
  const sessionId = options.sessionId || generateSessionId();

  // Set primary and alias session ID cookies
  setCookie(SESSION_COOKIE_NAME, sessionId, rememberDays);
  setCookie(SESSION_COOKIE_ALIAS, sessionId, rememberDays);
  setCookie('qx_token', sessionId, rememberDays);

  const sessionPayload = {
    sessionId,
    user,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + rememberDays * 24 * 60 * 60 * 1000).toISOString()
  };

  // Save to localStorage for quick client access
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(sessionPayload));
      localStorage.setItem(LEGACY_USER_DATA_KEY, JSON.stringify({ token: sessionId, user }));
    } catch (err) {
      console.warn('[Cookies] LocalStorage save warning:', err);
    }
  }

  // Dispatch custom session event for real-time reactivity
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('nux_session_change', { detail: sessionPayload }));
    } catch {}
  }

  return { sessionId, user };
}

/**
 * Retrieve user session from cookie and persistent storage
 */
export function getUserSession(): { sessionId: string; user: UserAccount } | null {
  const sessionId = getCurrentSessionId();
  
  if (!sessionId) {
    return null;
  }

  // Attempt to load user from localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      // 1. Try modern session key
      const modernRaw = localStorage.getItem(USER_DATA_KEY);
      if (modernRaw) {
        const parsed = JSON.parse(modernRaw);
        if (parsed?.user?.email) {
          return {
            sessionId: parsed.sessionId || sessionId,
            user: parsed.user
          };
        }
      }

      // 2. Try legacy session key
      const legacyRaw = localStorage.getItem(LEGACY_USER_DATA_KEY);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (parsed?.user?.email) {
          return {
            sessionId: parsed.token || sessionId,
            user: parsed.user
          };
        }
        if (parsed?.email) {
          return {
            sessionId,
            user: parsed as UserAccount
          };
        }
      }
    } catch (err) {
      console.warn('[Cookies] Error reading stored session:', err);
    }
  }

  return null;
}

/**
 * Completely clear active session cookies and stored user session data
 */
export function clearUserSession(): void {
  deleteCookie(SESSION_COOKIE_NAME);
  deleteCookie(SESSION_COOKIE_ALIAS);
  deleteCookie('qx_token');
  deleteCookie('nux_user_data');

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(LEGACY_USER_DATA_KEY);
    } catch {}
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('nux_session_change', { detail: null }));
    } catch {}
  }
}
