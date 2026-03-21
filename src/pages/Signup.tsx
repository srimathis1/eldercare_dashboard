import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, UserPlus } from "lucide-react";

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup = ({ onSwitchToLogin }: SignupProps) => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("doctor");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = signup(name, email, password, role);
    if (!result.success) {
      setError(result.error || "Signup failed");
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
          <p className="text-muted-foreground mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="eldercare-card space-y-4">
          <h2 className="text-xl font-semibold text-center">Sign Up</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <Input className="mt-1" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input type="email" className="mt-1" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <Input type="password" className="mt-1" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <Select value={role} onValueChange={v => setRole(v as UserRole)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="caregiver">Caregiver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full gap-2">
            <UserPlus className="w-4 h-4" />
            Create Account
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
