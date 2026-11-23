import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      const me = await authApi.getCurrentSession();
      setSession(me);
      return me;
    } catch {
      setSession(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const login = useCallback(async (email, password) => {
    const me = await authApi.login(email, password);
    setSession(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (session) await authApi.logout(session.csrf_token);
    } finally {
      setSession(null);
    }
  }, [session]);

  const value = useMemo(() => ({
    session,
    loading,
    login,
    logout,
    restoreSession,
    hasPermission: (permission) => Boolean(session?.permissions?.includes(permission)),
  }), [session, loading, login, logout, restoreSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
