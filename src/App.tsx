import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { user } = useAuth();

  if (!user) return <Login />;

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
