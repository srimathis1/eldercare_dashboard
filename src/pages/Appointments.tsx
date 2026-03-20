import { Calendar, Clock, MapPin, Phone, MessageSquare, Search, Plus, X, Check, Pencil, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

const emptyForm = { patient: "", type: "", date: "", time: "", location: "", doctor: "", notes: "" };

const Appointments = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState("");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [callDialog, setCallDialog] = useState<Appointment | null>(null);
  const [messageDialog, setMessageDialog] = useState<Appointment | null>(null);
  const [messageText, setMessageText] = useState("");
  const [formDialog, setFormDialog] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Appointment | null>(null);
  const lastDeletedRef = useRef<{ apt: Appointment; index: number } | null>(null);

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

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormDialog(true);
  };

  const openEditForm = (apt: Appointment) => {
    setEditingId(apt.id);
    setFormData({
      patient: apt.patient, type: apt.type, date: apt.date,
      time: apt.time, location: apt.location, doctor: apt.doctor, notes: apt.notes,
    });
    setSelectedApt(null);
    setFormDialog(true);
  };

  const handleSubmitForm = () => {
    if (!formData.patient || !formData.type || !formData.date) {
      toast.error("Please fill in required fields");
      return;
    }
    if (editingId !== null) {
      setAppointments(prev => prev.map(a => a.id === editingId ? {
        ...a, ...formData, time: formData.time || a.time
      } : a));
      toast.success("Appointment updated successfully");
    } else {
      const apt: Appointment = {
        id: Date.now(), ...formData, status: "upcoming",
        phone: "+1 (555) 000-0000", time: formData.time || "TBD",
      };
      setAppointments(prev => [apt, ...prev]);
      toast.success("Appointment created successfully");
    }
    setFormDialog(false);
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (apt: Appointment) => {
    const index = appointments.findIndex(a => a.id === apt.id);
    lastDeletedRef.current = { apt, index };
    setAppointments(prev => prev.filter(a => a.id !== apt.id));
    setDeleteConfirm(null);
    setSelectedApt(null);
    toast.success("Appointment deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          if (lastDeletedRef.current) {
            const { apt: restored, index: idx } = lastDeletedRef.current;
            setAppointments(prev => {
              const copy = [...prev];
              copy.splice(idx, 0, restored);
              return copy;
            });
            toast.success("Appointment restored");
          }
        },
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Button className="gap-2" onClick={openCreateForm}>
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
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                  apt.status === "completed" ? "bg-success text-success-foreground"
                  : apt.status === "cancelled" ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground"
                }`}>{apt.status}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>{apt.date}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span>{apt.time}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{apt.location}</span></div>
              <p className="text-muted-foreground">Doctor: <span className="text-foreground">{apt.doctor}</span></p>
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleCall(apt)}>
                <Phone className="w-3.5 h-3.5" />Call
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => setMessageDialog(apt)}>
                <MessageSquare className="w-3.5 h-3.5" />Message
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEditForm(apt)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(apt)}>
                <Trash2 className="w-3.5 h-3.5" />
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
              <div className="flex gap-2">
                {selectedApt.status === "upcoming" && (
                  <Button className="flex-1 gap-2" onClick={() => handleMarkComplete(selectedApt.id)}>
                    <Check className="w-4 h-4" />Mark as Completed
                  </Button>
                )}
                <Button variant="outline" className="gap-2" onClick={() => openEditForm(selectedApt)}>
                  <Pencil className="w-4 h-4" />Edit
                </Button>
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={() => { setSelectedApt(null); setDeleteConfirm(selectedApt); }}>
                  <Trash2 className="w-4 h-4" />Delete
                </Button>
              </div>
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

      {/* Create / Edit Dialog */}
      <Dialog open={formDialog} onOpenChange={setFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Appointment" : "New Appointment"}</DialogTitle>
            <DialogDescription>{editingId ? "Update appointment details" : "Schedule a new patient appointment"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Patient name *" value={formData.patient} onChange={e => setFormData(p => ({ ...p, patient: e.target.value }))} />
            <Input placeholder="Appointment type *" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} />
            <Input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
            <Input placeholder="Time (e.g. 02:00 PM)" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} />
            <Input placeholder="Location" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
            <Input placeholder="Doctor" value={formData.doctor} onChange={e => setFormData(p => ({ ...p, doctor: e.target.value }))} />
            <textarea
              className="w-full rounded-lg border border-border bg-card p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Notes"
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
            />
            <Button className="w-full" onClick={handleSubmitForm}>
              {editingId ? "Update Appointment" : "Create Appointment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the appointment for {deleteConfirm?.patient} ({deleteConfirm?.type})? This action can be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Appointments;
