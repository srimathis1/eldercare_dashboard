import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export type UserRole = "doctor" | "caregiver";

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  isDoctor: boolean;
}

const USERS_KEY = "eldercare_users";
const SESSION_KEY = "eldercare_session";

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: User | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getSession());

  useEffect(() => {
    saveSession(user);
  }, [user]);

  const signup = useCallback((name: string, email: string, password: string, role: UserRole) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!name.trim() || !trimmedEmail || !password) {
      return { success: false, error: "All fields are required" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address" };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const users = getStoredUsers();
    if (users.some(u => u.email === trimmedEmail)) {
      return { success: false, error: "An account with this email already exists" };
    }

    const newUser: StoredUser = { name: name.trim(), email: trimmedEmail, password, role };
    saveStoredUsers([...users, newUser]);

    const sessionUser: User = { name: newUser.name, email: newUser.email, role: newUser.role };
    setUser(sessionUser);
    return { success: true };
  }, []);

  const login = useCallback((email: string, password: string) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail || !password) {
      return { success: false, error: "Email and password are required" };
    }

    const users = getStoredUsers();
    const found = users.find(u => u.email === trimmedEmail && u.password === password);
    if (!found) {
      return { success: false, error: "Invalid email or password" };
    }

    const sessionUser: User = { name: found.name, email: found.email, role: found.role };
    setUser(sessionUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isDoctor: user?.role === "doctor" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
