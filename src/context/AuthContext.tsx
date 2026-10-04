// ============================================================================
// IRONFORGE - Admin Authentication Context
// Manages real admin authentication against Supabase via the Express server.
// Sessions live strictly within the continuous open tab session; reloading
// or reopening the browser requires the admin to enter their password again.
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

export const AUTH_TOKEN_KEY = 'ironforge_session_token';
export const AUTH_REFRESH_TOKEN_KEY = 'ironforge_refresh_token';
export const AUTH_USER_KEY = 'ironforge_admin_user';
export const AUTH_EXPIRES_AT_KEY = 'ironforge_token_expires_at';

// Clear any leftover tokens immediately on startup so a fresh load always starts unauthenticated
try {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
} catch {
  // ignore
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredSession(session: {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  adminName?: string;
  adminEmail?: string;
}) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
    if (session.refreshToken) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, session.refreshToken);
    }
    if (session.expiresIn) {
      const expiresAt = Date.now() + session.expiresIn * 1000;
      localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
    }
    if (session.adminName || session.adminEmail) {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify({
          name: session.adminName || parsed.name || 'Gym Administrator',
          email: session.adminEmail || parsed.email || '',
        })
      );
    }
  } catch {
    // ignore
  }
}

export function clearStoredTokens() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  } catch {
    // ignore
  }
}

export function clearStoredSession() {
  clearStoredTokens();
  // Note: AUTH_USER_KEY is kept so remembered admin email remains pre-filled on login screen
}

interface AuthContextType {
  isAuthenticated: boolean;
  adminName: string;
  adminEmail: string;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (params: {
    gymName: string;
    gymAddress?: string;
    gymPhone?: string;
    email: string;
    password: string;
    superAdminSecret?: string;
  }) => Promise<{ requireEmailConfirmation?: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fresh page load always starts unauthenticated; admin must enter password
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const refreshTimerRef = useRef<any>(null);

  const [adminName, setAdminName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.name || 'Gym Administrator';
      }
    } catch {
      // ignore
    }
    return 'Gym Administrator';
  });

  const [adminEmail, setAdminEmail] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.email || '';
      }
    } catch {
      // ignore
    }
    return '';
  });

  useEffect(() => {
    setIsAuthenticated(Boolean(token));
  }, [token]);

  // Clear stored tokens when browser tab or window is closed or navigated away
  useEffect(() => {
    const handleUnloadOrHide = () => {
      clearStoredTokens();
    };

    window.addEventListener('beforeunload', handleUnloadOrHide);
    window.addEventListener('pagehide', handleUnloadOrHide);

    return () => {
      window.removeEventListener('beforeunload', handleUnloadOrHide);
      window.removeEventListener('pagehide', handleUnloadOrHide);
    };
  }, []);

  const scheduleSilentRefresh = (expiresInSeconds?: number) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    let delayMs = 50 * 60 * 1000; // default 50 mins (for standard 1h token)
    if (expiresInSeconds && expiresInSeconds > 0) {
      // Refresh 5 minutes (300s) before expiry, or at 85% of lifetime if shorter
      const leadTimeSeconds = Math.min(300, Math.floor(expiresInSeconds * 0.15));
      delayMs = Math.max(10000, (expiresInSeconds - leadTimeSeconds) * 1000);
    } else {
      const storedExpiresAt = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
      if (storedExpiresAt) {
        const remainingMs = Number(storedExpiresAt) - Date.now() - 5 * 60 * 1000;
        delayMs = Math.max(10000, remainingMs);
      }
    }

    refreshTimerRef.current = setTimeout(async () => {
      await refreshSession();
    }, delayMs);
  };

  const refreshSession = async (): Promise<boolean> => {
    const curRefreshToken = getRefreshToken();
    if (!curRefreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: curRefreshToken }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
        }
        return false;
      }

      const data = await response.json();
      if (!data.accessToken) {
        return false;
      }

      setToken(data.accessToken);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }

      setStoredSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || curRefreshToken,
        expiresIn: data.expiresIn,
      });

      scheduleSilentRefresh(data.expiresIn);
      return true;
    } catch (err) {
      console.warn('Silent refresh error:', err);
      // Retry in 30 seconds on network hiccup
      scheduleSilentRefresh(30);
      return false;
    }
  };

  // Listen for refresh or force logout events from apiFetch
  useEffect(() => {
    const handleRefreshed = (e: any) => {
      if (e.detail?.token) {
        setToken(e.detail.token);
        if (e.detail.refreshToken) {
          setRefreshToken(e.detail.refreshToken);
        }
        scheduleSilentRefresh(e.detail.expiresIn);
      }
    };

    const handleForceLogout = () => {
      logout();
    };

    window.addEventListener('ironforge-token-refreshed' as any, handleRefreshed);
    window.addEventListener('ironforge-force-logout' as any, handleForceLogout);
    return () => {
      window.removeEventListener('ironforge-token-refreshed' as any, handleRefreshed);
      window.removeEventListener('ironforge-force-logout' as any, handleForceLogout);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Invalid email or password');
      }

      const data = await response.json();
      if (!data.accessToken) {
        throw new Error('Authentication failed: no access token returned');
      }

      setToken(data.accessToken);
      setRefreshToken(data.refreshToken || null);
      setAdminName(data.adminName || 'Gym Administrator');
      setAdminEmail(data.adminEmail || email.trim());
      setIsAuthenticated(true);

      setStoredSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        adminName: data.adminName,
        adminEmail: data.adminEmail || email.trim(),
      });

      scheduleSilentRefresh(data.expiresIn);

      return true;
    } catch (err: any) {
      console.error('Login error:', err.message);
      throw err;
    }
  };

  const signup = async (params: {
    gymName: string;
    gymAddress?: string;
    gymPhone?: string;
    email: string;
    password: string;
  }): Promise<{ requireEmailConfirmation?: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create gym account');
      }

      const data = await response.json();

      if (data.requireEmailConfirmation) {
        return {
          requireEmailConfirmation: true,
          message: data.message || 'Please check your email to confirm your account.',
        };
      }

      if (!data.accessToken) {
        throw new Error('Registration succeeded but no access token was returned');
      }

      setToken(data.accessToken);
      setRefreshToken(data.refreshToken || null);
      setAdminName(data.adminName || params.gymName);
      setAdminEmail(data.adminEmail || params.email.trim());
      setIsAuthenticated(true);

      setStoredSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        adminName: data.adminName || params.gymName,
        adminEmail: data.adminEmail || params.email.trim(),
      });

      scheduleSilentRefresh(data.expiresIn);

      return { requireEmailConfirmation: false };
    } catch (err: any) {
      console.error('Signup error:', err.message);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      setToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      clearStoredTokens();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        adminName,
        adminEmail,
        token,
        refreshToken,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
