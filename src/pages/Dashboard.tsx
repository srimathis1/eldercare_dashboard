import { Calendar, Pill, Users, AlertTriangle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">Caregiver</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
            <p className="text-3xl font-bold mt-1">0</p>
            <p className="text-xs text-muted-foreground mt-1">Next: Today 2:00 PM</p>
          </div>
          <Calendar className="w-10 h-10 text-primary opacity-60" />
        </div>
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Active Medications</p>
            <p className="text-3xl font-bold mt-1">5</p>
            <p className="text-xs text-muted-foreground mt-1">2 due today</p>
          </div>
          <Pill className="w-10 h-10 text-primary opacity-60" />
        </div>
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Patients</p>
            <p className="text-3xl font-bold mt-1">2</p>
            <p className="text-xs text-muted-foreground mt-1">Active care plans</p>
          </div>
          <Users className="w-10 h-10 text-primary opacity-60" />
        </div>
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Pending Alerts</p>
            <p className="text-3xl font-bold mt-1">2</p>
            <p className="text-xs text-muted-foreground mt-1">Medication reminders</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-warning opacity-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="eldercare-card">
          <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">02:00 PM</p>
              <p className="font-medium">Margaret Johnson</p>
              <p className="text-sm text-muted-foreground">Routine Checkup</p>
            </div>
          </div>
        </div>

        <div className="eldercare-card">
          <h2 className="text-lg font-semibold mb-4">Medication Reminders</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Lisinopril</span>
                </div>
                <span className="font-semibold">10mg</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">Dosage: 10mg</p>
              <p className="text-sm text-muted-foreground ml-6">Take with food</p>
              <div className="flex justify-between text-sm mt-2 ml-6">
                <span className="text-muted-foreground">Times:</span>
                <span className="font-medium">08:00, 20:00</span>
              </div>
              <div className="flex justify-between text-sm ml-6">
                <span className="text-muted-foreground">Next dose:</span>
                <span className="text-primary font-medium">8:00 PM</span>
              </div>
              <div className="flex justify-between text-sm ml-6 mb-2">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="text-success font-medium">25 pills</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
