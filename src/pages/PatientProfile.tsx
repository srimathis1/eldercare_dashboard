import { Phone, Mail, MapPin, FileText, Activity, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const PatientProfile = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patient Profile</h1>
          <p className="text-sm text-muted-foreground">View and manage patient information</p>
        </div>
        <Button className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="eldercare-card">
          <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-primary">MJ</span>
            </div>
            <h3 className="text-xl font-semibold">Margaret Johnson</h3>
            <p className="text-sm text-muted-foreground">Age: 78 | Female</p>
            <span className="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
              Blood Type: O+
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-primary mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-primary mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">margaret.j@email.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">123 Elder Care Lane, Springfield, IL 62701</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-destructive/10 rounded-lg p-4">
            <p className="text-xs text-destructive font-medium">Emergency Contact</p>
            <p className="text-sm font-semibold mt-1">Sarah Johnson (Daughter)</p>
            <p className="text-sm text-muted-foreground">+1 (555) 987-6543</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="eldercare-card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Medical History</h2>
            </div>
            <div className="space-y-4">
              {[
                { condition: "Hypertension", date: "15/3/2020" },
                { condition: "Type 2 Diabetes", date: "22/8/2019" },
                { condition: "Arthritis", date: "10/11/2018" },
              ].map((item) => (
                <div key={item.condition} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{item.condition}</p>
                    <p className="text-xs text-muted-foreground">Diagnosed: {item.date}</p>
                  </div>
                  <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground">
                    Active
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-warning/10 rounded-lg p-4">
              <p className="font-medium mb-2">Allergies</p>
              <div className="flex gap-2">
                <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground">
                  Penicillin
                </span>
                <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground">
                  Shellfish
                </span>
              </div>
            </div>
          </div>

          <div className="eldercare-card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Recent Vital Signs</h2>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
              <span>📅</span> 2025-09-28
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Heart Rate</p>
                <p className="text-lg font-semibold">72 bpm</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blood Pressure</p>
                <p className="text-lg font-semibold">138/85</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="text-lg font-semibold">98.4°F</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
