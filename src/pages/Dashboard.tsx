import { Calendar, Pill, Users, AlertTriangle, Clock, Activity, TrendingUp, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const medications = [
  { name: "Lisinopril", dosage: "10mg", instructions: "Take with food", times: "08:00, 20:00", nextDose: "8:00 PM", remaining: 25, total: 30, taken: false },
  { name: "Metformin", dosage: "500mg", instructions: "Take with meals", times: "08:00, 12:00, 18:00", nextDose: "6:00 PM", remaining: 30, total: 30, taken: false },
  { name: "Aspirin", dosage: "81mg", instructions: "Take with water", times: "08:00", nextDose: "8:00 AM", remaining: 20, total: 30, taken: true },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [medList, setMedList] = useState(medications);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const toggleTaken = (index: number) => {
    setMedList(prev => prev.map((m, i) => i === index ? { ...m, taken: !m.taken } : m));
  };

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
        {[
          { label: "Upcoming Appointments", value: "3", sub: "Next: Today 2:00 PM", icon: Calendar, onClick: () => navigate("/appointments") },
          { label: "Active Medications", value: "5", sub: "2 due today", icon: Pill, onClick: () => navigate("/medications") },
          { label: "Patients", value: "2", sub: "Active care plans", icon: Users, onClick: () => navigate("/patient-profile") },
          { label: "Pending Alerts", value: "2", sub: "Medication reminders", icon: AlertTriangle, onClick: () => navigate("/notifications") },
        ].map(card => (
          <div
            key={card.label}
            className="stat-card cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            onClick={card.onClick}
          >
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </div>
            <card.icon className="w-10 h-10 text-primary opacity-60" />
          </div>
        ))}
      </div>

      {/* Quick Vitals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Heart Rate", value: "72 bpm", icon: Heart, color: "text-destructive" },
          { label: "Blood Pressure", value: "138/85", icon: Activity, color: "text-warning" },
          { label: "SpO₂", value: "97%", icon: TrendingUp, color: "text-success" },
        ].map(v => (
          <div key={v.label} className="eldercare-card flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/smart-health")}>
            <v.icon className={`w-8 h-8 ${v.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{v.label}</p>
              <p className="text-lg font-bold">{v.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="eldercare-card">
          <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
          <div className="space-y-3">
            {[
              { time: "02:00 PM", patient: "Margaret Johnson", type: "Routine Checkup" },
              { time: "04:30 PM", patient: "Robert Smith", type: "Follow-up Visit" },
            ].map((apt, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors" onClick={() => navigate("/appointments")}>
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{apt.time}</p>
                  <p className="font-medium">{apt.patient}</p>
                  <p className="text-sm text-muted-foreground">{apt.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="eldercare-card">
          <h2 className="text-lg font-semibold mb-4">Medication Tracker</h2>
          <div className="space-y-4">
            {medList.map((med, i) => (
              <div key={med.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTaken(i)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        med.taken ? "bg-success border-success" : "border-muted-foreground"
                      }`}
                    >
                      {med.taken && <span className="text-success-foreground text-xs">✓</span>}
                    </button>
                    <Pill className="w-4 h-4 text-primary" />
                    <span className={`font-semibold ${med.taken ? "line-through text-muted-foreground" : ""}`}>{med.name}</span>
                  </div>
                  <span className="font-semibold">{med.dosage}</span>
                </div>
                <p className="text-sm text-muted-foreground ml-11">{med.instructions}</p>
                <div className="flex justify-between text-sm mt-1 ml-11">
                  <span className="text-muted-foreground">Next dose:</span>
                  <span className="text-primary font-medium">{med.nextDose}</span>
                </div>
                <div className="flex justify-between text-sm ml-11 mb-2">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="text-success font-medium">{med.remaining} pills</span>
                </div>
                <Progress value={(med.remaining / med.total) * 100} className="h-2 ml-11" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
