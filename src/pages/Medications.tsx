import { Pill, Clock, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import PrescriptionScanner from "@/components/PrescriptionScanner";

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  times: string;
  nextDose: string;
  doctor: string;
  instructions: string;
  remaining: number;
  total: number;
  status: "active" | "paused";
}

const initialMedications: Medication[] = [
  { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Twice daily", times: "08:00 AM, 08:00 PM", nextDose: "8:00 PM", doctor: "Dr. Sarah Williams", instructions: "Take with food", remaining: 25, total: 30, status: "active" },
  { id: 2, name: "Metformin", dosage: "500mg", frequency: "Three times daily", times: "08:00 AM, 12:00 PM, 06:00 PM", nextDose: "6:00 PM", doctor: "Dr. Sarah Williams", instructions: "Take with meals", remaining: 30, total: 30, status: "active" },
  { id: 3, name: "Aspirin", dosage: "81mg", frequency: "Once daily", times: "08:00 AM", nextDose: "8:00 AM", doctor: "Dr. Sarah Williams", instructions: "Take with water", remaining: 20, total: 30, status: "active" },
];

const emptyForm = { name: "", dosage: "", frequency: "", times: "", nextDose: "", doctor: "", instructions: "", remaining: "", total: "" };

const Medications = () => {
  const [medications, setMedications] = useState(initialMedications);
  const [formDialog, setFormDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Medication | null>(null);
  const lastDeletedRef = useRef<{ med: Medication; index: number } | null>(null);

  const activeMeds = medications.filter(m => m.status === "active").length;
  const lowStock = medications.filter(m => m.remaining <= 5).length;

  const handleScannedMeds = (parsed: { name: string; dosage: string; timing: string; instructions: string }[]) => {
    const newMeds: Medication[] = parsed.map(p => ({
      id: Date.now() + Math.random(),
      name: p.name,
      dosage: p.dosage,
      frequency: p.timing,
      times: p.timing === "Twice daily" ? "08:00 AM, 08:00 PM" : p.timing === "Three times daily" ? "08:00 AM, 12:00 PM, 06:00 PM" : "08:00 AM",
      nextDose: "8:00 AM",
      doctor: "From Prescription",
      instructions: p.instructions,
      remaining: 30,
      total: 30,
      status: "active",
    }));
    setMedications(prev => [...newMeds, ...prev]);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormDialog(true);
  };

  const openEdit = (med: Medication) => {
    setEditingId(med.id);
    setFormData({
      name: med.name, dosage: med.dosage, frequency: med.frequency,
      times: med.times, nextDose: med.nextDose, doctor: med.doctor,
      instructions: med.instructions, remaining: String(med.remaining), total: String(med.total),
    });
    setFormDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.dosage) {
      toast.error("Name and dosage are required");
      return;
    }
    if (editingId !== null) {
      setMedications(prev => prev.map(m => m.id === editingId ? {
        ...m, name: formData.name, dosage: formData.dosage,
        frequency: formData.frequency || m.frequency,
        times: formData.times || m.times, nextDose: formData.nextDose || m.nextDose,
        doctor: formData.doctor || m.doctor, instructions: formData.instructions || m.instructions,
        remaining: Number(formData.remaining) || m.remaining,
        total: Number(formData.total) || m.total,
      } : m));
      toast.success("Medication updated successfully");
    } else {
      const med: Medication = {
        id: Date.now(), name: formData.name, dosage: formData.dosage,
        frequency: formData.frequency || "Once daily", times: formData.times || "08:00 AM",
        nextDose: formData.nextDose || "8:00 AM", doctor: formData.doctor || "TBD",
        instructions: formData.instructions || "", remaining: Number(formData.remaining) || 30,
        total: Number(formData.total) || 30, status: "active",
      };
      setMedications(prev => [med, ...prev]);
      toast.success("Medication added successfully");
    }
    setFormDialog(false);
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (med: Medication) => {
    const index = medications.findIndex(m => m.id === med.id);
    lastDeletedRef.current = { med, index };
    setMedications(prev => prev.filter(m => m.id !== med.id));
    setDeleteConfirm(null);
    toast.success("Medication deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          if (lastDeletedRef.current) {
            const { med: restored, index: idx } = lastDeletedRef.current;
            setMedications(prev => {
              const copy = [...prev];
              copy.splice(idx, 0, restored);
              return copy;
            });
            toast.success("Medication restored");
          }
        },
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Medications</h1>
          <p className="text-sm text-muted-foreground">Track and manage patient medications</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Medication
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Active Medications</p>
            <p className="text-3xl font-bold mt-1">{activeMeds}</p>
          </div>
          <Pill className="w-10 h-10 text-primary opacity-60" />
        </div>
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Total Tracked</p>
            <p className="text-3xl font-bold mt-1">{medications.length}</p>
          </div>
          <Clock className="w-10 h-10 text-primary opacity-60" />
        </div>
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <p className="text-3xl font-bold mt-1">{lowStock}</p>
          </div>
          <AlertCircle className="w-10 h-10 text-warning opacity-60" />
        </div>
      </div>

      <PrescriptionScanner onMedicationsDetected={handleScannedMeds} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {medications.map((med) => (
          <div key={med.id} className="eldercare-card">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-lg">{med.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground">
                  {med.status}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(med)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(med)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 ml-6">{med.dosage}</p>

            <div className="space-y-1.5 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency:</span>
                <span className="font-medium">{med.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Times:</span>
                <span className="font-medium">{med.times}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next dose:</span>
                <span className="text-primary font-medium">{med.nextDose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prescribed by:</span>
                <span className="font-medium">{med.doctor}</span>
              </div>
            </div>

            <div className="bg-accent/50 rounded-lg p-3 mb-3">
              <p className="text-xs text-primary font-medium">Instructions</p>
              <p className="text-sm">{med.instructions}</p>
            </div>

            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="text-primary font-medium">{med.remaining} of {med.total} pills</span>
            </div>
            <Progress value={(med.remaining / med.total) * 100} className="h-2" />
          </div>
        ))}
      </div>

      {medications.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No medications. Click "Add Medication" to start.</div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formDialog} onOpenChange={setFormDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Medication" : "Add Medication"}</DialogTitle>
            <DialogDescription>{editingId ? "Update medication details" : "Add a new medication to track"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Medicine name *" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Dosage (e.g. 10mg) *" value={formData.dosage} onChange={e => setFormData(p => ({ ...p, dosage: e.target.value }))} />
            <Input placeholder="Frequency (e.g. Twice daily)" value={formData.frequency} onChange={e => setFormData(p => ({ ...p, frequency: e.target.value }))} />
            <Input placeholder="Times (e.g. 08:00 AM, 08:00 PM)" value={formData.times} onChange={e => setFormData(p => ({ ...p, times: e.target.value }))} />
            <Input placeholder="Next dose time" value={formData.nextDose} onChange={e => setFormData(p => ({ ...p, nextDose: e.target.value }))} />
            <Input placeholder="Prescribed by (Doctor)" value={formData.doctor} onChange={e => setFormData(p => ({ ...p, doctor: e.target.value }))} />
            <Input placeholder="Instructions" value={formData.instructions} onChange={e => setFormData(p => ({ ...p, instructions: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Remaining pills" value={formData.remaining} onChange={e => setFormData(p => ({ ...p, remaining: e.target.value }))} />
              <Input type="number" placeholder="Total pills" value={formData.total} onChange={e => setFormData(p => ({ ...p, total: e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleSubmit}>
              {editingId ? "Update Medication" : "Add Medication"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirm?.name} ({deleteConfirm?.dosage})? This action can be undone.
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

export default Medications;
