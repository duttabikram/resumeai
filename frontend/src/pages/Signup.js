import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Crown, Mail } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
  const res = await signup(email, password, name);
  toast.success(res.message || "Check your email to verify your account");
  navigate("/login");
} catch (error) {
  toast.error(error.response?.data?.detail || "Signup failed");
} finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground flex items-center justify-center px-6">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-white">
            <Crown className="w-8 h-8 text-sky-400" />
            <span className="text-2xl font-bold" style={{ fontFamily: "Outfit" }}>
              PortfolioAI
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-900/40 p-8 backdrop-blur">
          <div className="mb-6 text-center">
            <h1
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "Outfit" }}
            >
              Create Account
            </h1>
            <p className="text-slate-400 text-sm">
              Get started with your professional portfolio
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="signup-name-input"
                className="mt-1 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="signup-email-input"
                className="mt-1 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                data-testid="signup-password-input"
                className="mt-1 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold"
              disabled={loading}
              data-testid="signup-submit-btn"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-500 uppercase">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full border-slate-700 text-white hover:bg-slate-800"
            onClick={handleGoogleSignup}
            data-testid="signup-google-btn"
          >
            <Mail className="mr-2 w-4 h-4" />
            Continue with Google
          </Button>

          {/* Footer text */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-sky-400 hover:underline"
              data-testid="signup-login-link"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
