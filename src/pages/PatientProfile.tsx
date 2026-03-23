import { Phone, Mail, MapPin, FileText, Activity, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PatientProfile = () => {
  const { selectedPatient, isDoctor } = useAuth();
  const [medCount, setMedCount] = useState(0);
  const [aptCount, setAptCount] = useState(0);

  useEffect(() => {
    if (!selectedPatient?.id) return;
    const pid = selectedPatient.id;
    supabase.from("medications").select("id", { count: "exact", head: true }).eq("patient_id", pid).then(({ count }) => setMedCount(count || 0));
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("patient_id", pid).then(({ count }) => setAptCount(count || 0));
  }, [selectedPatient?.id]);

  if (!selectedPatient) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>No patient selected. {isDoctor ? "Go to Patients page to select one." : "Contact your doctor to be assigned."}</p>
      </div>
    );
  }

  const initials = selectedPatient.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patient Profile</h1>
          <p className="text-sm text-muted-foreground">View patient information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="eldercare-card">
          <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-primary">{initials}</span>
            </div>
            <h3 className="text-xl font-semibold">{selectedPatient.name}</h3>
            <p className="text-sm text-muted-foreground">Age: {selectedPatient.age} | {selectedPatient.gender}</p>
            {selectedPatient.blood_type && (
              <span className="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
                Blood Type: {selectedPatient.blood_type}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {selectedPatient.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-1" />
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedPatient.phone}</p></div>
              </div>
            )}
            {selectedPatient.caregiver_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-1" />
                <div><p className="text-xs text-muted-foreground">Caregiver Email</p><p className="text-sm font-medium">{selectedPatient.caregiver_email}</p></div>
              </div>
            )}
            {selectedPatient.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm font-medium">{selectedPatient.address}</p></div>
              </div>
            )}
          </div>

          {selectedPatient.emergency_contact && (
            <div className="mt-6 bg-destructive/10 rounded-lg p-4">
              <p className="text-xs text-destructive font-medium">Emergency Contact</p>
              <p className="text-sm font-semibold mt-1">{selectedPatient.emergency_contact}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="eldercare-card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-primary">{medCount}</p>
                <p className="text-xs text-muted-foreground">Medications</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-primary">{aptCount}</p>
                <p className="text-xs text-muted-foreground">Appointments</p>
              </div>
            </div>
          </div>

          <div className="eldercare-card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Patient Details</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Patient ID</span><span className="font-medium font-mono text-xs">{selectedPatient.id.slice(0, 8)}...</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Gender</span><span className="font-medium capitalize">{selectedPatient.gender}</span></div>
              <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Age</span><span className="font-medium">{selectedPatient.age} years</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Caregiver Linked</span><span className="font-medium">{selectedPatient.caregiver_id ? "Yes" : "No"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
