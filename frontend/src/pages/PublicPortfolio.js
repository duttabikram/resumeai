import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExperienceSection = ({ experience }) => {
  if (!experience || experience.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-semibold mb-8" style={{ fontFamily: "Outfit" }}>
        Experience
      </h2>
      <div className="space-y-6">
        {experience.map((exp, i) => (
          <div key={i} className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
            <h3 className="text-xl font-semibold">{exp.title}</h3>
            <p className="text-slate-400 text-sm mb-2">{exp.company} • {exp.duration}</p>
            <p className="text-slate-300">{exp.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const EducationSection = ({ education }) => {
  if (!education || education.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-semibold mb-8" style={{ fontFamily: "Outfit" }}>
        Education
      </h2>
      <div className="space-y-6">
        {education.map((edu, i) => (
          <div key={i} className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
            <h3 className="text-xl font-semibold">{edu.degree}</h3>
            <p className="text-slate-400 text-sm">{edu.institution}</p>
            {edu.year && <p className="text-slate-500 text-sm">{edu.year}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};


export default function PublicPortfolio() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API}/public/portfolio/${slug}`);
      setPortfolio(response.data);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-sky-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background text-white">
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "Outfit" }}
          >
            Portfolio Not Found
          </h1>
          <p className="text-slate-400">
            The portfolio you're looking for doesn't exist or has been unpublished.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- SHARED BACKGROUND ---------- */
  const Background = () => (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />
    </>
  );

  /* ---------- MINIMAL TEMPLATE ---------- */
  if (portfolio.template === "minimal") {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-white">
        <Background />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
          {/* Header */}
          <div className="mb-20 text-center">
            <h1
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4"
              style={{ fontFamily: "Outfit", color: portfolio.theme_color }}
            >
              {portfolio.name}
            </h1>
            <p className="text-xl text-slate-400">{portfolio.role}</p>
          </div>

          {/* About */}
          {portfolio.bio && (
            <section className="mb-16 rounded-2xl bg-slate-900/40 p-8 backdrop-blur">
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ fontFamily: "Outfit" }}
              >
                About
              </h2>
              <p className="text-slate-300 leading-relaxed">{portfolio.bio}</p>
            </section>
          )}

          {/* Skills */}
          {portfolio.skills?.length > 0 && (
            <section className="mb-16 rounded-2xl bg-slate-900/40 p-8 backdrop-blur">
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ fontFamily: "Outfit" }}
              >
                Skills
              </h2>
              <div className="flex flex-wrap gap-3">
                {portfolio.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm bg-slate-800 text-slate-200"
                    style={{ borderColor: portfolio.theme_color + "40" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {portfolio.projects?.length > 0 && (
            <section className="mb-16">
              <h2
                className="text-3xl font-semibold mb-8"
                style={{ fontFamily: "Outfit" }}
              >
                Projects
              </h2>
              <div className="space-y-8">
                {portfolio.projects.map((project, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur"
                  >
                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: "Outfit" }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-slate-400 mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack?.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1 bg-slate-800 rounded-full text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                     <br/>
                      <div>
                      {project.github_link && (
                      <a
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-white hover:bg-slate-800 gap-2"
                        >
                          <ExternalLink className="w-4 h-4" /> View Code
                        </Button>
                      </a>
                    )}
                     {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-white hover:bg-slate-800 gap-2"
                        >
                          <ExternalLink className="w-4 h-4" /> View Project
                        </Button>
                      </a>
                    )}
                    </div>

                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Experience */}
<ExperienceSection experience={portfolio.experience} />

{/* Education */}
<EducationSection education={portfolio.education} />


          <div className="text-center pt-12 text-slate-500 text-sm">
            Built with AI Portfolio Builder
          </div>
        </div>
      </div>
    );
  }

  /* ---------- MODERN TEMPLATE ---------- */
  if (portfolio.template === "modern") {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-white">
        <Background />

        {/* Hero */}
        <div
          className="relative z-10 py-24 px-6"
          style={{
            background: `linear-gradient(135deg, ${portfolio.theme_color}22 0%, transparent 60%)`,
          }}
        >
          <div className="max-w-6xl mx-auto">
            <h1
              className="text-5xl md:text-6xl font-extrabold mb-4"
              style={{ fontFamily: "Outfit" }}
            >
              {portfolio.name}
            </h1>
            <p className="text-xl text-slate-400">{portfolio.role}</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left */}
          <div className="space-y-8">
            {portfolio.bio && (
              <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
                <h2
                  className="text-xl font-semibold mb-3"
                  style={{ fontFamily: "Outfit" }}
                >
                  About
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {portfolio.bio}
                </p>
              </div>
            )}

            {portfolio.skills?.length > 0 && (
              <div className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
                <h2
                  className="text-xl font-semibold mb-3"
                  style={{ fontFamily: "Outfit" }}
                >
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {portfolio.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 bg-slate-800 rounded-full text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="md:col-span-2">
            {portfolio.projects?.length > 0 && (
              <div>
                <h2
                  className="text-3xl font-semibold mb-6"
                  style={{ fontFamily: "Outfit" }}
                >
                  Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolio.projects.map((project, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur hover:bg-slate-900/60 transition-colors"
                    >
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {project.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack?.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <br/>
                      <div>
                      {project.github_link && (
                      <a
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-white hover:bg-slate-800 gap-2"
                        >
                          <ExternalLink className="w-4 h-4" /> View Code
                        </Button>
                      </a>
                    )}
                     {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-white hover:bg-slate-800 gap-2"
                        >
                          <ExternalLink className="w-4 h-4" /> View Project
                        </Button>
                      </a>
                    )}
                    </div>
                    </div>
                    
                    
                  ))}
                </div>
              </div>
            )}
            {/* Experience */}
<ExperienceSection experience={portfolio.experience} />

{/* Education */}
<EducationSection education={portfolio.education} />

          </div>
        </div>

        <div className="relative z-10 text-center py-10 text-slate-500 text-sm">
          Built with AI Portfolio Builder
        </div>
      </div>
    );
  }

  /* ---------- CREATIVE TEMPLATE ---------- */
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Hero */}
        <div className="mb-20">
          <div
            className="h-2 w-32 mb-8 rounded-full"
            style={{ background: portfolio.theme_color }}
          />
          <h1
            className="text-6xl md:text-8xl font-black tracking-tighter mb-4"
            style={{ fontFamily: "Outfit" }}
          >
            {portfolio.name}
          </h1>
          <p className="text-2xl text-gray-400">{portfolio.role}</p>
        </div>

        {/* Projects */}
        {portfolio.projects?.length > 0 && (
          <div className="mb-20">
            <h2
              className="text-4xl font-bold mb-8"
              style={{ fontFamily: "Outfit" }}
            >
              Selected Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects.map((project, index) => (
                <div
                  key={index}
                  className="p-8 bg-[#0A0A0B] rounded-2xl hover:bg-[#0F0F12] transition-colors"
                  style={{ gridRow: index % 3 === 0 ? "span 2" : "span 1" }}
                >
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: "Outfit" }}
                  >
                    {project.title}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack?.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1 bg-white/10 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <br/>
                  <div>
                      {project.github_link && (
                      <a
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-white hover:bg-slate-800 gap-2"
                        >
                          <ExternalLink className="w-4 h-4" /> View Code
                        </Button>
                      </a>
                    )}
                     {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-white hover:bg-slate-800 gap-2"
                        >
                          <ExternalLink className="w-4 h-4" /> View Project
                        </Button>
                      </a>
                    )}
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
{portfolio.experience?.length > 0 && (
  <div className="mb-20">
    <h2 className="text-4xl font-bold mb-8" style={{ fontFamily: "Outfit" }}>
      Experience
    </h2>
    <div className="space-y-6">
      {portfolio.experience.map((exp, i) => (
        <div key={i} className="p-8 bg-[#0A0A0B] rounded-2xl">
          <h3 className="text-2xl font-bold">{exp.title}</h3>
          <p className="text-gray-400">{exp.company} • {exp.duration}</p>
          <p className="text-gray-300 mt-2">{exp.description}</p>
        </div>
      ))}
    </div>
  </div>
)}

{/* Education */}
{portfolio.education?.length > 0 && (
  <div className="mb-20">
    <h2 className="text-4xl font-bold mb-8" style={{ fontFamily: "Outfit" }}>
      Education
    </h2>
    <div className="space-y-6">
      {portfolio.education.map((edu, i) => (
        <div key={i} className="p-8 bg-[#0A0A0B] rounded-2xl">
          <h3 className="text-2xl font-bold">{edu.degree}</h3>
          <p className="text-gray-400">{edu.institution}</p>
          {edu.year && <p className="text-gray-500">{edu.year}</p>}
        </div>
      ))}
    </div>
  </div>
)}


        {/* About & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {portfolio.bio && (
            <div>
              <h2
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: "Outfit" }}
              >
                About Me
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                {portfolio.bio}
              </p>
            </div>
          )}

          {portfolio.skills?.length > 0 && (
            <div>
              <h2
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: "Outfit" }}
              >
                Expertise
              </h2>
              <div className="flex flex-wrap gap-3">
                {portfolio.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 border border-white/20 rounded-md"
                    style={{ borderColor: portfolio.theme_color + "40" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center pt-12 text-gray-600 text-sm">
          Built with AI Portfolio Builder
        </div>
      </div>
    </div>
  );
}
