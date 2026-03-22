import { useState } from "react";
import { useAuth, Patient } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, Plus, Eye, Loader2, User, Mail } from "lucide-react";
import { toast } from "sonner";

const Patients = () => {
  const { user, patients, selectPatient, refreshPatients } = useAuth();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "female", caregiverEmail: "" });

  const handleView = (patient: Patient) => {
    selectPatient(patient);
    navigate("/");
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.age) {
      toast.error("Patient name and age are required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("patients").insert({
      name: form.name.trim(),
      age: parseInt(form.age),
      gender: form.gender,
      doctor_id: user!.id,
      caregiver_email: form.caregiverEmail.trim().toLowerCase() || null,
    });
    if (error) {
      toast.error("Failed to create patient: " + error.message);
    } else {
      toast.success("Patient created");
      await refreshPatients();
      setFormOpen(false);
      setForm({ name: "", age: "", gender: "female", caregiverEmail: "" });
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground text-sm">{patients.length} patient{patients.length !== 1 ? "s" : ""} under your care</p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> Add Patient
        </Button>
      </div>

      {patients.length === 0 ? (
        <div className="eldercare-card text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No patients yet. Add your first patient to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((pt) => (
            <div key={pt.id} className="eldercare-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{pt.name}</p>
                    <p className="text-sm text-muted-foreground">{pt.age} yrs • {pt.gender}</p>
                  </div>
                </div>
              </div>
              {pt.caregiver_email && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Mail className="w-3 h-3" />
                  <span>Caregiver: {pt.caregiver_email}</span>
                  {pt.caregiver_id ? (
                    <span className="text-success font-medium">• Linked</span>
                  ) : (
                    <span className="text-warning font-medium">• Pending</span>
                  )}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleView(pt)}>
                <Eye className="w-3.5 h-3.5" /> View Dashboard
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
            <DialogDescription>Create a patient profile and optionally assign a caregiver by email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Patient name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Age *" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.gender}
                onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input
              type="email"
              placeholder="Caregiver email (optional)"
              value={form.caregiverEmail}
              onChange={e => setForm(p => ({ ...p, caregiverEmail: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              If you enter a caregiver email, the patient will auto-link when that caregiver signs up.
            </p>
            <Button className="w-full" onClick={handleCreate} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Patient
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;
