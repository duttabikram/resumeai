import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Crown,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Github,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function safeParseAIJSON(raw) {
  if (!raw) return null;

  // Remove ```json ``` wrappers if present
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI JSON:", err, cleaned);
    return null;
  }
}

const normalizeUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url; // already ok
  return "https://" + url; // auto-fix
};

export default function CreatePortfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    role: "",
    skills: [],
    projects: [],
    education: [],
    experience: [],
    template: "minimal",
    theme_color: "#4F46E5",
    github_username: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
const [previewImage, setPreviewImage] = useState(null);


  const onDrop = async (acceptedFiles) => {
  if (user?.subscription_plan === "free") {
    toast.error("Resume parsing requires Pro subscription");
    return;
  }

  const file = acceptedFiles[0];
  if (!file) return;

  setResumeLoading(true);

  try {
    const fd = new FormData();
    fd.append("file", file);

    const response = await axios.post(`${API}/ai/extract-resume`, fd, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    const rawAI = response.data?.structured_data;
    const parsed = safeParseAIJSON(rawAI);

    if (!parsed) {
      toast.error("AI returned invalid JSON. Try again.");
      return;
    }

    // ✅ Normalize AI data into your form shape
    setFormData((prev) => ({
      ...prev,
      name: parsed.name || prev.name,
      role: parsed.role || prev.role,
      bio: parsed.bio || prev.bio,

      skills: Array.isArray(parsed.skills) ? parsed.skills : prev.skills,

      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((p) => ({
            title: p.title || "",
            description: p.description || "",
            tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
            link: p.link || "",
            github_link: p.github_link || "",
          }))
        : prev.projects,

      education: Array.isArray(parsed.education)
        ? parsed.education.map((e) => ({
            institution: e.institution || "",
            degree: e.degree || "",
            year: e.year || "",
          }))
        : prev.education,

      experience: Array.isArray(parsed.experience)
        ? parsed.experience.map((ex) => ({
            title: ex.title || "",
            company: ex.company || "",
            duration: ex.duration || "",
            description: ex.description || "",
          }))
        : prev.experience,
    }));

    toast.success("Resume parsed and filled successfully!");
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.detail || "Resume parsing failed");
  } finally {
    setResumeLoading(false);
  }
};

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: resumeLoading, // 👈 disable while loading
  });

const handleImportGithub = async () => {
  if (!formData.github_username) {
    toast.error("Please enter a GitHub username");
    return;
  }

  setGithubLoading(true);
  try {
    const response = await axios.get(
      `${API}/github/repos/${formData.github_username}`,
      { withCredentials: true }
    );

    const importedProjects = response.data.projects.map((p) => {
      // Free users: strip links
      if (user?.subscription_plan === "free") {
        return {
          title: p.title || "",
          description: p.description || "",
          tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
          link: "",
          github_link: "",
        };
      }

      // Pro users: keep links
      return {
        title: p.title || "",
        description: p.description || "",
        tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
        link: p.link || "",
        github_link: p.github_link || "",
      };
    });

    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, ...importedProjects],
    }));

    if (user?.subscription_plan === "free") {
      toast.success(`Imported ${importedProjects.length} projects`);
    } else {
      toast.success(`Imported ${importedProjects.length} projects`);
    }
  } catch (error) {
    toast.error(error.response?.data?.detail || "Failed to import GitHub repos");
  } finally {
    setGithubLoading(false);
  }
};

 const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setProfileImage(file);
  setPreviewImage(URL.createObjectURL(file));
};


  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "", description: "", tech_stack: [], link: "", github_link: "" },
      ],
    }));
  };

  const updateProject = (index, field, value) => {
    setFormData((prev) => {
      const projects = [...prev.projects];
      projects[index] = { ...projects[index], [field]: value };
      return { ...prev, projects };
    });
  };

  const removeProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };
  
  const addExperience = () => {
  setFormData((prev) => ({
    ...prev,
    experience: [
      ...prev.experience,
      { title: "", company: "", start: "", end: "", description: "" },
    ],
  }));
};

const updateExperience = (index, field, value) => {
  setFormData((prev) => {
    const experience = [...prev.experience];
    experience[index] = { ...experience[index], [field]: value };
    return { ...prev, experience };
  });
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
      ...prev.education,
      { institution: "", degree: "", field: "", start: "", end: "" },
    ],
  }));
};

const updateEducation = (index, field, value) => {
  setFormData((prev) => {
    const education = [...prev.education];
    education[index] = { ...education[index], [field]: value };
    return { ...prev, education };
  });
};

const removeEducation = (index) => {
  setFormData((prev) => ({
    ...prev,
    education: prev.education.filter((_, i) => i !== index),
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const fd = new FormData();

    const payload = {
      ...formData,
      projects: formData.projects.map((p) => ({
        ...p,
        link: normalizeUrl(p.link),
        github_link: normalizeUrl(p.github_link),
      })),
    };

    fd.append("data", JSON.stringify(payload));

    if (profileImage) {
      fd.append("profile_image", profileImage);
    }

    const response = await axios.post(`${API}/portfolios`, fd, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Portfolio created successfully!");
    navigate(`/portfolio/edit/${response.data.portfolio_id}`);
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.detail || "Failed to create portfolio");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />

      {/* Navbar */}
       <nav className="relative z-20 fixed top-0 left-0 right-0 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Crown className="w-6 h-6 text-sky-400" />
            <span style={{ fontFamily: "Outfit" }}>Create Portfolio</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quick Start */}
          <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
  <span className="h-1 w-6 rounded-full bg-sky-400"></span>
  Quick Start
</h2>


            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-sky-500 bg-sky-500/10"
                  : "border-slate-800 hover:border-sky-500/50"
              } ${user?.subscription_plan === "free" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input {...getInputProps()} disabled={user?.subscription_plan === "free"} />
              <Upload className="w-10 h-10 mx-auto mb-4 text-slate-400" />
              <p className="text-sm font-medium text-white mb-1">
                {isDragActive ? "Drop your resume here" : "Drag & drop your resume (PDF)"}
              </p>
              <p className="text-xs text-slate-400">
                {user?.subscription_plan === "free"
                  ? "Pro feature - Upgrade to use AI resume parsing"
                  : resumeLoading
                  ? "Parsing resume... please wait ⏳"
                  : "Or click to browse"}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <Input
                placeholder="GitHub username"
                value={formData.github_username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, github_username: e.target.value }))
                }
                className="bg-slate-950/60 border-slate-800 text-white"
              />
              <Button
                type="button"
                onClick={handleImportGithub}
                disabled={githubLoading}
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800"
              >
                <Github className="w-4 h-4 mr-2" />
                {githubLoading ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
  <span className="h-1 w-6 rounded-full bg-sky-400"></span>
  Basic Information
</h2>


            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Portfolio Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-950/60 border-slate-800 text-white"
                  placeholder="My Professional Portfolio"
                  required
                />
              </div>

              <div>
              <Label className="text-slate-300">Profile Picture</Label>
              
              <Input
                type="file"
                accept="image/*"
                disabled={user?.subscription_plan === "free"}
                onChange={handleImageChange}
                className={`bg-slate-950/60 border-slate-800 text-white ${
                  user?.subscription_plan === "free" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              
              {user?.subscription_plan === "free" && (
                <p className="mt-1 text-xs text-slate-400">
                  🔒 Upgrade to Pro to upload a profile picture
                </p>
              )}
               {user?.subscription_plan === "pro" && (
                <p className="mt-1 text-xs text-sky-400">
                  ✨ Your profile picture will shine in the Creative template
                </p>
              )}
             
              {previewImage && user?.subscription_plan !== "free" && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mt-4 w-32 h-32 object-cover rounded-full border border-slate-700"
                />
              )}
              
              </div>

              <div>
                <Label className="text-slate-300">Role/Title</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="bg-slate-950/60 border-slate-800 text-white"
                  placeholder="Full-Stack Developer"
                />
              </div>

              <div>
                <Label className="text-slate-300">Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="bg-slate-950/60 border-slate-800 text-white"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
  <span className="h-1 w-6 rounded-full bg-sky-400"></span>
  Skills
</h2>
<p className="text-sm text-slate-400 mb-4">Add what skills u are good at</p>



            <div className="flex gap-2 mb-4">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="bg-slate-950/60 border-slate-800 text-white"
                placeholder="Add a skill"
              />
              <Button type="button" onClick={addSkill} size="sm" className="bg-sky-500 hover:bg-sky-400 text-black">
                <Plus className="w-4 h-4" />Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-800 text-slate-200 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
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
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
  <span className="h-1 w-6 rounded-full bg-sky-400"></span>
  Projects
</h2>

              <Button
                type="button"
                onClick={addProject}
                size="sm"
                className="bg-sky-500 hover:bg-sky-400 text-black"
              >
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>

            <div className="space-y-4">
              {formData.projects.map((project, index) => (
                <div key={index} className="rounded-xl bg-slate-950/60 p-4 space-y-3 
                border border-white/5 
                hover:border-sky-400/30 
                hover:shadow-[0_0_30px_rgba(56,189,248,0.08)]
                transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">
                      Project {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(index)}
                      className="text-slate-300 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Project Title"
                    value={project.title}
                    onChange={(e) => updateProject(index, "title", e.target.value)}
                    className="bg-slate-900/60 border-slate-800 text-white"
                  />
                  <Textarea
                    placeholder="Project Description"
                    value={project.description}
                    onChange={(e) => updateProject(index, "description", e.target.value)}
                    rows={3}
                    className="bg-slate-900/60 border-slate-800 text-white"
                  />
                  <Input
                    placeholder="Tech Stack (comma-separated)"
                    value={project.tech_stack.join(", ")}
                    onChange={(e) =>
                      updateProject(
                        index,
                        "tech_stack",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    className="bg-slate-900/60 border-slate-800 text-white"
                  />
                  {/* GitHub Link */}
<Input
  placeholder={
    user?.subscription_plan === "free"
      ? "🔒 Upgrade to Pro to add GitHub link"
      : "GitHub Link (optional)"
  }
  value={project.github_link}
  onChange={(e) => updateProject(index, "github_link", e.target.value)}
  disabled={user?.subscription_plan === "free"}
  className={`bg-slate-900/60 border-slate-800 text-white ${
    user?.subscription_plan === "free" ? "opacity-50 cursor-not-allowed" : ""
  }`}
/>

{/* Project Link */}
<Input
  placeholder={
    user?.subscription_plan === "free"
      ? "🔒 Upgrade to Pro to add project link"
      : "Project Link (optional)"
  }
  value={project.link}
  onChange={(e) => updateProject(index, "link", e.target.value)}
  disabled={user?.subscription_plan === "free"}
  className={`bg-slate-900/60 border-slate-800 text-white ${
    user?.subscription_plan === "free" ? "opacity-50 cursor-not-allowed" : ""
  }`}
/>

                </div>
              ))}
            </div>
          </div>
          
          {/* Experience */}
<div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
  <span className="h-1 w-6 rounded-full bg-sky-400"></span>
  Experience
</h2>

    <Button
      type="button"
      onClick={addExperience}
      size="sm"
      className="bg-sky-500 hover:bg-sky-400 text-black"
    >
      <Plus className="w-4 h-4 mr-2" /> Add
    </Button>
  </div>

  <div className="space-y-4">
    {formData.experience.map((exp, index) => (
      <div key={index} className="rounded-xl bg-slate-950/60 p-4 space-y-3 
                border border-white/5 
                hover:border-sky-400/30 
                hover:shadow-[0_0_30px_rgba(56,189,248,0.08)]
                transition-all">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Role"
            value={exp.title}
            onChange={(e) => updateExperience(index, "title", e.target.value)}
            className="bg-slate-900/60 border-slate-800 text-white"
          />
          <Input
            placeholder="Company"
            value={exp.company}
            onChange={(e) => updateExperience(index, "company", e.target.value)}
            className="bg-slate-900/60 border-slate-800 text-white"
          />
        </div>

          <Input
            placeholder="Duration (e.g. In years)"
            value={exp.duration}
            onChange={(e) => updateExperience(index, "duration", e.target.value)}
            className="bg-slate-900/60 border-slate-800 text-white"
          />

        <Textarea
          placeholder="Description..."
          value={exp.description}
          onChange={(e) => updateExperience(index, "description", e.target.value)}
          rows={3}
          className="bg-slate-900/60 border-slate-800 text-white"
        />
        </div>
         ))}
        </div>
        </div>

        {/* Education */}
<div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
  <span className="h-1 w-6 rounded-full bg-sky-400"></span>
  Education
</h2>

    <Button
      type="button"
      onClick={addEducation}
      size="sm"
      className="bg-sky-500 hover:bg-sky-400 text-black"
    >
      <Plus className="w-4 h-4 mr-2" /> Add
    </Button>
  </div>

  <div className="space-y-4">
    {formData.education.map((edu, index) => (
      <div key={index} className="rounded-xl bg-slate-950/60 p-4 space-y-3 
                border border-white/5 
                hover:border-sky-400/30 
                hover:shadow-[0_0_30px_rgba(56,189,248,0.08)]
                transition-all">
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
          placeholder="University / Institution"
          value={edu.institution}
          onChange={(e) => updateEducation(index, "institution", e.target.value)}
          className="bg-slate-900/60 border-slate-800 text-white"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => updateEducation(index, "degree", e.target.value)}
            className="bg-slate-900/60 border-slate-800 text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <Input
            placeholder="Year of Graduation"
            value={edu.year}
            onChange={(e) => updateEducation(index, "year", e.target.value)}
            className="bg-slate-900/60 border-slate-800 text-white"
          />
        </div>
        </div>
        ))}
        </div>
        </div>


          {/* Template */}
          <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "Outfit" }}>
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
                  } ${template !== "minimal" && user?.subscription_plan === "free" ? "opacity-50" : ""}`}
                  disabled={template !== "minimal" && user?.subscription_plan === "free"}
                >
                  {template}
                  {template !== "minimal" && user?.subscription_plan === "free" && (
                    <span className="block text-xs text-slate-400 mt-1">Pro</span>
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
                  setFormData((prev) => ({ ...prev, theme_color: e.target.value }))
                }
                className="h-12 w-full bg-transparent border-slate-800"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link to="/dashboard" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-700 text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-black font-semibold"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Portfolio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
