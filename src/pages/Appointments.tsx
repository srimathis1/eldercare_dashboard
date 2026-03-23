import { Calendar, Clock, MapPin, Phone, MessageSquare, Search, Plus, X, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  type: string;
  date: string;
  time: string;
  location: string | null;
  doctor: string | null;
  status: string;
  phone: string | null;
  notes: string | null;
}

const emptyForm = { patient_name: "", type: "", date: "", time: "", location: "", doctor: "", notes: "" };

const Appointments = () => {
  const { isDoctor, selectedPatient } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [callDialog, setCallDialog] = useState<Appointment | null>(null);
  const [messageDialog, setMessageDialog] = useState<Appointment | null>(null);
  const [messageText, setMessageText] = useState("");
  const [formDialog, setFormDialog] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Appointment | null>(null);

  const patientId = selectedPatient?.id;

  const fetchAppointments = useCallback(async () => {
    if (!patientId) { setAppointments([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: true });
    if (!error && data) setAppointments(data as Appointment[]);
    setLoading(false);
  }, [patientId]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  useEffect(() => {
    if (!patientId) return;
    const channel = supabase
      .channel("appointments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `patient_id=eq.${patientId}` }, () => {
        fetchAppointments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [patientId, fetchAppointments]);

  const filtered = appointments.filter(a =>
    a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase()) ||
    (a.doctor || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCall = (apt: Appointment) => { setCallDialog(apt); toast.success(`Initiating call to ${apt.patient_name}...`); };
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    toast.success(`Message sent to ${messageDialog?.patient_name}: "${messageText}"`);
    setMessageText(""); setMessageDialog(null);
  };

  const handleMarkComplete = async (id: string) => {
    const { error } = await supabase.from("appointments").update({ status: "completed" }).eq("id", id);
    if (error) toast.error("Update failed"); else toast.success("Appointment marked as completed");
    setSelectedApt(null); fetchAppointments();
  };

  const openCreateForm = () => { setEditingId(null); setFormData(emptyForm); setFormDialog(true); };
  const openEditForm = (apt: Appointment) => {
    setEditingId(apt.id);
    setFormData({ patient_name: apt.patient_name, type: apt.type, date: apt.date, time: apt.time, location: apt.location || "", doctor: apt.doctor || "", notes: apt.notes || "" });
    setSelectedApt(null); setFormDialog(true);
  };

  const handleSubmitForm = async () => {
    if (!formData.patient_name || !formData.type || !formData.date) { toast.error("Please fill in required fields"); return; }
    if (editingId) {
      const { error } = await supabase.from("appointments").update({
        patient_name: formData.patient_name, type: formData.type, date: formData.date,
        time: formData.time || "TBD", location: formData.location || null,
        doctor: formData.doctor || null, notes: formData.notes || null,
      }).eq("id", editingId);
      if (error) toast.error("Update failed"); else toast.success("Appointment updated");
    } else {
      if (!patientId) { toast.error("No patient selected"); return; }
      const { error } = await supabase.from("appointments").insert({
        patient_id: patientId, patient_name: formData.patient_name, type: formData.type,
        date: formData.date, time: formData.time || "TBD",
        location: formData.location || null, doctor: formData.doctor || null, notes: formData.notes || null,
      });
      if (error) toast.error("Failed to create appointment"); else toast.success("Appointment created");
    }
    setFormDialog(false); setFormData(emptyForm); setEditingId(null); fetchAppointments();
  };

  const handleDelete = async (apt: Appointment) => {
    const { error } = await supabase.from("appointments").delete().eq("id", apt.id);
    if (error) toast.error("Delete failed"); else toast.success("Appointment deleted");
    setDeleteConfirm(null); setSelectedApt(null); fetchAppointments();
  };

  if (!patientId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Select a patient to view appointments.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        {isDoctor && (
          <Button className="gap-2" onClick={openCreateForm}><Plus className="w-4 h-4" /> New Appointment</Button>
        )}
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
                <h3 className="font-semibold text-lg">{apt.patient_name}</h3>
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
              {apt.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{apt.location}</span></div>}
              {apt.doctor && <p className="text-muted-foreground">Doctor: <span className="text-foreground">{apt.doctor}</span></p>}
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleCall(apt)}><Phone className="w-3.5 h-3.5" />Call</Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => setMessageDialog(apt)}><MessageSquare className="w-3.5 h-3.5" />Message</Button>
              {isDoctor && (
                <>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEditForm(apt)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(apt)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No appointments found</div>}

      {/* Detail Dialog */}
      <Dialog open={!!selectedApt} onOpenChange={() => setSelectedApt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedApt?.patient_name} — {selectedApt?.type}</DialogTitle>
            <DialogDescription>Appointment Details</DialogDescription>
          </DialogHeader>
          {selectedApt && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{selectedApt.date}</p></div>
                <div><p className="text-muted-foreground">Time</p><p className="font-medium">{selectedApt.time}</p></div>
                <div><p className="text-muted-foreground">Location</p><p className="font-medium">{selectedApt.location || "N/A"}</p></div>
                <div><p className="text-muted-foreground">Doctor</p><p className="font-medium">{selectedApt.doctor || "N/A"}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{selectedApt.status}</p></div>
              </div>
              {selectedApt.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs mb-1">Notes</p><p>{selectedApt.notes}</p>
                </div>
              )}
              <div className="flex gap-2">
                {selectedApt.status === "upcoming" && (
                  <Button className="flex-1 gap-2" onClick={() => handleMarkComplete(selectedApt.id)}><Check className="w-4 h-4" />Mark as Completed</Button>
                )}
                {isDoctor && (
                  <>
                    <Button variant="outline" className="gap-2" onClick={() => openEditForm(selectedApt)}><Pencil className="w-4 h-4" />Edit</Button>
                    <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={() => { setSelectedApt(null); setDeleteConfirm(selectedApt); }}><Trash2 className="w-4 h-4" />Delete</Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Dialog */}
      <Dialog open={!!callDialog} onOpenChange={() => setCallDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Calling {callDialog?.patient_name}</DialogTitle><DialogDescription>{callDialog?.phone || "No phone"}</DialogDescription></DialogHeader>
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4 animate-pulse"><Phone className="w-8 h-8 text-success" /></div>
            <p className="text-muted-foreground text-sm">Call in progress...</p>
            <Button variant="destructive" className="mt-6 gap-2" onClick={() => { setCallDialog(null); toast.info("Call ended"); }}><X className="w-4 h-4" />End Call</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={() => setMessageDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message {messageDialog?.patient_name}</DialogTitle><DialogDescription>Send a quick message</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <textarea className="w-full rounded-lg border border-border bg-card p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Type your message..." value={messageText} onChange={e => setMessageText(e.target.value)} />
            <Button className="w-full" onClick={handleSendMessage}>Send Message</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={formDialog} onOpenChange={setFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Appointment" : "New Appointment"}</DialogTitle>
            <DialogDescription>{editingId ? "Update appointment details" : "Schedule a new patient appointment"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Patient name *" value={formData.patient_name} onChange={e => setFormData(p => ({ ...p, patient_name: e.target.value }))} />
            <Input placeholder="Appointment type *" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} />
            <Input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
            <Input placeholder="Time (e.g. 02:00 PM)" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} />
            <Input placeholder="Location" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
            <Input placeholder="Doctor" value={formData.doctor} onChange={e => setFormData(p => ({ ...p, doctor: e.target.value }))} />
            <textarea className="w-full rounded-lg border border-border bg-card p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Notes" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
            <Button className="w-full" onClick={handleSubmitForm}>{editingId ? "Update Appointment" : "Create Appointment"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete the appointment for {deleteConfirm?.patient_name} ({deleteConfirm?.type})?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Appointments;
