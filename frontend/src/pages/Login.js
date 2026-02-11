import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Crown, Mail } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
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
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm">
              Login to continue building your portfolio
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                data-testid="login-email-input"
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
                data-testid="login-password-input"
                className="mt-1 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold"
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? "Logging in..." : "Login"}
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
            onClick={handleGoogleLogin}
            data-testid="login-google-btn"
          >
            <Mail className="mr-2 w-4 h-4" />
            Continue with Google
          </Button>

          {/* Footer text */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-sky-400 hover:underline"
              data-testid="login-signup-link"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
