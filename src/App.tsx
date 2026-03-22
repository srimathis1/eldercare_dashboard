import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import VoiceAssistant from "./pages/VoiceAssistant";
import SmartHealth from "./pages/SmartHealth";
import Appointments from "./pages/Appointments";
import Medications from "./pages/Medications";
import PatientProfile from "./pages/PatientProfile";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState<"login" | "signup">("login");

  // Handle pending patient creation for caregiver signup
  useEffect(() => {
    if (user && user.role === "caregiver") {
      const pending = sessionStorage.getItem("pending_patient");
      if (pending) {
        sessionStorage.removeItem("pending_patient");
        const patient = JSON.parse(pending);
        supabase.from("patients").insert({
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          caregiver_id: user.id,
        }).then(({ error }) => {
          if (error) console.error("Failed to create patient:", error);
        });
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return authPage === "login"
      ? <Login onSwitchToSignup={() => setAuthPage("signup")} />
      : <Signup onSwitchToLogin={() => setAuthPage("login")} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/voice-assistant" element={<VoiceAssistant />} />
          <Route path="/smart-health" element={<SmartHealth />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/patient-profile" element={<PatientProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
