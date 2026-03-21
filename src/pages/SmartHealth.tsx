import { TrendingUp, Sparkles, CheckCircle, Heart, Activity, Droplets, Thermometer, Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { ResponsiveContainer, Tooltip, Area, AreaChart, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

function generateVitalPoint(base: number, variance: number) {
  return Math.round(base + (Math.random() - 0.5) * variance);
}

const recommendations = [
  { title: "Excellent Medication Compliance", priority: "high", description: "Patient shows outstanding adherence to prescribed medications with 97% average compliance rate.", action: "Continue current routine" },
  { title: "Blood Pressure Monitoring", priority: "medium", description: "Blood pressure readings are slightly elevated. Consider more frequent monitoring.", action: "Schedule follow-up with cardiologist" },
  { title: "Physical Activity", priority: "low", description: "Based on vitals trend, consider incorporating light daily exercise routine.", action: "Discuss exercise plan with healthcare provider" },
];

const priorityClass: Record<string, string> = {
  high: "bg-primary text-primary-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-success text-success-foreground",
};

interface VitalDataPoint { time: string; value: number; }

const DEFAULTS = { heartRate: 72, systolic: 138, diastolic: 85, oxygenLevel: 97, temperature: 98.4 };

const SmartHealth = () => {
  const [heartRate, setHeartRate] = useState(DEFAULTS.heartRate);
  const [systolic, setSystolic] = useState(DEFAULTS.systolic);
  const [diastolic, setDiastolic] = useState(DEFAULTS.diastolic);
  const [oxygenLevel, setOxygenLevel] = useState(DEFAULTS.oxygenLevel);
  const [temperature, setTemperature] = useState(DEFAULTS.temperature);
  const [heartHistory, setHeartHistory] = useState<VitalDataPoint[]>([]);
  const [bpHistory, setBpHistory] = useState<VitalDataPoint[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ heartRate: "", systolic: "", diastolic: "", oxygenLevel: "", temperature: "" });

  const updateVitals = useCallback(() => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newHR = generateVitalPoint(heartRate, 8);
    const newSys = generateVitalPoint(systolic, 10);
    const newDia = generateVitalPoint(diastolic, 6);
    setHeartRate(newHR);
    setSystolic(newSys);
    setDiastolic(newDia);
    setOxygenLevel(generateVitalPoint(oxygenLevel, 2));
    setTemperature(+(temperature + (Math.random() - 0.5) * 0.6).toFixed(1));
    setHeartHistory(prev => [...prev.slice(-19), { time: now, value: newHR }]);
    setBpHistory(prev => [...prev.slice(-19), { time: now, value: newSys }]);
  }, [heartRate, systolic, diastolic, oxygenLevel, temperature]);

  useEffect(() => {
    const init: VitalDataPoint[] = [];
    const initBP: VitalDataPoint[] = [];
    for (let i = 20; i >= 0; i--) {
      const t = new Date(Date.now() - i * 3000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      init.push({ time: t, value: generateVitalPoint(72, 8) });
      initBP.push({ time: t, value: generateVitalPoint(138, 10) });
    }
    setHeartHistory(init);
    setBpHistory(initBP);
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;
    const interval = setInterval(updateVitals, 3000);
    return () => clearInterval(interval);
  }, [isMonitoring, updateVitals]);

  const openEditVitals = () => {
    setEditForm({
      heartRate: String(heartRate), systolic: String(systolic), diastolic: String(diastolic),
      oxygenLevel: String(oxygenLevel), temperature: String(temperature),
    });
    setEditDialog(true);
  };

  const handleSaveVitals = () => {
    const hr = Number(editForm.heartRate); const sys = Number(editForm.systolic);
    const dia = Number(editForm.diastolic); const o2 = Number(editForm.oxygenLevel);
    const temp = Number(editForm.temperature);
    if (!hr || !sys || !dia || !o2 || !temp) { toast.error("All fields are required"); return; }
    setHeartRate(hr); setSystolic(sys); setDiastolic(dia); setOxygenLevel(o2); setTemperature(temp);
    setEditDialog(false);
    toast.success("Vitals updated successfully");
  };

  const handleResetVitals = () => {
    setHeartRate(DEFAULTS.heartRate); setSystolic(DEFAULTS.systolic);
    setDiastolic(DEFAULTS.diastolic); setOxygenLevel(DEFAULTS.oxygenLevel);
    setTemperature(DEFAULTS.temperature);
    setHeartHistory([]); setBpHistory([]);
    toast.success("Vitals reset to defaults");
  };

  const getHRStatus = () => heartRate >= 60 && heartRate <= 100 ? "Normal" : "Abnormal";
  const getBPStatus = () => systolic <= 140 && diastolic <= 90 ? "Normal" : "Elevated";
  const getO2Status = () => oxygenLevel >= 95 ? "Normal" : "Low";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Smart Health Monitoring</h1>
          </div>
          <p className="text-sm text-muted-foreground">Real-time health metrics & AI-powered insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={openEditVitals}>
            <Pencil className="w-4 h-4" />Edit Vitals
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleResetVitals}>
            <RotateCcw className="w-4 h-4" />Reset
          </Button>
          <Button className="gap-2" variant={isMonitoring ? "destructive" : "default"} onClick={() => setIsMonitoring(p => !p)}>
            <Activity className="w-4 h-4" />
            {isMonitoring ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      {/* Live Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="eldercare-card text-center">
          <Heart className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Heart Rate</p>
          <p className="text-3xl font-bold mt-1">{heartRate}</p>
          <p className="text-xs text-muted-foreground">bpm</p>
          <span className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getHRStatus() === "Normal" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>{getHRStatus()}</span>
        </div>
        <div className="eldercare-card text-center">
          <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Blood Pressure</p>
          <p className="text-3xl font-bold mt-1">{systolic}/{diastolic}</p>
          <p className="text-xs text-muted-foreground">mmHg</p>
          <span className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getBPStatus() === "Normal" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>{getBPStatus()}</span>
        </div>
        <div className="eldercare-card text-center">
          <Droplets className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Oxygen Level</p>
          <p className="text-3xl font-bold mt-1">{oxygenLevel}%</p>
          <p className="text-xs text-muted-foreground">SpO₂</p>
          <span className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getO2Status() === "Normal" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>{getO2Status()}</span>
        </div>
        <div className="eldercare-card text-center">
          <Thermometer className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Temperature</p>
          <p className="text-3xl font-bold mt-1">{temperature}°</p>
          <p className="text-xs text-muted-foreground">Fahrenheit</p>
          <span className="mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-success text-success-foreground">Normal</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="eldercare-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-destructive" /> Heart Rate Trend
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={heartHistory}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={false} />
              <YAxis domain={[55, 95]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="hsl(0, 72%, 55%)" fill="url(#hrGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="eldercare-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Blood Pressure Trend
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={bpHistory}>
              <defs>
                <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(201, 90%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(201, 90%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={false} />
              <YAxis domain={[120, 160]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="hsl(201, 90%, 48%)" fill="url(#bpGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health Score */}
      <div className="eldercare-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Overall Health Score</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-5xl font-bold">85</span>
          <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-success text-success-foreground">Good</span>
          <span className="text-sm text-muted-foreground">Health trend: <span className="font-semibold text-foreground underline">improving</span></span>
        </div>
      </div>

      {/* AI Integrations */}
      <div className="eldercare-card mb-6">
        <h2 className="text-lg font-semibold mb-3">AI Integration Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "YOLOv8", desc: "Medication Detection", status: "Ready" },
            { name: "MediaPipe", desc: "Fall / Pose Detection", status: "Ready" },
            { name: "OpenCV", desc: "Video Analytics", status: "Ready" },
          ].map(ai => (
            <div key={ai.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="w-2 h-2 rounded-full bg-success" />
              <div>
                <p className="text-sm font-medium">{ai.name}</p>
                <p className="text-xs text-muted-foreground">{ai.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Personalized Recommendations</h2>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.title} className="eldercare-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{rec.title}</h3>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${priorityClass[rec.priority]}`}>{rec.priority}</span>
              </div>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
              <p className="text-sm mt-1">
                <span className="font-medium">Recommended Action: </span>
                <span className="text-primary cursor-pointer hover:underline">{rec.action}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Vitals Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vital Signs</DialogTitle>
            <DialogDescription>Manually update simulated health metrics</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Heart Rate (bpm)</label>
              <Input type="number" value={editForm.heartRate} onChange={e => setEditForm(p => ({ ...p, heartRate: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Systolic (mmHg)</label>
                <Input type="number" value={editForm.systolic} onChange={e => setEditForm(p => ({ ...p, systolic: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Diastolic (mmHg)</label>
                <Input type="number" value={editForm.diastolic} onChange={e => setEditForm(p => ({ ...p, diastolic: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Oxygen Level (%)</label>
              <Input type="number" value={editForm.oxygenLevel} onChange={e => setEditForm(p => ({ ...p, oxygenLevel: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Temperature (°F)</label>
              <Input type="number" step="0.1" value={editForm.temperature} onChange={e => setEditForm(p => ({ ...p, temperature: e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleSaveVitals}>Save Vitals</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartHealth;
