import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type UserRole = "doctor" | "caregiver";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  caregiver_id: string | null;
  caregiver_email: string | null;
  doctor_id: string | null;
  phone: string | null;
  address: string | null;
  blood_type: string | null;
  emergency_contact: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isDoctor: boolean;
  patients: Patient[];
  selectedPatient: Patient | null;
  selectPatient: (patient: Patient | null) => void;
  refreshPatients: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return { id: data.id, name: data.name, email: data.email, role: data.role as UserRole };
}

async function fetchPatients(userId: string, role: UserRole): Promise<Patient[]> {
  const column = role === "doctor" ? "doctor_id" : "caregiver_id";
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq(column, userId);

  if (error || !data) return [];
  return data as Patient[];
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const loadPatients = useCallback(async (profile: UserProfile) => {
    const pts = await fetchPatients(profile.id, profile.role);
    setPatients(pts);
    if (profile.role === "caregiver" && pts.length > 0) {
      setSelectedPatient(pts[0]);
    }
  }, []);

  const refreshPatients = useCallback(async () => {
    if (user) await loadPatients(user);
  }, [user, loadPatients]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(async () => {
          const profile = await fetchProfile(newSession.user.id);
          setUser(profile);
          if (profile) await loadPatients(profile);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setPatients([]);
        setSelectedPatient(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        const profile = await fetchProfile(existingSession.user.id);
        setUser(profile);
        if (profile) await loadPatients(profile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadPatients]);

  // Realtime subscription on patients table
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("patients-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "patients" }, () => {
        if (user) loadPatients(user);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadPatients]);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!name.trim() || !trimmedEmail || !password) return { success: false, error: "All fields are required" };
    if (password.length < 6) return { success: false, error: "Password must be at least 6 characters" };

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { name: name.trim(), role } },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: "Signup failed" };
    return { success: true };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail || !password) return { success: false, error: "Email and password are required" };

    const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setPatients([]);
    setSelectedPatient(null);
  }, []);

  const selectPatient = useCallback((patient: Patient | null) => {
    setSelectedPatient(patient);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, session, loading, login, signup, logout,
      isDoctor: user?.role === "doctor",
      patients, selectedPatient, selectPatient, refreshPatients,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
