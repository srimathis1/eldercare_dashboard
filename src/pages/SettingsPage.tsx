import { Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="eldercare-card">
        <p className="text-muted-foreground">Settings page coming soon.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
