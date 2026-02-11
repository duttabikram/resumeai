import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/* ---------------- Animations ---------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

const cardHover = {
  whileHover: { y: -6, scale: 1.02 },
  transition: { type: "spring", stiffness: 200, damping: 15 },
};

const splitText = (text) =>
  text.split("").map((char, i) => (
    <motion.span
      key={i}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: i * 0.03, duration: 0.6, ease: "easeOut" }}
      className="inline-block"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  ));


/* ---------------- Sections ---------------- */


/* ---------------- Main ---------------- */
export default function PublicPortfolio() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

const { scrollYProgress } = useScroll();
const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.85]);
const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

// Mouse-follow glow
const mouseX = useMotionValue(0);
const mouseY = useMotionValue(0);

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line
  }, [slug]);

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`${API}/public/portfolio/${slug}`);
      setPortfolio(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Portfolio Not Found</h1>
          <p className="text-slate-400">This portfolio does not exist.</p>
        </div>
      </div>
    );
  }

  const Background = () => (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
    </>
  );

  /* ================= MINIMAL ================= */
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
        <p className="text-slate-300 leading-relaxed">
          {portfolio.bio}
        </p>
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

              <div className="flex gap-3">
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
    {portfolio.experience?.length > 0 && (
      <section className="mb-16">
        <h2
          className="text-3xl font-semibold mb-8"
          style={{ fontFamily: "Outfit" }}
        >
          Experience
        </h2>

        <div className="space-y-8">
          {portfolio.experience.map((exp, i) => (
            <div
              key={i}
              className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur"
            >
              <h3
                className="text-xl font-semibold mb-1"
                style={{ fontFamily: "Outfit" }}
              >
                {exp.title}
              </h3>

              <p className="text-slate-400 text-sm mb-3">
                {exp.company} • {exp.duration}
              </p>

              <p className="text-slate-300 leading-relaxed">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Education */}
    {portfolio.education?.length > 0 && (
      <section className="mb-16">
        <h2
          className="text-3xl font-semibold mb-8"
          style={{ fontFamily: "Outfit" }}
        >
          Education
        </h2>

        <div className="space-y-8">
          {portfolio.education.map((edu, i) => (
            <div
              key={i}
              className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur"
            >
              <h3
                className="text-xl font-semibold mb-1"
                style={{ fontFamily: "Outfit" }}
              >
                {edu.degree}
              </h3>

              <p className="text-slate-400 text-sm">
                {edu.institution}
              </p>

              {edu.year && (
                <p className="text-slate-500 text-sm mt-1">
                  {edu.year}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    )}

    <div className="text-center pt-12 text-slate-500 text-sm">
      Built with AI Portfolio Builder
    </div>

  </div>
</div>
    );
  }

  /* ================= MODERN ================= */
  if (portfolio.template === "modern") {
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

              <br />

              <div className="flex gap-3">
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
        <h2
          className="text-4xl font-bold mb-8"
          style={{ fontFamily: "Outfit" }}
        >
          Experience
        </h2>

        <div className="space-y-6">
          {portfolio.experience.map((exp, i) => (
            <div key={i} className="p-8 bg-[#0A0A0B] rounded-2xl">
              <h3 className="text-2xl font-bold">{exp.title}</h3>
              <p className="text-gray-400">
                {exp.company} • {exp.duration}
              </p>
              <p className="text-gray-300 mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {portfolio.education?.length > 0 && (
      <div className="mb-20">
        <h2
          className="text-4xl font-bold mb-8"
          style={{ fontFamily: "Outfit" }}
        >
          Education
        </h2>

        <div className="space-y-6">
          {portfolio.education.map((edu, i) => (
            <div key={i} className="p-8 bg-[#0A0A0B] rounded-2xl">
              <h3 className="text-2xl font-bold">{edu.degree}</h3>
              <p className="text-gray-400">{edu.institution}</p>
              {edu.year && (
                <p className="text-gray-500">{edu.year}</p>
              )}
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

/* ================= CREATIVE (INSANE MODE) ================= */
return (
  <div
    className="relative min-h-screen overflow-hidden text-white bg-black"
    onMouseMove={(e) => {
      mouseX.set(e.clientX - 150);
      mouseY.set(e.clientY - 150);
    }}
  >
    {/* Scroll Progress Bar */}
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 origin-left z-50"
    />

    {/* Mouse Glow */}
    <motion.div
      style={{ x: mouseX, y: mouseY }}
      className="pointer-events-none fixed top-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/20 blur-[120px] z-10"
    />

    {/* Parallax Background */}
    <motion.div
      style={{ y: bgY }}
      className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_60%)]"
    />
    <motion.div
      style={{ y: bgY }}
      className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.35),transparent_60%)]"
    />

    {/* HERO */}
    <motion.section
      style={{ scale: heroScale, opacity: heroOpacity }}
      className="relative z-20 min-h-screen flex flex-col items-center justify-center text-center px-6"
    >
      <h1
        className="text-6xl md:text-8xl font-black tracking-tight mb-6"
        style={{ color: portfolio.theme_color }}
      >
        {splitText(portfolio.name)}
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="text-2xl text-slate-300 mb-10"
      >
        {portfolio.role}
      </motion.p>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-slate-400"
      >
        Scroll ↓
      </motion.div>
    </motion.section>

    {/* CONTENT */}
    <div className="relative z-20 max-w-6xl mx-auto px-6 py-32 space-y-40">

      {/* About */}
      {portfolio.bio && (
        <motion.section
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-8"
        >
          <h2 className="text-5xl font-bold mb-8">About</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {portfolio.bio}
          </p>
        </motion.section>
      )}

      {/* Projects */}
      {portfolio.projects?.length > 0 && (
        <section>
          <h2 className="text-5xl font-bold mb-16 text-center">Projects</h2>

          <div className="grid md:grid-cols-2 gap-12 mb-8">
            {portfolio.projects.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 120, rotateX: 25 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.1 }}
                whileHover={{ rotateY: 15, rotateX: -15, scale: 1.07 }}
                className="relative p-10 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:shadow-[0_0_100px_rgba(99,102,241,0.4)] transform-gpu"
              >
                <h3 className="text-3xl font-bold mb-4">{p.title}</h3>
                <p className="text-slate-400 mb-6">{p.description}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {p.tech_stack?.map((t, j) => (
                    <span
                      key={j}
                      className="text-xs px-3 py-1 bg-white/10 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  {p.github_link && (
                    <a href={p.github_link} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">Code</Button>
                    </a>
                  )}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">Live</Button>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
       {/* ================= EXPERIENCE ================= */}
{portfolio.experience?.length > 0 && (
  <section>
  <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mb-20"
    >
      <h2 className="text-3xl font-bold mb-8">Experience</h2>
      <div className="space-y-6">
        {portfolio.experience.map((exp, i) => (
          <motion.div
            key={i}
            {...cardHover}
            className="rounded-2xl bg-white/5 backdrop-blur p-6 border border-white/10 hover:border-white/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]"
          >
            <h3 className="text-xl font-semibold">{exp.title}</h3>
            <p className="text-slate-400 text-sm mb-2">
              {exp.company} • {exp.duration}
            </p>
            <p className="text-slate-300">{exp.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
    </section>
)}

{/* ================= EDUCATION ================= */}
{portfolio.education?.length > 0 && (
  <section>
  <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mb-20"
    >
      <h2 className="text-3xl font-bold mb-8">Education</h2>
      <div className="space-y-6">
        {portfolio.education.map((edu, i) => (
          <motion.div
            key={i}
            {...cardHover}
            className="rounded-2xl bg-white/5 backdrop-blur p-6 border border-white/10 hover:border-white/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]"
          >
            <h3 className="text-xl font-semibold">{edu.degree}</h3>
            <p className="text-slate-400">{edu.institution}</p>
            {edu.year && <p className="text-slate-500 text-sm">{edu.year}</p>}
          </motion.div>
        ))}
      </div>
    </motion.section>
    </section>
)}
    </div>

    <div className="relative z-20 text-center py-20 text-slate-500">
      Built with AI Portfolio Builder
    </div>
  </div>
);


}
