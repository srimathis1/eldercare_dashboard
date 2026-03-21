import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Phone,
  Brain,
  Calendar,
  Pill,
  User,
  Bell,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/voice-assistant", label: "Voice Assistant", icon: Phone },
  { to: "/smart-health", label: "Smart Health", icon: Brain },
  { to: "/appointments", label: "Appointments", icon: Calendar },
  { to: "/medications", label: "Medications", icon: Pill },
  { to: "/patient-profile", label: "Patient Profile", icon: User },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-border flex flex-col py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center border-2 border-primary">
          <span className="text-sm font-bold text-primary">E</span>
        </div>
        <span className="text-lg font-semibold text-foreground">ElderCare</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-muted text-foreground font-semibold"
                  : "text-primary hover:bg-muted"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
