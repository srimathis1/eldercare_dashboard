import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
          <span className="text-sm text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{user?.name}</span>
            <span className="ml-1 capitalize">({user?.role})</span>
          </span>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={logout}>
            <LogOut className="w-4 h-4" />
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
