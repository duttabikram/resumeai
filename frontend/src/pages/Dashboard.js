import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await axios.get(`${API}/portfolios`, {
        withCredentials: true,
      });
      setPortfolios(response.data);
    } catch (error) {
      toast.error("Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (portfolioId) => {
    try {
      await axios.delete(`${API}/portfolios/${portfolioId}`, {
        withCredentials: true,
      });
      toast.success("Portfolio deleted");
      fetchPortfolios();
    } catch (error) {
      toast.error("Failed to delete portfolio");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />

      {/* Navbar */}
       <nav className="relative z-20 fixed top-0 left-0 right-0 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Crown className="w-6 h-6 text-sky-400" />
            <span style={{ fontFamily: "Outfit" }}>PortfolioAI</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.subscription_plan === "free" && (
              <Link to="/pricing">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-white hover:bg-slate-800 gap-2"
                >
                  <Crown className="w-4 h-4" /> Upgrade
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-3">
  {user?.subscription_plan === "pro" && (
    <Badge className="bg-yellow-400/15 text-yellow-300 font-semibold border border-yellow-400/30 px-2 py-0.5 rounded-md">
      Pro
    </Badge>
  )}

  <Link to="/settings">
    <Button
      variant="ghost"
      size="icon"
      className="text-slate-300 bg-white/5 backdrop-blur border border-white/10 rounded-lg
                 hover:text-white hover:bg-white/10 hover:border-sky-400/40
                 transition-all duration-300 hover:shadow-[0_0_12px_rgba(56,189,248,0.35)]"
    >
      <SettingsIcon className="w-4 h-4" />
    </Button>
  </Link>

  <Button
    variant="ghost"
    size="icon"
    className="text-slate-300 bg-white/5 backdrop-blur border border-white/10 rounded-lg
               hover:text-red-400 hover:bg-white/10 hover:border-red-400/40
               transition-all duration-300 hover:shadow-[0_0_12px_rgba(248,113,113,0.35)]"
    onClick={handleLogout}
  >
    <LogOut className="w-4 h-4" />
  </Button>
</div>

          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h1
              className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2"
              style={{ fontFamily: "Outfit" }}
            >
              My Portfolios
            </h1>
            <p className="text-slate-400">
              {user?.subscription_plan === "free"
                ? "1 portfolio on Free plan"
                : "Unlimited portfolios on Pro plan"}
            </p>
          </div>
          <Link to="/portfolio/create">
            <Button className="bg-sky-500 hover:bg-sky-400 text-black font-semibold gap-2">
              <Plus className="w-4 h-4" /> Create Portfolio
            </Button>
          </Link>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-8 w-8 border-4 border-sky-400 border-t-transparent rounded-full" />
          </div>
        ) : portfolios.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/40 p-12 backdrop-blur text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mb-4 flex items-center justify-center">
              <Crown className="w-10 h-10 text-slate-400" />
            </div>
            <h3
              className="text-xl font-semibold text-white mb-2"
              style={{ fontFamily: "Outfit" }}
            >
              No portfolios yet
            </h3>
            <p className="text-slate-400 mb-6">
              Create your first portfolio to get started
            </p>
            <Link to="/portfolio/create">
              <Button className="bg-sky-500 hover:bg-sky-400 text-black font-semibold gap-2">
                <Plus className="w-4 h-4" /> Create Your First Portfolio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.portfolio_id}
                className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur hover:bg-slate-900/60 transition-colors group rounded-2xl bg-slate-900/40 p-6 backdrop-blur transition-all duration-300  hover:bg-slate-900/70 hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-500/10 border border-white/5 hover:border-sky-400/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold text-white mb-1"
                      style={{ fontFamily: "Outfit" }}
                    >
                      {portfolio.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-1">
                      {portfolio.role || "No role set"}
                    </p>
                  </div>
                  {portfolio.is_published && (
                    <Badge className="border border-emerald-400/30 bg-emerald-500/10 text-emerald-400">
                     Published
                    </Badge>
                  )}
                  {!portfolio.is_published && (
                    <Badge className="bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                     Draft
                    </Badge>

                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <span className="capitalize">{portfolio.template}</span>
                  <span>•</span>
                  <span>{portfolio.projects?.length || 0} projects</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/portfolio/edit/${portfolio.portfolio_id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-white hover:bg-slate-800 gap-2"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </Button>
                  </Link>

                  {portfolio.is_published && (
                    <a
                      href={`/p/${portfolio.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-white hover:bg-slate-800 gap-3"
                      >
                        <ExternalLink className="w-4 h-4" /> View
                      </Button>
                    </a>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(portfolio.portfolio_id)}
                    className="text-slate-300 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Free plan banner */}
        {user?.subscription_plan === "free" && portfolios.length >= 1 && (
          <div className="mt-10 rounded-2xl bg-slate-900/40 p-6 backdrop-blur flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3
                className="text-lg font-semibold text-white mb-1"
                style={{ fontFamily: "Outfit" }}
              >
                Upgrade to Pro for Unlimited Portfolios
              </h3>
              <p className="text-sm text-slate-400">
                Get AI-powered content generation, all templates, and remove
                watermarks.
              </p>
            </div>
            <Link to="/pricing">
              <Button className="bg-sky-500 hover:bg-sky-400 text-black font-semibold gap-2">
                <Crown className="w-4 h-4" /> Upgrade Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
