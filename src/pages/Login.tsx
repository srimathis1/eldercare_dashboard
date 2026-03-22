import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, LogIn, Loader2 } from "lucide-react";

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login = ({ onSwitchToSignup }: LoginProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
    setSubmitting(false);
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

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-md border border-border p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center">Sign In</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input type="email" className="mt-1" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <Input type="password" className="mt-1" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Sign In
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <button type="button" onClick={onSwitchToSignup} className="text-primary font-medium hover:underline">
              Create Account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
