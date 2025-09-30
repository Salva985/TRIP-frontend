// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { client } from "../api/client"; // adjust path if needed

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, username, fullName, email, dob }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load once from localStorage
  useEffect(() => {
    try {
      const t = localStorage.getItem("auth_token");
      const u = localStorage.getItem("auth_user");
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // --- API calls ---
  async function login(email, password) {
    const data = await client("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    // { token, user }
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    return data.user;
  }

  async function register({ username, fullName, email, dob, password }) {
    const data = await client("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, fullName, email, dob, password }),
    });
    if (data.token && data.user) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    }
    return data.user;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  // Context value
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthed: !!token,
    }),
    [user, token, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}