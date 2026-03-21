import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, LogIn } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("doctor");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    const success = login(email, password, role);
    if (!success) {
      setError("Invalid credentials for the selected role");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ElderCare</h1>
          <p className="text-muted-foreground mt-1">AI-Powered Eldercare Monitoring</p>
        </div>

        <form onSubmit={handleSubmit} className="eldercare-card space-y-4">
          <h2 className="text-xl font-semibold text-center">Sign In</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="caregiver">Caregiver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input
              type="email"
              className="mt-1"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <Input
              type="password"
              className="mt-1"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1 pt-2 border-t border-border">
            <p className="font-medium">Demo Credentials</p>
            <p>Doctor: doctor@eldercare.com / doctor123</p>
            <p>Caregiver: caregiver@eldercare.com / caregiver123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
