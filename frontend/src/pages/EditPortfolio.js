import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Crown,
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Globe,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EditPortfolio() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API}/portfolios/${id}`, {
        withCredentials: true,
      });
      setFormData(response.data);
    } catch (error) {
      toast.error("Failed to load portfolio");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/portfolios/${id}`, formData, {
        withCredentials: true,
      });
      toast.success("Portfolio saved!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.is_published) {
      try {
        const response = await axios.post(
          `${API}/portfolios/${id}/publish`,
          {},
          { withCredentials: true }
        );
        toast.success("Portfolio published!");
        setFormData((prev) => ({
          ...prev,
          is_published: true,
          slug: response.data.slug,
        }));
      } catch (error) {
        toast.error("Failed to publish");
      }
    }
  };

  const generateAIContent = async (type) => {
    if (user?.subscription_plan === "free") {
      toast.error("AI features require Pro subscription");
      return;
    }

    setAiGenerating(true);
    try {
      let context = "";
      if (type === "about") {
        context = `Name: ${formData.name}, Role: ${formData.role}, Skills: ${formData.skills.join(
          ", "
        )}`;
      } else if (type === "skills") {
        context = formData.skills.join(", ");
      }

      const response = await axios.post(
        `${API}/ai/generate`,
        { context, type },
        { withCredentials: true }
      );

      if (type === "about") {
        setFormData((prev) => ({ ...prev, bio: response.data.content }));
      }
      toast.success("AI content generated!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "AI generation failed");
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-sky-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />

      {/* Navbar */}
       <nav className="relative z-20 fixed top-0 left-0 right-0 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <Crown className="w-6 h-6 text-sky-400" />
              <span style={{ fontFamily: "Outfit" }}>Edit Portfolio</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="outline"
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
            {formData?.is_published ? (
              <a
                href={`/p/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  <Eye className="w-4 h-4 mr-2" /> View
                </Button>
              </a>
            ) : (
              <Button
                onClick={handlePublish}
                className="bg-sky-500 hover:bg-sky-400 text-black font-semibold"
              >
                <Globe className="w-4 h-4 mr-2" /> Publish
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20 space-y-8">
        {/* Basic Info */}
        <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
          <h2
            className="text-xl font-semibold text-white mb-4"
            style={{ fontFamily: "Outfit" }}
          >
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Portfolio Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-slate-950/60 border-slate-800 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Role/Title</Label>
              <Input
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                className="bg-slate-950/60 border-slate-800 text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">Bio</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => generateAIContent("about")}
                  disabled={aiGenerating || user?.subscription_plan === "free"}
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {aiGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={6}
                className="bg-slate-950/60 border-slate-800 text-white"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
          <h2
            className="text-xl font-semibold text-white mb-4"
            style={{ fontFamily: "Outfit" }}
          >
            Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {formData.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-800 text-slate-200 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
          <h2
            className="text-xl font-semibold text-white mb-4"
            style={{ fontFamily: "Outfit" }}
          >
            Projects
          </h2>

          <div className="space-y-4">
            {formData.projects?.map((project, index) => (
              <div
                key={index}
                className="rounded-xl bg-slate-950/60 p-4 space-y-2"
              >
                <h4 className="font-medium text-white">{project.title}</h4>
                <p className="text-sm text-slate-400">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack?.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template */}
        <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
          <h2
            className="text-xl font-semibold text-white mb-4"
            style={{ fontFamily: "Outfit" }}
          >
            Template & Theme
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {["minimal", "modern", "creative"].map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, template }))}
                className={`p-4 rounded-xl text-center capitalize transition-colors ${
                  formData.template === template
                    ? "bg-sky-500/20 text-sky-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-900/60"
                } ${
                  template !== "minimal" && user?.subscription_plan === "free"
                    ? "opacity-50"
                    : ""
                }`}
                disabled={
                  template !== "minimal" && user?.subscription_plan === "free"
                }
              >
                {template}
                {template !== "minimal" &&
                  user?.subscription_plan === "free" && (
                    <span className="block text-xs text-slate-400 mt-1">
                      Pro
                    </span>
                  )}
              </button>
            ))}
          </div>

          <div>
            <Label className="text-slate-300">Theme Color</Label>
            <Input
              type="color"
              value={formData.theme_color}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  theme_color: e.target.value,
                }))
              }
              className="h-12 w-full bg-transparent border-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
