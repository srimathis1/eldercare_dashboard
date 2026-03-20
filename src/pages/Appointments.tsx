import { Calendar, Clock, MapPin, Phone, MessageSquare, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const appointments = [
  {
    patient: "Margaret Johnson",
    type: "Routine Checkup",
    date: "2025-10-01",
    time: "02:00 PM (30 mins)",
    location: "Main Clinic - Room 203",
    doctor: "Dr. Sarah Williams",
    status: "upcoming",
  },
  {
    patient: "Robert Smith",
    type: "Follow-up Visit",
    date: "2025-10-03",
    time: "10:30 AM (45 mins)",
    location: "Cardiology Wing",
    doctor: "Dr. Michael Chen",
    status: "upcoming",
  },
  {
    patient: "Margaret Johnson",
    type: "Blood Work",
    date: "2025-09-28",
    time: "03:00 PM (20 mins)",
    location: "Laboratory",
    doctor: "Dr. Sarah Williams",
    status: "completed",
  },
];

const Appointments = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search appointments..." className="pl-10 bg-card" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {appointments.map((apt, i) => (
          <div key={i} className="eldercare-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{apt.patient}</h3>
                <p className="text-sm text-muted-foreground">{apt.type}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                  apt.status === "completed"
                    ? "bg-success text-success-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {apt.status}
              </span>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{apt.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{apt.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{apt.location}</span>
              </div>
              <p className="text-muted-foreground">
                Doctor: <span className="text-foreground">{apt.doctor}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2">
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
