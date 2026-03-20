import { Calendar, Pill, Users, AlertTriangle, Clock, Activity, TrendingUp, Heart, Pencil, Trash2, Plus, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DashMed {
  id: number;
  name: string;
  dosage: string;
  instructions: string;
  nextDose: string;
  remaining: number;
  total: number;
  taken: boolean;
}

interface DashApt {
  id: number;
  time: string;
  patient: string;
  type: string;
}

const initialMeds: DashMed[] = [
  { id: 1, name: "Lisinopril", dosage: "10mg", instructions: "Take with food", nextDose: "8:00 PM", remaining: 25, total: 30, taken: false },
  { id: 2, name: "Metformin", dosage: "500mg", instructions: "Take with meals", nextDose: "6:00 PM", remaining: 30, total: 30, taken: false },
  { id: 3, name: "Aspirin", dosage: "81mg", instructions: "Take with water", nextDose: "8:00 AM", remaining: 20, total: 30, taken: true },
];

const initialApts: DashApt[] = [
  { id: 1, time: "02:00 PM", patient: "Margaret Johnson", type: "Routine Checkup" },
  { id: 2, time: "04:30 PM", patient: "Robert Smith", type: "Follow-up Visit" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [medList, setMedList] = useState(initialMeds);
  const [aptList, setAptList] = useState(initialApts);

  // Med CRUD
  const [medFormOpen, setMedFormOpen] = useState(false);
  const [medEditId, setMedEditId] = useState<number | null>(null);
  const [medForm, setMedForm] = useState({ name: "", dosage: "", instructions: "", nextDose: "" });
  const [medDeleteConfirm, setMedDeleteConfirm] = useState<DashMed | null>(null);

  // Apt CRUD
  const [aptFormOpen, setAptFormOpen] = useState(false);
  const [aptEditId, setAptEditId] = useState<number | null>(null);
  const [aptForm, setAptForm] = useState({ time: "", patient: "", type: "" });
  const [aptDeleteConfirm, setAptDeleteConfirm] = useState<DashApt | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const toggleTaken = (id: number) => {
    setMedList(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  // Med handlers
  const openMedCreate = () => { setMedEditId(null); setMedForm({ name: "", dosage: "", instructions: "", nextDose: "" }); setMedFormOpen(true); };
  const openMedEdit = (m: DashMed) => { setMedEditId(m.id); setMedForm({ name: m.name, dosage: m.dosage, instructions: m.instructions, nextDose: m.nextDose }); setMedFormOpen(true); };
  const submitMed = () => {
    if (!medForm.name || !medForm.dosage) { toast.error("Name and dosage required"); return; }
    if (medEditId) {
      setMedList(prev => prev.map(m => m.id === medEditId ? { ...m, ...medForm } : m));
      toast.success("Medication updated");
    } else {
      setMedList(prev => [...prev, { id: Date.now(), ...medForm, remaining: 30, total: 30, taken: false }]);
      toast.success("Medication added");
    }
    setMedFormOpen(false);
  };
  const deleteMed = (m: DashMed) => { setMedList(prev => prev.filter(x => x.id !== m.id)); setMedDeleteConfirm(null); toast.success("Medication deleted"); };

  // Apt handlers
  const openAptCreate = () => { setAptEditId(null); setAptForm({ time: "", patient: "", type: "" }); setAptFormOpen(true); };
  const openAptEdit = (a: DashApt) => { setAptEditId(a.id); setAptForm({ time: a.time, patient: a.patient, type: a.type }); setAptFormOpen(true); };
  const submitApt = () => {
    if (!aptForm.patient || !aptForm.time) { toast.error("Patient and time required"); return; }
    if (aptEditId) {
      setAptList(prev => prev.map(a => a.id === aptEditId ? { ...a, ...aptForm } : a));
      toast.success("Appointment updated");
    } else {
      setAptList(prev => [...prev, { id: Date.now(), ...aptForm }]);
      toast.success("Appointment added");
    }
    setAptFormOpen(false);
  };
  const deleteApt = (a: DashApt) => { setAptList(prev => prev.filter(x => x.id !== a.id)); setAptDeleteConfirm(null); toast.success("Appointment deleted"); };

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
          { label: "Upcoming Appointments", value: String(aptList.length), sub: `Next: Today ${aptList[0]?.time || "N/A"}`, icon: Calendar, onClick: () => navigate("/appointments") },
          { label: "Active Medications", value: String(medList.filter(m => !m.taken).length), sub: `${medList.length} total tracked`, icon: Pill, onClick: () => navigate("/medications") },
          { label: "Patients", value: "2", sub: "Active care plans", icon: Users, onClick: () => navigate("/patient-profile") },
          { label: "Pending Alerts", value: "2", sub: "Medication reminders", icon: AlertTriangle, onClick: () => navigate("/notifications") },
        ].map(card => (
          <div key={card.label} className="stat-card cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={card.onClick}>
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
        {/* Today's Appointments */}
        <div className="eldercare-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Appointments</h2>
            <Button variant="ghost" size="sm" className="gap-1" onClick={openAptCreate}>
              <Plus className="w-3.5 h-3.5" />Add
            </Button>
          </div>
          <div className="space-y-3">
            {aptList.map((apt) => (
              <div key={apt.id} className="flex items-start justify-between p-4 rounded-lg bg-muted/50 group">
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => navigate("/appointments")}>
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{apt.time}</p>
                    <p className="font-medium">{apt.patient}</p>
                    <p className="text-sm text-muted-foreground">{apt.type}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openAptEdit(apt)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setAptDeleteConfirm(apt)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {aptList.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No appointments today</p>}
          </div>
        </div>

        {/* Medication Tracker */}
        <div className="eldercare-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Medication Tracker</h2>
            <Button variant="ghost" size="sm" className="gap-1" onClick={openMedCreate}>
              <Plus className="w-3.5 h-3.5" />Add
            </Button>
          </div>
          <div className="space-y-4">
            {medList.map((med) => (
              <div key={med.id} className="group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTaken(med.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${med.taken ? "bg-success border-success" : "border-muted-foreground"}`}
                    >
                      {med.taken && <span className="text-success-foreground text-xs">✓</span>}
                    </button>
                    <Pill className="w-4 h-4 text-primary" />
                    <span className={`font-semibold ${med.taken ? "line-through text-muted-foreground" : ""}`}>{med.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold mr-2">{med.dosage}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openMedEdit(med)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setMedDeleteConfirm(med)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
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
            {medList.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No medications tracked</p>}
          </div>
        </div>
      </div>

      {/* Med Form Dialog */}
      <Dialog open={medFormOpen} onOpenChange={setMedFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{medEditId ? "Edit Medication" : "Add Medication"}</DialogTitle>
            <DialogDescription>Quick medication entry for the dashboard tracker</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Medicine name *" value={medForm.name} onChange={e => setMedForm(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Dosage *" value={medForm.dosage} onChange={e => setMedForm(p => ({ ...p, dosage: e.target.value }))} />
            <Input placeholder="Instructions" value={medForm.instructions} onChange={e => setMedForm(p => ({ ...p, instructions: e.target.value }))} />
            <Input placeholder="Next dose time" value={medForm.nextDose} onChange={e => setMedForm(p => ({ ...p, nextDose: e.target.value }))} />
            <Button className="w-full" onClick={submitMed}>{medEditId ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apt Form Dialog */}
      <Dialog open={aptFormOpen} onOpenChange={setAptFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{aptEditId ? "Edit Appointment" : "Add Appointment"}</DialogTitle>
            <DialogDescription>Quick appointment entry for the dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Patient name *" value={aptForm.patient} onChange={e => setAptForm(p => ({ ...p, patient: e.target.value }))} />
            <Input placeholder="Time (e.g. 02:00 PM) *" value={aptForm.time} onChange={e => setAptForm(p => ({ ...p, time: e.target.value }))} />
            <Input placeholder="Appointment type" value={aptForm.type} onChange={e => setAptForm(p => ({ ...p, type: e.target.value }))} />
            <Button className="w-full" onClick={submitApt}>{aptEditId ? "Update" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={!!medDeleteConfirm} onOpenChange={() => setMedDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>Remove {medDeleteConfirm?.name} from the tracker?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => medDeleteConfirm && deleteMed(medDeleteConfirm)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!aptDeleteConfirm} onOpenChange={() => setAptDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>Remove {aptDeleteConfirm?.patient}'s appointment?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => aptDeleteConfirm && deleteApt(aptDeleteConfirm)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
