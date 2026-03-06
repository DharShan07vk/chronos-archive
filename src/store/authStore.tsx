import React, { createContext, useContext, useState, useCallback } from "react";
import { URI } from "../api/api";
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

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(URI + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 200) {
        const data = await res.json();
        console.log("[auth] login response body:", data); 
        const jwt: string =
          data?.data?.token ??
          data?.data?.accessToken ??
          data?.token ??
          data?.accessToken ??
          data?.access_token ??
          data?.jwt ??
          "";
        if (!jwt) {
          toast.error("Login succeeded but no token received. Check backend response in console.");
          return false;
        }
        localStorage.setItem("token", jwt);
        setToken(jwt);
        setIsLoggedIn(true);
        setUserEmail(email);
        localStorage.setItem("userEmail", email);
        return true;
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        toast.error("Invalid email or password");
        return false;
      }
    } catch {
      toast.error("Network error. Please try again.");
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch(URI + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      console.log(res);
      if (res.status === 200 || res.status === 201) {
        const data = await res.json();
        console.log("[auth] register response body:", data); // debug — remove once confirmed working
        const jwt: string =
          data?.data?.token ??
          data?.data?.accessToken ??
          data?.token ??
          data?.accessToken ??
          data?.access_token ??
          data?.jwt ??
          "";
        if (!jwt) {
          toast.error("Registration succeeded but no token received. Check backend response in console.");
          return false;
        }
        localStorage.setItem("token", jwt);
        setToken(jwt);
        setIsLoggedIn(true);
        setUserEmail(email);
        localStorage.setItem("userEmail", email);
        return true;
      } else if (res.status === 409) {
        toast.error("An account with this email already exists.");
        return false;
      } else {
        toast.error("Registration failed. Please try again.");
        return false;
      }
    } catch {
      toast.error("Network error. Please try again.");
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
