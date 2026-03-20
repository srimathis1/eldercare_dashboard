import { Pill, Clock, AlertCircle, Mic, Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const medications = [
  {
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Twice daily",
    times: "08:00 AM, 08:00 PM",
    nextDose: "8:00 PM",
    doctor: "Dr. Sarah Williams",
    instructions: "Take with food",
    remaining: 25,
    total: 30,
    status: "active",
  },
  {
    name: "Metformin",
    dosage: "500mg",
    frequency: "Three times daily",
    times: "08:00 AM, 12:00 PM, 06:00 PM",
    nextDose: "6:00 PM",
    doctor: "Dr. Sarah Williams",
    instructions: "Take with meals",
    remaining: 30,
    total: 30,
    status: "active",
  },
  {
    name: "Aspirin",
    dosage: "81mg",
    frequency: "Once daily",
    times: "08:00 AM",
    nextDose: "8:00 AM",
    doctor: "Dr. Sarah Williams",
    instructions: "Take with water",
    remaining: 20,
    total: 30,
    status: "active",
  },
];

const Medications = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Medications</h1>
          <p className="text-sm text-muted-foreground">Track and manage patient medications</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Medication
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Active Medications</p>
            <p className="text-3xl font-bold mt-1">5</p>
          </div>
          <Pill className="w-10 h-10 text-primary opacity-60" />
        </div>
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Due Today</p>
            <p className="text-3xl font-bold mt-1">3</p>
          </div>
          <Clock className="w-10 h-10 text-primary opacity-60" />
        </div>
        <div className="stat-card">
          <div>
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <p className="text-3xl font-bold mt-1">1</p>
          </div>
          <AlertCircle className="w-10 h-10 text-warning opacity-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {medications.map((med) => (
          <div key={med.name} className="eldercare-card">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-lg">{med.name}</h3>
              </div>
              <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground">
                {med.status}
              </span>
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
            <Progress value={(med.remaining / med.total) * 100} className="h-2 mb-4" />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2">
                <Mic className="w-4 h-4" />
                Enable Voice Reminder
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Camera className="w-4 h-4" />
                Upload Photo
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Medications;
