import { TrendingUp, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const SmartHealth = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Smart Health</h1>
          </div>
          <p className="text-sm text-muted-foreground">Personalized health analysis powered by AI</p>
        </div>
        <Button className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Insights
        </Button>
      </div>

      <div className="eldercare-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Overall Health Score</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-5xl font-bold">85</span>
          <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-success text-success-foreground">
            Good
          </span>
          <span className="text-sm text-muted-foreground">
            Health trend: <span className="font-semibold text-foreground underline">improving</span>
          </span>
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
