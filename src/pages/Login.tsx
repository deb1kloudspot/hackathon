import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    if (email && password) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const handleGuestLogin = () => {
    toast.success("Logged in as guest");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen rainbow-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-glow-purple/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-glow-cyan/30 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Login card */}
      <div className="relative w-full max-w-md">
        {/* Rainbow glow border effect */}
        <div className="absolute -inset-0.5 rainbow-gradient rounded-3xl blur opacity-75 animate-pulse-glow" />
        
        {/* Glass card */}
        <div className="relative glass-strong rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Logo className="scale-125" />
            </div>
            <h1 className="text-3xl font-bold mt-4">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              Find your nearest empty parking slot in seconds
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-primary"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-cyan"
            >
              Login to SmartPark
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-border/50 hover:bg-secondary"
            onClick={handleGuestLogin}
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
