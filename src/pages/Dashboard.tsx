import { Calendar, Pill, Users, AlertTriangle, Clock, Activity, TrendingUp, Heart, Pencil, Trash2, Plus, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DashMed {
  id: string;
  name: string;
  dosage: string;
  instructions: string | null;
  next_dose: string | null;
  remaining: number;
  total: number;
  taken: boolean;
}

interface DashApt {
  id: string;
  time: string;
  patient_name: string;
  type: string;
  date: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDoctor, selectedPatient } = useAuth();
  const [medList, setMedList] = useState<DashMed[]>([]);
  const [aptList, setAptList] = useState<DashApt[]>([]);

  const patientId = selectedPatient?.id;

  const fetchData = useCallback(async () => {
    if (!patientId) { setMedList([]); setAptList([]); return; }
    const [medsRes, aptsRes] = await Promise.all([
      supabase.from("medications").select("id, name, dosage, instructions, next_dose, remaining, total, taken").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(5),
      supabase.from("appointments").select("id, time, patient_name, type, date, status").eq("patient_id", patientId).order("date", { ascending: true }).limit(5),
    ]);
    if (medsRes.data) setMedList(medsRes.data as DashMed[]);
    if (aptsRes.data) setAptList(aptsRes.data as DashApt[]);
  }, [patientId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!patientId) return;
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "medications", filter: `patient_id=eq.${patientId}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `patient_id=eq.${patientId}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [patientId, fetchData]);

  // Med CRUD (doctor only, quick dashboard)
  const [medFormOpen, setMedFormOpen] = useState(false);
  const [medEditId, setMedEditId] = useState<string | null>(null);
  const [medForm, setMedForm] = useState({ name: "", dosage: "", instructions: "", nextDose: "" });
  const [medDeleteConfirm, setMedDeleteConfirm] = useState<DashMed | null>(null);

  // Apt CRUD
  const [aptFormOpen, setAptFormOpen] = useState(false);
  const [aptEditId, setAptEditId] = useState<string | null>(null);
  const [aptForm, setAptForm] = useState({ time: "", patient_name: "", type: "", date: "" });
  const [aptDeleteConfirm, setAptDeleteConfirm] = useState<DashApt | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const toggleTaken = async (med: DashMed) => {
    const { error } = await supabase.from("medications").update({ taken: !med.taken }).eq("id", med.id);
    if (error) toast.error("Update failed"); else toast.success("Medication status updated");
    fetchData();
  };

  const openMedCreate = () => { setMedEditId(null); setMedForm({ name: "", dosage: "", instructions: "", nextDose: "" }); setMedFormOpen(true); };
  const openMedEdit = (m: DashMed) => { setMedEditId(m.id); setMedForm({ name: m.name, dosage: m.dosage, instructions: m.instructions || "", nextDose: m.next_dose || "" }); setMedFormOpen(true); };
  const submitMed = async () => {
    if (!medForm.name || !medForm.dosage) { toast.error("Name and dosage required"); return; }
    if (medEditId) {
      await supabase.from("medications").update({ name: medForm.name, dosage: medForm.dosage, instructions: medForm.instructions || null, next_dose: medForm.nextDose || null }).eq("id", medEditId);
      toast.success("Medication updated");
    } else {
      if (!patientId) return;
      await supabase.from("medications").insert({ patient_id: patientId, name: medForm.name, dosage: medForm.dosage, instructions: medForm.instructions || null, next_dose: medForm.nextDose || null });
      toast.success("Medication added");
    }
    setMedFormOpen(false); fetchData();
  };
  const deleteMed = async (m: DashMed) => {
    await supabase.from("medications").delete().eq("id", m.id);
    setMedDeleteConfirm(null); toast.success("Medication deleted"); fetchData();
  };

  const openAptCreate = () => { setAptEditId(null); setAptForm({ time: "", patient_name: selectedPatient?.name || "", type: "", date: "" }); setAptFormOpen(true); };
  const openAptEdit = (a: DashApt) => { setAptEditId(a.id); setAptForm({ time: a.time, patient_name: a.patient_name, type: a.type, date: a.date }); setAptFormOpen(true); };
  const submitApt = async () => {
    if (!aptForm.patient_name || !aptForm.time) { toast.error("Patient and time required"); return; }
    if (aptEditId) {
      await supabase.from("appointments").update({ time: aptForm.time, patient_name: aptForm.patient_name, type: aptForm.type, date: aptForm.date }).eq("id", aptEditId);
      toast.success("Appointment updated");
    } else {
      if (!patientId) return;
      await supabase.from("appointments").insert({ patient_id: patientId, time: aptForm.time, patient_name: aptForm.patient_name, type: aptForm.type, date: aptForm.date || new Date().toISOString().split("T")[0] });
      toast.success("Appointment added");
    }
    setAptFormOpen(false); fetchData();
  };
  const deleteApt = async (a: DashApt) => {
    await supabase.from("appointments").delete().eq("id", a.id);
    setAptDeleteConfirm(null); toast.success("Appointment deleted"); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{today}</p>
          {selectedPatient && (
            <p className="text-sm text-primary font-medium mt-1">Viewing: {selectedPatient.name} ({selectedPatient.age} yrs, {selectedPatient.gender})</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{isDoctor ? "Doctor" : "Caregiver"}</p>
            <p className="text-xs text-muted-foreground">{isDoctor ? "Full Access" : "View & Mark"}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Users className="w-5 h-5 text-muted-foreground" /></div>
        </div>
      </div>

      {!patientId && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{isDoctor ? "Select a patient from the Patients page to view their dashboard." : "No patient assigned yet. Please contact your doctor."}</p>
          {isDoctor && <Button variant="outline" className="mt-4" onClick={() => navigate("/patients")}>Go to Patients</Button>}
        </div>
      )}

      {patientId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Upcoming Appointments", value: String(aptList.filter(a => a.status === "upcoming").length), sub: `${aptList.length} total`, icon: Calendar, onClick: () => navigate("/appointments") },
              { label: "Active Medications", value: String(medList.filter(m => !m.taken).length), sub: `${medList.length} total tracked`, icon: Pill, onClick: () => navigate("/medications") },
              { label: "Patients", value: isDoctor ? "View All" : "1", sub: isDoctor ? "Manage patients" : "Your assigned patient", icon: Users, onClick: () => navigate(isDoctor ? "/patients" : "/patient-profile") },
              { label: "Pending Alerts", value: String(medList.filter(m => m.remaining <= 5).length), sub: "Low stock alerts", icon: AlertTriangle, onClick: () => navigate("/notifications") },
            ].map(card => (
              <div key={card.label} className="stat-card cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={card.onClick}>
                <div><p className="text-sm text-muted-foreground">{card.label}</p><p className="text-3xl font-bold mt-1">{card.value}</p><p className="text-xs text-muted-foreground mt-1">{card.sub}</p></div>
                <card.icon className="w-10 h-10 text-primary opacity-60" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Heart Rate", value: "72 bpm", icon: Heart, color: "text-destructive" },
              { label: "Blood Pressure", value: "138/85", icon: Activity, color: "text-warning" },
              { label: "SpO₂", value: "97%", icon: TrendingUp, color: "text-success" },
            ].map(v => (
              <div key={v.label} className="eldercare-card flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/smart-health")}>
                <v.icon className={`w-8 h-8 ${v.color}`} /><div><p className="text-xs text-muted-foreground">{v.label}</p><p className="text-lg font-bold">{v.value}</p></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointments */}
            <div className="eldercare-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Today's Appointments</h2>
                {isDoctor && <Button variant="ghost" size="sm" className="gap-1" onClick={openAptCreate}><Plus className="w-3.5 h-3.5" />Add</Button>}
              </div>
              <div className="space-y-3">
                {aptList.map((apt) => (
                  <div key={apt.id} className="flex items-start justify-between p-4 rounded-lg bg-muted/50 group">
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => navigate("/appointments")}>
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div><p className="text-sm text-muted-foreground">{apt.time}</p><p className="font-medium">{apt.patient_name}</p><p className="text-sm text-muted-foreground">{apt.type}</p></div>
                    </div>
                    {isDoctor && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openAptEdit(apt)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setAptDeleteConfirm(apt)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    )}
                  </div>
                ))}
                {aptList.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No appointments</p>}
              </div>
            </div>

            {/* Medications */}
            <div className="eldercare-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Medication Tracker</h2>
                {isDoctor && <Button variant="ghost" size="sm" className="gap-1" onClick={openMedCreate}><Plus className="w-3.5 h-3.5" />Add</Button>}
              </div>
              <div className="space-y-4">
                {medList.map((med) => (
                  <div key={med.id} className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleTaken(med)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${med.taken ? "bg-success border-success" : "border-muted-foreground"}`}>
                          {med.taken && <span className="text-success-foreground text-xs">✓</span>}
                        </button>
                        <Pill className="w-4 h-4 text-primary" />
                        <span className={`font-semibold ${med.taken ? "line-through text-muted-foreground" : ""}`}>{med.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold mr-2">{med.dosage}</span>
                        {isDoctor && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openMedEdit(med)}><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setMedDeleteConfirm(med)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground ml-11">{med.instructions || ""}</p>
                    {med.next_dose && <div className="flex justify-between text-sm mt-1 ml-11"><span className="text-muted-foreground">Next dose:</span><span className="text-primary font-medium">{med.next_dose}</span></div>}
                    <div className="flex justify-between text-sm ml-11 mb-2"><span className="text-muted-foreground">Remaining:</span><span className="text-success font-medium">{med.remaining} pills</span></div>
                    <Progress value={(med.remaining / med.total) * 100} className="h-2 ml-11" />
                  </div>
                ))}
                {medList.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No medications tracked</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Med Form */}
      <Dialog open={medFormOpen} onOpenChange={setMedFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{medEditId ? "Edit Medication" : "Add Medication"}</DialogTitle><DialogDescription>Quick medication entry</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Medicine name *" value={medForm.name} onChange={e => setMedForm(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Dosage *" value={medForm.dosage} onChange={e => setMedForm(p => ({ ...p, dosage: e.target.value }))} />
            <Input placeholder="Instructions" value={medForm.instructions} onChange={e => setMedForm(p => ({ ...p, instructions: e.target.value }))} />
            <Input placeholder="Next dose time" value={medForm.nextDose} onChange={e => setMedForm(p => ({ ...p, nextDose: e.target.value }))} />
            <Button className="w-full" onClick={submitMed}>{medEditId ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apt Form */}
      <Dialog open={aptFormOpen} onOpenChange={setAptFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{aptEditId ? "Edit Appointment" : "Add Appointment"}</DialogTitle><DialogDescription>Quick appointment entry</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Patient name *" value={aptForm.patient_name} onChange={e => setAptForm(p => ({ ...p, patient_name: e.target.value }))} />
            <Input placeholder="Time (e.g. 02:00 PM) *" value={aptForm.time} onChange={e => setAptForm(p => ({ ...p, time: e.target.value }))} />
            <Input type="date" value={aptForm.date} onChange={e => setAptForm(p => ({ ...p, date: e.target.value }))} />
            <Input placeholder="Appointment type" value={aptForm.type} onChange={e => setAptForm(p => ({ ...p, type: e.target.value }))} />
            <Button className="w-full" onClick={submitApt}>{aptEditId ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!medDeleteConfirm} onOpenChange={() => setMedDeleteConfirm(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Medication</AlertDialogTitle><AlertDialogDescription>Remove {medDeleteConfirm?.name}?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => medDeleteConfirm && deleteMed(medDeleteConfirm)}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!aptDeleteConfirm} onOpenChange={() => setAptDeleteConfirm(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Appointment</AlertDialogTitle><AlertDialogDescription>Remove {aptDeleteConfirm?.patient_name}'s appointment?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => aptDeleteConfirm && deleteApt(aptDeleteConfirm)}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
