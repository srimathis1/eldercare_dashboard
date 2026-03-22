import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, User } from "lucide-react";
import { useState } from "react";

const AppLayout = () => {
  const { user, logout, selectedPatient, isDoctor } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-semibold text-foreground">{user?.name}</span>
              <span className="ml-1 capitalize">({user?.role})</span>
            </span>
            {selectedPatient && (
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1.5">
                <User className="w-3 h-3" />
                Patient: {selectedPatient.name}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Logout
          </Button>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
