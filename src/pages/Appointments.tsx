import { Calendar, Clock, MapPin, Phone, MessageSquare, Search, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Appointment {
  id: number;
  patient: string;
  type: string;
  date: string;
  time: string;
  location: string;
  doctor: string;
  status: "upcoming" | "completed" | "cancelled";
  phone: string;
  notes: string;
}

const initialAppointments: Appointment[] = [
  {
    id: 1, patient: "Margaret Johnson", type: "Routine Checkup",
    date: "2025-10-01", time: "02:00 PM (30 mins)", location: "Main Clinic - Room 203",
    doctor: "Dr. Sarah Williams", status: "upcoming", phone: "+1 (555) 123-4567",
    notes: "Bring recent blood work results. Check blood pressure medication effectiveness."
  },
  {
    id: 2, patient: "Robert Smith", type: "Follow-up Visit",
    date: "2025-10-03", time: "10:30 AM (45 mins)", location: "Cardiology Wing",
    doctor: "Dr. Michael Chen", status: "upcoming", phone: "+1 (555) 234-5678",
    notes: "Review echocardiogram results. Discuss exercise plan adjustments."
  },
  {
    id: 3, patient: "Margaret Johnson", type: "Blood Work",
    date: "2025-09-28", time: "03:00 PM (20 mins)", location: "Laboratory",
    doctor: "Dr. Sarah Williams", status: "completed", phone: "+1 (555) 123-4567",
    notes: "Complete blood count and metabolic panel. Fasting required."
  },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState("");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [callDialog, setCallDialog] = useState<Appointment | null>(null);
  const [messageDialog, setMessageDialog] = useState<Appointment | null>(null);
  const [messageText, setMessageText] = useState("");
  const [newDialog, setNewDialog] = useState(false);
  const [newApt, setNewApt] = useState({ patient: "", type: "", date: "", time: "", location: "", doctor: "" });

  const filtered = appointments.filter(a =>
    a.patient.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const handleCall = (apt: Appointment) => {
    setCallDialog(apt);
    toast.success(`Initiating call to ${apt.patient}...`);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    toast.success(`Message sent to ${messageDialog?.patient}: "${messageText}"`);
    setMessageText("");
    setMessageDialog(null);
  };

  const handleMarkComplete = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "completed" as const } : a));
    setSelectedApt(null);
    toast.success("Appointment marked as completed");
  };

  const handleAddAppointment = () => {
    if (!newApt.patient || !newApt.type || !newApt.date) {
      toast.error("Please fill in required fields");
      return;
    }
    const apt: Appointment = {
      id: Date.now(), ...newApt, status: "upcoming",
      phone: "+1 (555) 000-0000",
      time: newApt.time || "TBD",
      notes: "",
    };
    setAppointments(prev => [apt, ...prev]);
    setNewDialog(false);
    setNewApt({ patient: "", type: "", date: "", time: "", location: "", doctor: "" });
    toast.success("Appointment created successfully");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Button className="gap-2" onClick={() => setNewDialog(true)}>
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search appointments..." className="pl-10 bg-card" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((apt) => (
          <div key={apt.id} className="eldercare-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedApt(apt)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{apt.patient}</h3>
                <p className="text-sm text-muted-foreground">{apt.type}</p>
              </div>
              <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                apt.status === "completed" ? "bg-success text-success-foreground"
                : apt.status === "cancelled" ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
              }`}>{apt.status}</span>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>{apt.date}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span>{apt.time}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{apt.location}</span></div>
              <p className="text-muted-foreground">Doctor: <span className="text-foreground">{apt.doctor}</span></p>
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => handleCall(apt)}>
                <Phone className="w-4 h-4" />Call
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setMessageDialog(apt)}>
                <MessageSquare className="w-4 h-4" />Message
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No appointments found</div>
      )}

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedApt} onOpenChange={() => setSelectedApt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedApt?.patient} — {selectedApt?.type}</DialogTitle>
            <DialogDescription>Appointment Details</DialogDescription>
          </DialogHeader>
          {selectedApt && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{selectedApt.date}</p></div>
                <div><p className="text-muted-foreground">Time</p><p className="font-medium">{selectedApt.time}</p></div>
                <div><p className="text-muted-foreground">Location</p><p className="font-medium">{selectedApt.location}</p></div>
                <div><p className="text-muted-foreground">Doctor</p><p className="font-medium">{selectedApt.doctor}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedApt.phone}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{selectedApt.status}</p></div>
              </div>
              {selectedApt.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">Notes</p>
                  <p>{selectedApt.notes}</p>
                </div>
              )}
              {selectedApt.status === "upcoming" && (
                <Button className="w-full gap-2" onClick={() => handleMarkComplete(selectedApt.id)}>
                  <Check className="w-4 h-4" />Mark as Completed
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Dialog */}
      <Dialog open={!!callDialog} onOpenChange={() => setCallDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calling {callDialog?.patient}</DialogTitle>
            <DialogDescription>{callDialog?.phone}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4 animate-pulse">
              <Phone className="w-8 h-8 text-success" />
            </div>
            <p className="text-muted-foreground text-sm">Call in progress...</p>
            <Button variant="destructive" className="mt-6 gap-2" onClick={() => { setCallDialog(null); toast.info("Call ended"); }}>
              <X className="w-4 h-4" />End Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={() => setMessageDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {messageDialog?.patient}</DialogTitle>
            <DialogDescription>Send a quick message</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <textarea
              className="w-full rounded-lg border border-border bg-card p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Type your message..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
            />
            <Button className="w-full" onClick={handleSendMessage}>Send Message</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={newDialog} onOpenChange={setNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Schedule a new patient appointment</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Patient name *" value={newApt.patient} onChange={e => setNewApt(p => ({ ...p, patient: e.target.value }))} />
            <Input placeholder="Appointment type *" value={newApt.type} onChange={e => setNewApt(p => ({ ...p, type: e.target.value }))} />
            <Input type="date" value={newApt.date} onChange={e => setNewApt(p => ({ ...p, date: e.target.value }))} />
            <Input placeholder="Time (e.g. 02:00 PM)" value={newApt.time} onChange={e => setNewApt(p => ({ ...p, time: e.target.value }))} />
            <Input placeholder="Location" value={newApt.location} onChange={e => setNewApt(p => ({ ...p, location: e.target.value }))} />
            <Input placeholder="Doctor" value={newApt.doctor} onChange={e => setNewApt(p => ({ ...p, doctor: e.target.value }))} />
            <Button className="w-full" onClick={handleAddAppointment}>Create Appointment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
