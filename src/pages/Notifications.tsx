import { Pill, Calendar, AlertTriangle, Check, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type NotificationType = "all" | "medications" | "appointments" | "alerts";

const initialNotifications = [
  {
    id: 1,
    type: "medications" as const,
    title: "Medication Reminder",
    description: "Time to take Lisinopril 10mg",
    time: "30 minutes ago",
    priority: "high",
    read: false,
    icon: Pill,
  },
  {
    id: 2,
    type: "appointments" as const,
    title: "Upcoming Appointment",
    description: "Routine checkup with Dr. Sarah Williams tomorrow at 2:00 PM",
    time: "1 hour ago",
    priority: "medium",
    read: false,
    icon: Calendar,
  },
  {
    id: 3,
    type: "alerts" as const,
    title: "Low Medication Stock",
    description: "Metformin stock is running low. Only 5 doses remaining.",
    time: "2 hours ago",
    priority: "high",
    read: false,
    icon: AlertTriangle,
  },
  {
    id: 4,
    type: "medications" as const,
    title: "Medication Taken",
    description: "Margaret Johnson confirmed taking Metformin at 12:00 PM",
    time: "3 hours ago",
    priority: "low",
    read: true,
    icon: Pill,
  },
  {
    id: 5,
    type: "appointments" as const,
    title: "Appointment Completed",
    description: "Blood work appointment completed successfully",
    time: "Yesterday",
    priority: "low",
    read: true,
    icon: Calendar,
  },
];

const priorityClass: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-success text-success-foreground",
};

const Notifications = () => {
  const [filter, setFilter] = useState<NotificationType>("all");
  const [notifications, setNotifications] = useState(initialNotifications);

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const filters: { key: NotificationType; label: string; icon: typeof Filter }[] = [
    { key: "all", label: "All", icon: Filter },
    { key: "medications", label: "Medications", icon: Pill },
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "alerts", label: "Alerts", icon: AlertTriangle },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={markAllRead}>
            <Check className="w-4 h-4" />
            Mark All Read
          </Button>
          <Button variant="outline" className="gap-2" onClick={clearAll}>
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setFilter(key)}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              className={`eldercare-card flex items-start gap-4 ${!notif.read ? "border-l-[3px] border-l-primary" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{notif.title}</h3>
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{notif.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${priorityClass[notif.priority]}`}>
                  {notif.priority}
                </span>
                {!notif.read && (
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() =>
                      setNotifications((prev) =>
                        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                      )
                    }
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No notifications</div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
