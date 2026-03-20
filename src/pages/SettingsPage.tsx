import { Settings, User, Bell, Shield, Palette, Globe, Volume2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifMed, setNotifMed] = useState(true);
  const [notifApt, setNotifApt] = useState(true);
  const [notifAlert, setNotifAlert] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@eldercare.com",
    phone: "+1 (555) 000-1234",
    role: "Caregiver / Administrator",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );

  const handleSave = () => toast.success("Settings saved successfully!");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex gap-6">
        <div className="w-48 space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="eldercare-card space-y-4">
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">AU</span>
                </div>
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Role</label>
                  <Input value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} />
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="eldercare-card space-y-5">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              {[
                { label: "Medication Reminders", desc: "Get notified when medications are due", enabled: notifMed, toggle: () => setNotifMed(p => !p) },
                { label: "Appointment Alerts", desc: "Reminders for upcoming appointments", enabled: notifApt, toggle: () => setNotifApt(p => !p) },
                { label: "Urgent Health Alerts", desc: "Critical health notifications", enabled: notifAlert, toggle: () => setNotifAlert(p => !p) },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{n.label}</p>
                    <p className="text-sm text-muted-foreground">{n.desc}</p>
                  </div>
                  <Toggle enabled={n.enabled} onToggle={n.toggle} />
                </div>
              ))}
              <Button onClick={handleSave}>Save Preferences</Button>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="eldercare-card space-y-5">
              <h2 className="text-lg font-semibold">App Preferences</h2>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">Voice Assistant</p>
                    <p className="text-sm text-muted-foreground">Enable text-to-speech responses</p>
                  </div>
                </div>
                <Toggle enabled={voiceEnabled} onToggle={() => setVoiceEnabled(p => !p)} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                  </div>
                </div>
                <Toggle enabled={darkMode} onToggle={() => setDarkMode(p => !p)} />
              </div>
              <div className="flex items-center gap-2 py-2">
                <Globe className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">English (US)</p>
                </div>
              </div>
              <Button onClick={handleSave}>Save Preferences</Button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="eldercare-card space-y-4">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              <div>
                <label className="text-sm text-muted-foreground">Current Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">New Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Confirm New Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button onClick={() => toast.success("Password updated successfully!")}>Update Password</Button>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground mb-2">Add an extra layer of security</p>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
