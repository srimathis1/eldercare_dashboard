import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type UserRole = "doctor" | "caregiver";

interface User {
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isDoctor: boolean;
}

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string; name: string }> = {
  doctor: { email: "doctor@eldercare.com", password: "doctor123", name: "Dr. Sarah Williams" },
  caregiver: { email: "caregiver@eldercare.com", password: "caregiver123", name: "Jane Cooper" },
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string, role: UserRole): boolean => {
    const cred = DEMO_CREDENTIALS[role];
    if (cred.email === email.toLowerCase().trim() && cred.password === password) {
      setUser({ email: cred.email, role, name: cred.name });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isDoctor: user?.role === "doctor" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
