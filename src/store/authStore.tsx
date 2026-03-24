import React, { createContext, useContext, useState, useCallback } from "react";
import { ApiRequestError, apiRequest } from "../api/api";
import { toast } from "sonner";

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem("userEmail"));

  const extractJwt = (data: unknown): string => {
    const payload = data as Record<string, unknown> | null;
    return (
      (payload?.token as string) ??
      (payload?.accessToken as string) ??
      (payload?.access_token as string) ??
      (payload?.jwt as string) ??
      ""
    );
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiRequest<Record<string, unknown>>(
        "/auth/login",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
        { withAuth: false }
      );

      const jwt = extractJwt(data);
      if (!jwt) {
        toast.error("Login succeeded but no token received.");
        setIsLoggedIn(false);
        setUserEmail(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        return false;
      }

      localStorage.setItem("token", jwt);
      setToken(jwt);
      setIsLoggedIn(true);
      setUserEmail(email);
      localStorage.setItem("userEmail", email);
      return true;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.code === "INVALID_CREDENTIALS") {
          toast.error(error.message || "Invalid email or password.");
        } else {
          toast.error(error.message || "Login failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
      setIsLoggedIn(false);
      setUserEmail(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const data = await apiRequest<Record<string, unknown>>(
        "/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        },
        { withAuth: false }
      );

      const jwt = extractJwt(data);
      if (!jwt) {
        toast.error("Registration succeeded but no token received.");
        return false;
      }

      localStorage.setItem("token", jwt);
      setToken(jwt);
      setIsLoggedIn(true);
      setUserEmail(email);
      localStorage.setItem("userEmail", email);
      return true;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.code === "USER_ALREADY_EXISTS") {
          toast.error(error.message || "This email is already registered. Please log in.");
        } else {
          toast.error(error.message || "Registration failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
