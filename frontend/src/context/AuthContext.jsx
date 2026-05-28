import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, login as loginApi } from "../api/authApi";
import { getRoleRedirectPath } from "../config/roleRedirects";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { data } = await loginApi(credentials);
      persistAuth(data.user);
      return data.user;
    },
    [persistAuth]
  );

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token) {
      setLoading(false);
      return;
    }

    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }

    try {
      const { data } = await getMe();
      const refreshedUser = data.user;
      const merged = { ...JSON.parse(stored || "{}"), ...refreshedUser };
      
      // Crucial: Update BOTH the user object and the standalone token key
      localStorage.setItem("user", JSON.stringify(merged));
      if (refreshedUser.token) {
        localStorage.setItem("token", refreshedUser.token);
      }
      
      setUser(merged);
    } catch (err) {
      // Only logout on 401/403 or specific auth errors
      // Prevent logging out on transient network errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      persistAuth,
      isAuthenticated: !!user,
      getRoleRedirectPath,
    }),
    [user, loading, login, logout, persistAuth]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
