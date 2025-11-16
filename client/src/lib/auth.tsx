import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

interface User {
  id: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  setSession: (user: User, sessionId: string) => void;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      fetchUser(storedSessionId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (sid: string) => {
    try {
      const response = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${sid}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("sessionId");
        setSessionId(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/signin", { email, password });
    const data = await res.json();
    
    if (!data.sessionId) {
      throw new Error("Invalid credentials");
    }
    
    setUser(data.user);
    setSessionId(data.sessionId);
    localStorage.setItem("sessionId", data.sessionId);
  };

  const setSession = (userData: User, sid: string) => {
    setUser(userData);
    setSessionId(sid);
    localStorage.setItem("sessionId", sid);
  };

  const signout = async () => {
    if (sessionId) {
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        });
      } catch (error) {
        console.error("Signout error:", error);
      }
    }
    
    setUser(null);
    setSessionId(null);
    localStorage.removeItem("sessionId");
  };

  return (
    <AuthContext.Provider value={{ user, sessionId, isLoading, signin, setSession, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
