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
  Plus,
  Eye,
  Sparkles,
  Globe,
  Trash2
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
  const [skillInput, setSkillInput] = useState("");

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

  const addExperience = () => {
  setFormData((prev) => ({
    ...prev,
    experience: [
      ...(prev.experience || []),
      { title: "", company: "", duration: "", description: "" },
    ],
  }));
};

const removeExperience = (index) => {
  setFormData((prev) => ({
    ...prev,
    experience: prev.experience.filter((_, i) => i !== index),
  }));
};

const addEducation = () => {
  setFormData((prev) => ({
    ...prev,
    education: [
      ...(prev.education || []),
      { degree: "", institution: "", year: "" },
    ],
  }));
};

const removeEducation = (index) => {
  setFormData((prev) => ({
    ...prev,
    education: prev.education.filter((_, i) => i !== index),
  }));
};

const updateExperience = (index, field, value) => {
  setFormData((prev) => {
    const experience = [...prev.experience];
    experience[index] = { ...experience[index], [field]: value };
    return { ...prev, experience };
  });
};

const updateEducation = (index, field, value) => {
  setFormData((prev) => {
    const education = [...prev.education];
    education[index] = { ...education[index], [field]: value };
    return { ...prev, education };
  });
};

  const addSkill = () => {
  if (!skillInput.trim()) return;

  setFormData((prev) => ({
    ...prev,
    skills: [...prev.skills, skillInput.trim()],
  }));

  setSkillInput("");
};

const removeSkill = (index) => {
  setFormData((prev) => ({
    ...prev,
    skills: prev.skills.filter((_, i) => i !== index),
  }));
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
              <Button variant="ghost" size="icon" className="text-slate-300 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:text-white hover:bg-white/10 hover:border-sky-400/40 transition-all duration-300 hover:shadow-[0_0_12px_rgba(56,189,248,0.35)]">
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

          <div className="flex gap-2 mb-4">
  <Input
    placeholder="Add skill"
    value={skillInput}
    onChange={(e) => setSkillInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSkill();
      }
    }}
    className="bg-slate-950/60 border-slate-800 text-white"
  />

  <Button
    type="button"
    onClick={addSkill}
    className="bg-sky-500 hover:bg-sky-400 text-black"
  >
    <Plus className="w-4 h-4" />Add
  </Button>
</div>

<div className="flex flex-wrap gap-2">
  {formData.skills?.map((skill, index) => (
    <span
      key={index}
      className="px-3 py-1 bg-slate-800 text-slate-200 rounded-full text-sm flex items-center gap-2"
    >
      {skill}
      <button
        onClick={() => removeSkill(index)}
        className="text-slate-400 hover:text-white"
      >
        ×
      </button>
    </span>
  ))}
</div>
        </div>

        {/* Projects */}
        <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-semibold text-white mb-4"
            style={{ fontFamily: "Outfit" }}
          >
            Projects
          </h2>
<Button
  type="button"
  onClick={() =>
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "", description: "", tech_stack: [],  link: "",
        github_link: "", },
      ],
    }))
  }
  className="bg-sky-500 hover:bg-sky-400 text-black mb-4"
>
 <Plus className="w-4 h-4 mr-2" /> Add
</Button>
</div>
          <div className="space-y-4">
{formData.projects?.map((project, index) => (
  <div
    key={index}
    className="rounded-xl bg-slate-950/60 p-4 space-y-3 
    border border-white/5 
    hover:border-sky-400/30 
    transition-all"
  >

    {/* Header */}
    <div className="flex items-center justify-between">
      <span className="text-sm text-white font-medium">
        Project {index + 1}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const updated = formData.projects.filter((_, i) => i !== index);
          setFormData({ ...formData, projects: updated });
        }}
        className="text-slate-300 hover:text-red-400"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>

    {/* Project Title */}
    <Input
      value={project.title}
      placeholder="Project Title"
      onChange={(e) => {
        const updated = [...formData.projects];
        updated[index].title = e.target.value;
        setFormData({ ...formData, projects: updated });
      }}
      className="bg-slate-900/60 border-slate-800 text-white"
    />

    {/* Description */}
    <Textarea
      value={project.description}
      placeholder="Project Description"
      onChange={(e) => {
        const updated = [...formData.projects];
        updated[index].description = e.target.value;
        setFormData({ ...formData, projects: updated });
      }}
      rows={3}
      className="bg-slate-900/60 border-slate-800 text-white"
    />

    {/* Tech Stack */}
    <Input
      value={project.tech_stack?.join(", ")}
      placeholder="Tech Stack (comma separated)"
      onChange={(e) => {
        const updated = [...formData.projects];
        updated[index].tech_stack = e.target.value
          .split(",")
          .map((s) => s.trim());
        setFormData({ ...formData, projects: updated });
      }}
      className="bg-slate-900/60 border-slate-800 text-white"
    />

    {/* GitHub Link */}
<Input
  value={project.github_link || ""}
  placeholder={
    user?.subscription_plan === "free"
      ? "🔒 Upgrade to Pro to add GitHub link"
      : "GitHub Repository Link"
  }
  onChange={(e) => {
    const updated = [...formData.projects];
    updated[index].github_link = e.target.value;
    setFormData({ ...formData, projects: updated });
  }}
  disabled={user?.subscription_plan === "free"}
  className={`bg-slate-900/60 border-slate-800 text-white ${
    user?.subscription_plan === "free"
      ? "opacity-50 cursor-not-allowed"
      : ""
  }`}
/>

    {/* Live Project Link */}
<Input
  value={project.link || ""}
  placeholder={
    user?.subscription_plan === "free"
      ? "🔒 Upgrade to Pro to add project link"
      : "Live Project URL"
  }
  onChange={(e) => {
    const updated = [...formData.projects];
    updated[index].link = e.target.value;
    setFormData({ ...formData, projects: updated });
  }}
  disabled={user?.subscription_plan === "free"}
  className={`bg-slate-900/60 border-slate-800 text-white ${
    user?.subscription_plan === "free"
      ? "opacity-50 cursor-not-allowed"
      : ""
  }`}
/>

  </div>
))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-white">Experience</h2>

    <Button
      type="button"
      onClick={addExperience}
      className="bg-sky-500 hover:bg-sky-400 text-black"
    >
      <Plus className="w-4 h-4 mr-2" /> Add
    </Button>
  </div>

  <div className="space-y-4">
    {formData.experience?.map((exp, index) => (
      <div
        key={index}
        className="rounded-xl bg-slate-950/60 p-4 space-y-3 border border-white/5 hover:border-sky-400/30"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-white font-medium">
            Experience {index + 1}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeExperience(index)}
            className="text-slate-300 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Input
          value={exp.title}
          placeholder="Role"
          onChange={(e) =>
            updateExperience(index, "title", e.target.value)
          }
          className="bg-slate-900/60 border-slate-800 text-white"
        />

        <Input
          value={exp.company}
          placeholder="Company"
          onChange={(e) =>
            updateExperience(index, "company", e.target.value)
          }
          className="bg-slate-900/60 border-slate-800 text-white"
        />

        <Input
          value={exp.duration}
          placeholder="Duration"
          onChange={(e) =>
            updateExperience(index, "duration", e.target.value)
          }
          className="bg-slate-900/60 border-slate-800 text-white"
        />

        <Textarea
          value={exp.description}
          placeholder="Description"
          onChange={(e) =>
            updateExperience(index, "description", e.target.value)
          }
          rows={3}
          className="bg-slate-900/60 border-slate-800 text-white"
        />
      </div>
    ))}
  </div>
</div>

<div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-white">Education</h2>

    <Button
      type="button"
      onClick={addEducation}
      className="bg-sky-500 hover:bg-sky-400 text-black"
    >
      <Plus className="w-4 h-4 mr-2" /> Add
    </Button>
  </div>

  <div className="space-y-4">
    {formData.education?.map((edu, index) => (
      <div
        key={index}
        className="rounded-xl bg-slate-950/60 p-4 space-y-3 border border-white/5 hover:border-sky-400/30"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-white font-medium">
            Education {index + 1}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeEducation(index)}
            className="text-slate-300 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Input
          value={edu.degree}
          placeholder="Degree"
          onChange={(e) =>
            updateEducation(index, "degree", e.target.value)
          }
          className="bg-slate-900/60 border-slate-800 text-white"
        />

        <Input
          value={edu.institution}
          placeholder="Institution"
          onChange={(e) =>
            updateEducation(index, "institution", e.target.value)
          }
          className="bg-slate-900/60 border-slate-800 text-white"
        />

        <Input
          value={edu.year}
          placeholder="Year"
          onChange={(e) =>
            updateEducation(index, "year", e.target.value)
          }
        />
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
              disabled={user?.subscription_plan === "free"}
    className={`h-12 w-full bg-transparent border-slate-800 ${
      user?.subscription_plan === "free" ? "opacity-50 cursor-not-allowed" : ""
    }`}
            />
            {user?.subscription_plan === "free" && (
    <p className="mt-1 text-xs text-slate-400">
      🔒 Upgrade to Pro to customize theme color
    </p>
  )}
          </div>
        </div>
      </div>
    </div>
  );
}
