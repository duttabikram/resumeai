import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, ArrowLeft, User, Mail, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />

      {/* Navbar */}
       <nav className="relative z-20 fixed top-0 left-0 right-0 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" data-testid="back-to-dashboard-btn">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-[rgb(var(--brand-primary))]" />
              <span className="text-xl font-bold" style={{ fontFamily: "Outfit" }}>
                Settings
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <h1
          className="text-4xl md:text-5xl font-bold tracking-tight mb-10 text-white"
          style={{ fontFamily: "Outfit" }}
        >
          Account Settings
        </h1>

        <div className="space-y-8">
          {/* Profile Section */}
          <Card className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 rounded-2xl bg-slate-900/40 p-6 backdrop-blur hover:bg-slate-900/60 transition-colors group rounded-2xl bg-slate-900/40 p-6 backdrop-blur transition-all duration-300  hover:bg-slate-900/70 hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-500/10 border border-white/5 hover:border-sky-400/30" data-testid="profile-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white" style={{ fontFamily: "Outfit" }}>
                <User className="w-5 h-5 text-sky-400" /> Profile Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Name</label>
                <p className="text-lg text-white">{user?.name || "—"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400">Email</label>
                <p className="text-lg flex items-center gap-2 text-white">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user?.email || "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card className="bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 rounded-2xl bg-slate-900/40 p-6 backdrop-blur hover:bg-slate-900/60 transition-colors group rounded-2xl bg-slate-900/40 p-6 backdrop-blur transition-all duration-300  hover:bg-slate-900/70 hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-500/10 border border-white/5 hover:border-sky-400/30" data-testid="subscription-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white" style={{ fontFamily: "Outfit" }}>
                <CreditCard className="w-5 h-5 text-sky-400" /> Subscription
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-lg font-medium mb-2 text-white">
                    Current Plan:{" "}
                    <Badge
                      className={
                        user?.subscription_plan === "pro"
                          ? "bg-[rgb(var(--brand-accent))] text-white"
                          : "bg-slate-700 text-white"
                      }
                      data-testid="subscription-badge"
                    >
                      {user?.subscription_plan === "pro" ? "Pro" : "Free"}
                    </Badge>
                  </p>

                  {user?.subscription_plan === "free" && (
                    <p className="text-sm text-slate-400">
                      Upgrade to Pro for unlimited portfolios and AI features
                    </p>
                  )}

                  {user?.subscription_plan === "pro" && (
                    <p className="text-sm text-slate-400">
                      You have access to all Pro features
                    </p>
                  )}
                </div>

                {user?.subscription_plan === "free" && (
                  <Link to="/pricing">
                    <Button
                      className="bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary))]/90 gap-2 text-white"
                      data-testid="upgrade-btn"
                    >
                      <Crown className="w-4 h-4" /> Upgrade to Pro
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
