import { Pill, Clock, AlertCircle, Plus, Pencil, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import PrescriptionScanner from "@/components/PrescriptionScanner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string | null;
  next_dose: string | null;
  doctor: string | null;
  instructions: string | null;
  remaining: number;
  total: number;
  taken: boolean;
  status: string;
}

const emptyForm = { name: "", dosage: "", frequency: "", times: "", nextDose: "", doctor: "", instructions: "", remaining: "", total: "" };

const Medications = () => {
  const { isDoctor, selectedPatient } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialog, setFormDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Medication | null>(null);

  const patientId = selectedPatient?.id;

  const fetchMedications = useCallback(async () => {
    if (!patientId) { setMedications([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (!error && data) setMedications(data as Medication[]);
    setLoading(false);
  }, [patientId]);

  useEffect(() => { fetchMedications(); }, [fetchMedications]);

  // Realtime
  useEffect(() => {
    if (!patientId) return;
    const channel = supabase
      .channel("medications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "medications", filter: `patient_id=eq.${patientId}` }, () => {
        fetchMedications();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [patientId, fetchMedications]);

  const activeMeds = medications.filter(m => m.status === "active").length;
  const lowStock = medications.filter(m => m.remaining <= 5).length;

  const handleScannedMeds = async (parsed: { name: string; dosage: string; timing: string; instructions: string }[]) => {
    if (!patientId) return;
    const rows = parsed.map(p => ({
      patient_id: patientId,
      name: p.name,
      dosage: p.dosage,
      frequency: p.timing,
      times: p.timing === "Twice daily" ? "08:00 AM, 08:00 PM" : "08:00 AM",
      next_dose: "8:00 AM",
      doctor: "From Prescription",
      instructions: p.instructions,
    }));
    const { error } = await supabase.from("medications").insert(rows);
    if (error) toast.error("Failed to add scanned medications");
    else { toast.success(`${parsed.length} medication(s) added from scan`); fetchMedications(); }
  };

  const openCreate = () => { setEditingId(null); setFormData(emptyForm); setFormDialog(true); };

  const openEdit = (med: Medication) => {
    setEditingId(med.id);
    setFormData({
      name: med.name, dosage: med.dosage, frequency: med.frequency,
      times: med.times || "", nextDose: med.next_dose || "", doctor: med.doctor || "",
      instructions: med.instructions || "", remaining: String(med.remaining), total: String(med.total),
    });
    setFormDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.dosage) { toast.error("Name and dosage are required"); return; }
    if (editingId) {
      const { error } = await supabase.from("medications").update({
        name: formData.name, dosage: formData.dosage,
        frequency: formData.frequency || "Once daily",
        times: formData.times || null, next_dose: formData.nextDose || null,
        doctor: formData.doctor || null, instructions: formData.instructions || null,
        remaining: Number(formData.remaining) || 30, total: Number(formData.total) || 30,
      }).eq("id", editingId);
      if (error) toast.error("Update failed"); else toast.success("Medication updated");
    } else {
      if (!patientId) { toast.error("No patient selected"); return; }
      const { error } = await supabase.from("medications").insert({
        patient_id: patientId, name: formData.name, dosage: formData.dosage,
        frequency: formData.frequency || "Once daily",
        times: formData.times || null, next_dose: formData.nextDose || null,
        doctor: formData.doctor || null, instructions: formData.instructions || null,
        remaining: Number(formData.remaining) || 30, total: Number(formData.total) || 30,
      });
      if (error) toast.error("Failed to add medication"); else toast.success("Medication added");
    }
    setFormDialog(false); setFormData(emptyForm); setEditingId(null);
    fetchMedications();
  };

  const handleDelete = async (med: Medication) => {
    const { error } = await supabase.from("medications").delete().eq("id", med.id);
    if (error) toast.error("Delete failed"); else toast.success("Medication deleted");
    setDeleteConfirm(null);
    fetchMedications();
  };

  const handleToggleTaken = async (med: Medication) => {
    const { error } = await supabase.from("medications").update({ taken: !med.taken }).eq("id", med.id);
    if (error) toast.error("Update failed"); else toast.success(med.taken ? "Marked as not taken" : "Marked as taken");
    fetchMedications();
  };

  if (!patientId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Pill className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Select a patient to view medications.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Medications</h1>
          <p className="text-sm text-muted-foreground">Track and manage patient medications</p>
        </div>
        {isDoctor && (
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add Medication
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card"><div><p className="text-sm text-muted-foreground">Active Medications</p><p className="text-3xl font-bold mt-1">{activeMeds}</p></div><Pill className="w-10 h-10 text-primary opacity-60" /></div>
        <div className="stat-card"><div><p className="text-sm text-muted-foreground">Total Tracked</p><p className="text-3xl font-bold mt-1">{medications.length}</p></div><Clock className="w-10 h-10 text-primary opacity-60" /></div>
        <div className="stat-card"><div><p className="text-sm text-muted-foreground">Low Stock</p><p className="text-3xl font-bold mt-1">{lowStock}</p></div><AlertCircle className="w-10 h-10 text-warning opacity-60" /></div>
      </div>

      {isDoctor && <PrescriptionScanner onMedicationsDetected={handleScannedMeds} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {medications.map((med) => (
          <div key={med.id} className="eldercare-card">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleTaken(med)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${med.taken ? "bg-success border-success" : "border-muted-foreground hover:border-primary"}`}
                >
                  {med.taken && <Check className="w-3 h-3 text-success-foreground" />}
                </button>
                <Pill className="w-4 h-4 text-primary" />
                <h3 className={`font-semibold text-lg ${med.taken ? "line-through text-muted-foreground" : ""}`}>{med.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground">{med.status}</span>
                {isDoctor && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(med)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(med)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 ml-11">{med.dosage}</p>
            <div className="space-y-1.5 text-sm mb-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Frequency:</span><span className="font-medium">{med.frequency}</span></div>
              {med.times && <div className="flex justify-between"><span className="text-muted-foreground">Times:</span><span className="font-medium">{med.times}</span></div>}
              {med.next_dose && <div className="flex justify-between"><span className="text-muted-foreground">Next dose:</span><span className="text-primary font-medium">{med.next_dose}</span></div>}
              {med.doctor && <div className="flex justify-between"><span className="text-muted-foreground">Prescribed by:</span><span className="font-medium">{med.doctor}</span></div>}
            </div>
            {med.instructions && (
              <div className="bg-accent/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-primary font-medium">Instructions</p>
                <p className="text-sm">{med.instructions}</p>
              </div>
            )}
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="text-primary font-medium">{med.remaining} of {med.total} pills</span>
            </div>
            <Progress value={(med.remaining / med.total) * 100} className="h-2" />
          </div>
        ))}
      </div>

      {!loading && medications.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No medications. {isDoctor ? 'Click "Add Medication" to start.' : ""}</div>
      )}

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
            <Button className="w-full" onClick={handleSubmit}>{editingId ? "Update Medication" : "Add Medication"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete {deleteConfirm?.name} ({deleteConfirm?.dosage})?</AlertDialogDescription>
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

export default Medications;
