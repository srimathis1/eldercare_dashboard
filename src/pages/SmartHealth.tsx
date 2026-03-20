import { TrendingUp, Sparkles, CheckCircle, Heart, Activity, Droplets, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

function generateVitalPoint(base: number, variance: number) {
  return Math.round(base + (Math.random() - 0.5) * variance);
}

const recommendations = [
  {
    title: "Excellent Medication Compliance",
    priority: "high",
    description: "Patient shows outstanding adherence to prescribed medications with 97% average compliance rate.",
    action: "Continue current routine",
  },
  {
    title: "Blood Pressure Monitoring",
    priority: "medium",
    description: "Blood pressure readings are slightly elevated. Consider more frequent monitoring.",
    action: "Schedule follow-up with cardiologist",
  },
  {
    title: "Physical Activity",
    priority: "low",
    description: "Based on vitals trend, consider incorporating light daily exercise routine.",
    action: "Discuss exercise plan with healthcare provider",
  },
];

const priorityClass: Record<string, string> = {
  high: "bg-primary text-primary-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-success text-success-foreground",
};

interface VitalDataPoint {
  time: string;
  value: number;
}

const SmartHealth = () => {
  const [heartRate, setHeartRate] = useState(72);
  const [systolic, setSystolic] = useState(138);
  const [diastolic, setDiastolic] = useState(85);
  const [oxygenLevel, setOxygenLevel] = useState(97);
  const [temperature, setTemperature] = useState(98.4);
  const [heartHistory, setHeartHistory] = useState<VitalDataPoint[]>([]);
  const [bpHistory, setBpHistory] = useState<VitalDataPoint[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const updateVitals = useCallback(() => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newHR = generateVitalPoint(72, 8);
    const newSys = generateVitalPoint(138, 10);
    const newDia = generateVitalPoint(85, 6);
    setHeartRate(newHR);
    setSystolic(newSys);
    setDiastolic(newDia);
    setOxygenLevel(generateVitalPoint(97, 2));
    setTemperature(+(98.4 + (Math.random() - 0.5) * 0.6).toFixed(1));
    setHeartHistory(prev => [...prev.slice(-19), { time: now, value: newHR }]);
    setBpHistory(prev => [...prev.slice(-19), { time: now, value: newSys }]);
  }, []);

  useEffect(() => {
    // Initialize with some history
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
        <Button
          className="gap-2"
          variant={isMonitoring ? "destructive" : "default"}
          onClick={() => setIsMonitoring(p => !p)}
        >
          <Activity className="w-4 h-4" />
          {isMonitoring ? "Pause Monitoring" : "Resume Monitoring"}
        </Button>
      </div>

      {/* Live Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="eldercare-card text-center">
          <Heart className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Heart Rate</p>
          <p className="text-3xl font-bold mt-1">{heartRate}</p>
          <p className="text-xs text-muted-foreground">bpm</p>
          <span className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
            getHRStatus() === "Normal" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
          }`}>{getHRStatus()}</span>
        </div>
        <div className="eldercare-card text-center">
          <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Blood Pressure</p>
          <p className="text-3xl font-bold mt-1">{systolic}/{diastolic}</p>
          <p className="text-xs text-muted-foreground">mmHg</p>
          <span className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
            getBPStatus() === "Normal" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
          }`}>{getBPStatus()}</span>
        </div>
        <div className="eldercare-card text-center">
          <Droplets className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Oxygen Level</p>
          <p className="text-3xl font-bold mt-1">{oxygenLevel}%</p>
          <p className="text-xs text-muted-foreground">SpO₂</p>
          <span className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
            getO2Status() === "Normal" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
          }`}>{getO2Status()}</span>
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
          <span className="text-sm text-muted-foreground">
            Health trend: <span className="font-semibold text-foreground underline">improving</span>
          </span>
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
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${priorityClass[rec.priority]}`}>
                  {rec.priority}
                </span>
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
    </div>
  );
};

export default SmartHealth;
