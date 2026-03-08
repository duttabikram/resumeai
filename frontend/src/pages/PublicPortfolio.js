import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Instagram } from "lucide-react";
import  ContactForm  from '@/components/ContactForm';
import { Download, Share2, Link2 } from "lucide-react";
import Planet from "@/components/Planet";
import Stars from "@/components/Stars";
import Rocket from "@/components/Rocket";
import TypeRole from "@/components/TypeRole";

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

const crazyCard = {
  hidden: { opacity: 0, y: 40, rotateX: -15, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12,
    },
  },
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

  const footerMessages = [
  "Built with ❤️ and lots of coffee",
  "Crafted with passion by developers",
  "Made with love for the web",
  "Powered by curiosity and creativity",
  "Built late at night with too much caffeine ☕",
  "Designed with passion and clean code",
  "Crafted carefully by developers",
  "Made with pixels, code and coffee",
  "Created with ❤️ by curious developers",
  "Built with creativity and caffeine"
];

const randomFooter =
  footerMessages[Math.floor(Math.random() * footerMessages.length)];

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

const SocialIcon = ({ href, icon, color, duration }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="relative w-14 h-14 flex items-center justify-center"
      whileHover={{ scale: 1.25 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{ background: color }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* rotating icon container */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: duration || 12, repeat: Infinity, ease: "linear" }}
        className="relative w-12 h-12 flex items-center justify-center rounded-full border backdrop-blur-lg"
        style={{
          borderColor: color,
          color: color,
          boxShadow: `0 0 20px ${color}`,
        }}
      >
        {icon}
      </motion.div>
    </motion.a>
  );
};

const handleShare = async () => {
  const shareData = {
    title: portfolio.name + "'s Portfolio",
    text: `Check out ${portfolio.name}'s portfolio`,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      alert("Sharing not supported on this browser");
    }
  } catch (err) {
    console.log("Share cancelled", err);
  }
};

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
  style={{ color: portfolio.theme_color }}
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
  className="text-2xl font-semibold mb-4" style={{ color: portfolio.theme_color }}>Skills </h2>
        <div className="flex flex-wrap gap-3">
          {portfolio.skills.map((skill, index) => (
            <span
              key={index}
              className="px-4 py-2 rounded-full text-sm bg-slate-800 text-slate-200"
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
        <h2 className="text-2xl font-semibold mb-4" style={{ color: portfolio.theme_color }}>Projects</h2>
        <div className="space-y-8">
          {portfolio.projects.map((project, index) => (
            <div
              key={index}
              className="rounded-2xl bg-slate-900/40 p-6 backdrop-blur"
            >
              <h3 className="text-xl font-semibold mb-2"> {project.title} </h3>
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
        <h2 className="text-2xl font-semibold mb-4" style={{ color: portfolio.theme_color }}>  Experience</h2>
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
        <h2 className="text-2xl font-semibold mb-4" style={{ color: portfolio.theme_color }}>Education</h2>
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

  </div>

  
{/* ================= FOOTER ================= */}
<footer className="mt-24 border-t border-slate-800 py-12 text-center bg-slate-950/40 backdrop-blur">

<div className="max-w-4xl mx-auto px-6">

<h3
className="text-lg font-semibold mb-1"
style={{ color: portfolio.theme_color }}
>
{portfolio.name}
</h3>

<p className="text-slate-400 text-sm mb-6">
{portfolio.role}
</p>

<div className="h-px bg-slate-800 w-full mb-6" />

<p className="text-xs text-slate-600 mt-1">
Built with <span style={{ color: portfolio.theme_color }}>AI Portfolio Builder</span>
</p>

<p className="text-xs text-slate-500">
© {new Date().getFullYear()} {portfolio.name}. All rights reserved.
</p>

</div>

</footer>

</div>
    );
  }

  /* ================= MODERN ================= */
  if (portfolio.template === "modern") {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

  {/* SHARE BUTTON */}
  <div className="fixed top-6 right-6 z-50">
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleShare}
      className="p-4 rounded-full shadow-xl"
      style={{ background: portfolio.theme_color }}
    >
      <Share2 size={22} className="text-white" />
    </motion.button>
  </div>
    
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
{/* ================= SOCIAL LINKS ================= */}
{(portfolio.github_url ||
  portfolio.linkedin_url ||
  portfolio.twitter_url ||
  portfolio.instagram_url ||
  portfolio.email) && (
  <div className="flex gap-6 mt-6">

    {portfolio.github_url && (
      <a
        href={portfolio.github_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-all"
      >
        <Github className="w-5 h-5" />
      </a>
    )}

    {portfolio.linkedin_url && (
      <a
        href={portfolio.linkedin_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-all"
      >
        <Linkedin className="w-5 h-5" />
      </a>
    )}

    {portfolio.twitter_url && (
      <a
        href={portfolio.twitter_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-all"
      >
        <Twitter className="w-5 h-5" />
      </a>
    )}

    {portfolio.instagram_url && (
      <a
        href={portfolio.instagram_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-all"
      >
        <Instagram className="w-5 h-5" />
      </a>
    )}

    {portfolio.email && (
      <a
        href={`mailto:${portfolio.email}`}
        className="text-gray-400 hover:text-white transition-all"
      >
        <Mail className="w-5 h-5" />
      </a>
    )}

  </div>
)}
{/* Resume Button */}
{portfolio.resume_url && (
  <a
    href={portfolio.resume_url}
    target="_blank"
    rel="noopener noreferrer"
    download
  >
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.95 }}
      className="mt-8 px-6 py-3 rounded-xl border flex items-center gap-2 text-sm font-medium transition-all duration-300"
      style={{
        borderColor: portfolio.theme_color + "55",
        color: portfolio.theme_color,
        background: portfolio.theme_color + "10",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${portfolio.theme_color}44`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <ExternalLink className="w-4 h-4" />
      View Resume
    </motion.button>
  </a>
)}
    </div>

    {/* Projects */}
    {portfolio.projects?.length > 0 && (
      <div className="mb-20">
        <h2
          className="text-4xl font-bold mb-8"
           style={{ fontFamily: "Outfit", color: portfolio.theme_color }}
        >
          Selected Work
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.projects.map((project, index) => (
            <div
  key={index}
  className="p-8 bg-[#0A0A0B] rounded-2xl transition-all"
  style={{
    gridRow: index % 3 === 0 ? "span 2" : "span 1",
    border: "1px solid " + portfolio.theme_color + "33",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = `0 0 40px ${portfolio.theme_color}55`;
    e.currentTarget.style.transform = "translateY(-6px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.transform = "translateY(0)";
  }}
>

              <h3
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: "Outfit", color: portfolio.theme_color }}
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
                      style={{ borderColor: portfolio.theme_color + "40" }}
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
                      style={{ borderColor: portfolio.theme_color + "40" }}
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
           style={{ fontFamily: "Outfit", color: portfolio.theme_color }}
        >
          Experience
        </h2>

        <div className="space-y-6">
          {portfolio.experience.map((exp, i) => (
            <div
  key={i}
  className="p-8 bg-[#0A0A0B] rounded-2xl transition-all mb-6"
  style={{ border: "1px solid " + portfolio.theme_color + "33" }}
>
              <h3 className="text-2xl font-bold" style={{ color: portfolio.theme_color }}>{exp.title}</h3>
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
        <h2 className="text-4xl font-bold mb-8" style={{ fontFamily: "Outfit", color: portfolio.theme_color }}>Education</h2>

        <div className="space-y-6">
          {portfolio.education.map((edu, i) => (
            <div
  key={i}
  className="p-8 bg-[#0A0A0B] rounded-2xl transition-all mb-6"
  style={{ border: "1px solid " + portfolio.theme_color + "33" }}
>
              <h3 className="text-2xl font-bold" style={{ color: portfolio.theme_color }}>{edu.degree}</h3>
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
             style={{ fontFamily: "Outfit", color: portfolio.theme_color }}
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
             style={{ fontFamily: "Outfit", color: portfolio.theme_color }}
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
    
  </div>
  {/* ================= FOOTER ================= */}
<footer
className="border-t mt-24 py-12 text-center"
style={{ borderColor: portfolio.theme_color + "33" }}
>

<div className="max-w-6xl mx-auto px-6">

{/* Name */}
<h3
className="text-xl font-semibold mb-2"
style={{ color: portfolio.theme_color }}
>
{portfolio.name}
</h3>

<p className="text-gray-400 text-sm mb-6">
{portfolio.role}
</p>

{/* Social Icons */}
<div className="flex justify-center gap-6 mb-8">

{portfolio.github_url && (
<a
href={portfolio.github_url}
target="_blank"
rel="noopener noreferrer"
className="text-gray-500 hover:text-white transition"
>
<Github size={18}/>
</a>
)}

{portfolio.linkedin_url && (
<a
href={portfolio.linkedin_url}
target="_blank"
rel="noopener noreferrer"
className="text-gray-500 hover:text-white transition"
>
<Linkedin size={18}/>
</a>
)}

{portfolio.twitter_url && (
<a
href={portfolio.twitter_url}
target="_blank"
rel="noopener noreferrer"
className="text-gray-500 hover:text-white transition"
>
<Twitter size={18}/>
</a>
)}

{portfolio.instagram_url && (
<a
href={portfolio.instagram_url}
target="_blank"
rel="noopener noreferrer"
className="text-gray-500 hover:text-white transition"
>
<Instagram size={18}/>
</a>
)}

{portfolio.email && (
<a
href={`mailto:${portfolio.email}`}
className="text-gray-500 hover:text-white transition"
>
<Mail size={18}/>
</a>
)}

</div>

{/* Divider */}
<div
className="h-px w-full mb-6"
style={{ background: portfolio.theme_color + "22" }}
/>

<p className="text-xs text-gray-500 mt-1 italic">
{randomFooter}
</p>

<p className="text-xs text-gray-600 mt-1">
© {new Date().getFullYear()} {portfolio.name}. All rights reserved.
</p>

</div>

</footer>
</div>
    );
  }

/* ================= CREATIVE (INSANE MODE) ================= */
return (
<div
  className="relative min-h-[100svh] overflow-hidden text-white bg-black"
  onMouseMove={(e) => {
    mouseX.set(e.clientX - 150);
    mouseY.set(e.clientY - 150);
  }}
>
  <Stars />
  {/* 3D PLANET */}
  <Planet color={portfolio.theme_color} />
  <Rocket color={portfolio.theme_color} />
  

          {/* SHARE BUTTON */}
    <div className="fixed top-6 right-6 z-50">
  <motion.button
    whileHover={{ scale: 1.08, rotate: 8 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleShare}
    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300"
    style={{
      borderColor: portfolio.theme_color + "40",
      background: "rgba(255,255,255,0.04)",
      color: portfolio.theme_color,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = `0 0 18px ${portfolio.theme_color}55`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <Share2 size={18} />
  </motion.button>
</div>
  
      {/* Scroll Progress Bar */}
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 origin-left z-50"
    />

    {/* Mouse Glow */}
    <motion.div
  style={{
    x: mouseX,
    y: mouseY,
    background: portfolio.theme_color
  }}
  className="pointer-events-none fixed top-0 left-0 w-[300px] h-[300px] rounded-full blur-[120px] opacity-30 z-10"
/>


    {/* Parallax Background */}
<div
  className="absolute top-[20%] right-[10%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 z-0"
  style={{ background: portfolio.theme_color }}
/>

    {/* HERO */}
<motion.section
  style={{ scale: heroScale, opacity: heroOpacity }}
  className="relative z-20 min-h-[100svh] flex flex-col items-center justify-center text-center px-6"
>

{portfolio.profile_image && (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className="mb-8 flex justify-center"
  >
    <img
      src={portfolio.profile_image}
      alt="Profile"
      className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full object-cover border-4 shadow-xl"
      style={{
        borderColor: portfolio.theme_color,
        boxShadow: `0 0 25px ${portfolio.theme_color}`
      }}
    />
  </motion.div>
)}

<h1
  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 font-orbitron break-words"
  style={{
    color: portfolio.theme_color,
    textShadow: `0 0 20px ${portfolio.theme_color}`
  }}
>
  {splitText(portfolio.name)}
</h1>

<motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.6, duration: 1 }}
  className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-10 font-mono tracking-wide px-2 max-w-xl"
>
  <TypeRole text={portfolio.role} />
</motion.p>

{/* ================= SOCIAL LINKS ================= */}
{(portfolio.github_url ||
  portfolio.linkedin_url ||
  portfolio.twitter_url ||
  portfolio.instagram_url ||
  portfolio.email) && (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8, duration: 0.8 }}
    className="flex flex-col items-center mt-12"
  >

    {/* Social Icons */}
    <div className="flex flex-wrap justify-center gap-5 md:gap-8 max-w-[320px] md:max-w-none mx-auto">
      {portfolio.github_url && (
        <SocialIcon
          href={portfolio.github_url}
          icon={<Github size={22} />}
          color={portfolio.theme_color}
          duration={16}
        />
      )}

      {portfolio.linkedin_url && (
        <SocialIcon
          href={portfolio.linkedin_url}
          icon={<Linkedin size={22} />}
          color={portfolio.theme_color}
          duration={10}
        />
      )}

      {portfolio.twitter_url && (
        <SocialIcon
          href={portfolio.twitter_url}
          icon={<Twitter size={22} />}
          color={portfolio.theme_color}
          duration={18}
        />
      )}

      {portfolio.instagram_url && (
        <SocialIcon
          href={portfolio.instagram_url}
          icon={<Instagram size={22} />}
          color={portfolio.theme_color}
          duration={14}
        />
      )}

      {portfolio.email && (
        <SocialIcon
          href={`mailto:${portfolio.email}`}
          icon={<Mail size={22} />}
          color={portfolio.theme_color}
          duration={12}
        />
      )}
    </div>
  </motion.div>
)}

{/* ================= ACTION ROW ================= */}
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1, duration: 0.8 }}
  className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 mt-12"
>
  
  {/* Resume Button */}
  {portfolio.resume_url && (
    <a
      href={portfolio.resume_url}
      target="_blank"
      rel="noopener noreferrer"
      download
    >
      <Button
        variant="outline"
        size="lg"
        className="rounded-full px-6 py-3 transition-all duration-300 hover:-translate-y-1 font-space"
        style={{
          borderColor: portfolio.theme_color,
          color: portfolio.theme_color,
        }}
      >
        View Resume
      </Button>
    </a>
  )}

  {/* Scroll Indicator */}
  <motion.div
    animate={{ y: [0, 12, 0] }}
    transition={{ repeat: Infinity, duration: 1.5 }}
    className="text-slate-400 font-space"
  >
    Scroll ↓
  </motion.div>

</motion.div>
    </motion.section>

    {/* CONTENT */}
    <div className="relative z-20 max-w-6xl mx-auto px-6 py-24 sm:py-32 space-y-24 sm:space-y-32 md:space-y-40">

      {/* About */}
      {portfolio.bio && (
        <section className="mb-16">
        <motion.section
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font-orbitron tracking-wider" style={{ color: portfolio.theme_color }}>About</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-space">
            {portfolio.bio}
          </p>
        </motion.section>
        </section>
      )}

{/* ================= SKILLS ================= */}
{portfolio.skills?.length > 0 && (
<section className="mb-16 overflow-hidden">

<h2
className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 font-orbitron tracking-wider"
style={{ color: portfolio.theme_color }}
>
Tech Stack
</h2>

<div className="relative w-full overflow-hidden">

<motion.div
className="flex gap-10 whitespace-nowrap"
animate={{ x: ["0%", "-100%"] }}
transition={{
duration: 25,
repeat: Infinity,
ease: "linear"
}}
>

{[...portfolio.skills, ...portfolio.skills].map((skill, i) => (

<motion.div
  key={i}
  whileHover={{
    scale: 1.2,
    boxShadow: `0 0 30px ${portfolio.theme_color}`
  }}
  className="px-8 py-3 text-lg rounded-full border backdrop-blur transition-all font-space"
  style={{
    borderColor: portfolio.theme_color,
    color: portfolio.theme_color,
    background: "rgba(255,255,255,0.03)"
  }}
>
  {skill}
</motion.div>
))}
</motion.div>
</div>
</section>
)}

      {/* Projects */}
      {portfolio.projects?.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center font-orbitron tracking-wider" style={{ color: portfolio.theme_color }}>Projects</h2>

          <div className="grid md:grid-cols-2 gap-12 mb-8">
            {portfolio.projects.map((p, i) => (
             <motion.div
  key={i}
  initial={{ opacity: 0, y: 120, scale: 0.9 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.9, delay: i * 0.1 }}

  whileHover={{
    scale: 1.08,
    rotateX: 10,
    rotateY: -10,
    boxShadow: `0 0 120px ${portfolio.theme_color}88`
  }}

  className="relative p-10 rounded-3xl bg-white/5 backdrop-blur border transform-gpu transition-all overflow-hidden"
  style={{
    borderColor: portfolio.theme_color + "44"
  }}
>
<motion.div
  className="absolute inset-0 opacity-30"
  style={{
    background: `radial-gradient(circle at top left, ${portfolio.theme_color}55, transparent 60%)`
  }}
  animate={{ opacity: [0.2, 0.5, 0.2] }}
  transition={{ duration: 3, repeat: Infinity }}
/>
<motion.div
  className="absolute inset-0"
  style={{
    background:
      "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.2), transparent 70%)"
  }}
  animate={{ x: ["-100%", "200%"] }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "linear"
  }}
/>
<div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4 font-space" style={{ color: portfolio.theme_color }}>{p.title}</h3>
                <p className="text-slate-400 mb-6 font-space">{p.description}</p>
</div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {p.tech_stack?.map((t, j) => (
                    <span
                      key={j}
                      className="text-xs px-3 py-1 bg-white/10 rounded-full font-space"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
              {p.github_link && (
                <a href={p.github_link} target="_blank" rel="noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border transition-all duration-300 hover:-translate-y-1 hover:bg-transparent font-space"
                    style={{
                      borderColor: portfolio.theme_color,
                      color: portfolio.theme_color,
                    }}
                  >
                    Code
                  </Button>
                </a>
              )}
            
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border transition-all duration-300 hover:-translate-y-1 hover:bg-transparent font-space"
                    style={{
                      borderColor: portfolio.theme_color,
                      color: portfolio.theme_color,
                    }}
                  >
                    Live
                  </Button>
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
<section className="mb-24 relative">

<motion.section
variants={fadeUp}
initial="hidden"
whileInView="show"
viewport={{ once: true }}
>

<h2
className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 text-center font-orbitron tracking-wider"
style={{ color: portfolio.theme_color }}
>
Experience
</h2>

<div className="relative max-w-5xl mx-auto">

{/* Cosmic Timeline Beam */}
<div
className="absolute left-6 top-0 bottom-0 w-[2px]"
style={{
background: `linear-gradient(${portfolio.theme_color}, transparent)`
}}
/>

<div className="space-y-12">

{portfolio.experience.map((exp, i) => (

<motion.div
key={i}

initial={{ opacity: 0, y: 120, scale: 0.9 }}
whileInView={{ opacity: 1, y: 0, scale: 1 }}
viewport={{ once: true }}

animate={{ y: [0, -6, 0] }}

transition={{
duration: 0.9,
delay: i * 0.15,
y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
}}

whileHover={{
scale: 1.08,
rotateX: 10,
rotateY: -10,
boxShadow: `0 0 120px ${portfolio.theme_color}cc`
}}

className="relative ml-12 rounded-2xl bg-white/5 backdrop-blur p-8 border overflow-hidden"
style={{ borderColor: portfolio.theme_color + "66" }}
>

{/* Timeline Node */}
<div
className="absolute -left-[34px] top-8 w-4 h-4 rounded-full"
style={{
background: portfolio.theme_color,
boxShadow: `0 0 20px ${portfolio.theme_color}`
}}
/>

{/* Glow Layer */}
<motion.div
className="absolute inset-0 opacity-30"
style={{
background: `radial-gradient(circle at top left, ${portfolio.theme_color}55, transparent 60%)`
}}
animate={{ opacity: [0.2, 0.5, 0.2] }}
transition={{ duration: 4, repeat: Infinity }}
/>

{/* Scan Light */}
<motion.div
className="absolute inset-0"
style={{
background:
"linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25), transparent 70%)"
}}
animate={{ x: ["-100%", "200%"] }}
transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
/>

<div className="relative z-10">

<h3 className="text-xl font-semibold font-space">
{exp.title}
</h3>

<p className="text-slate-400 text-sm mb-2 font-space">
{exp.company} • {exp.duration}
</p>

<p className="text-slate-300 font-space">
{exp.description}
</p>
</div>
</motion.div>
))}
</div>
</div>
</motion.section>
</section>
)}


{/* ================= EDUCATION ================= */}
{portfolio.education?.length > 0 && (
<section className="mb-24 relative">

<motion.section
variants={fadeUp}
initial="hidden"
whileInView="show"
viewport={{ once: true }}
>

<h2
className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 text-center font-orbitron tracking-wider"
style={{ color: portfolio.theme_color }}
>
Education
</h2>

<div className="relative max-w-5xl mx-auto">

{/* Cosmic Timeline Beam */}
<div
className="absolute left-6 top-0 bottom-0 w-[2px]"
style={{
background: `linear-gradient(${portfolio.theme_color}, transparent)`
}}
/>

<div className="space-y-12">

{portfolio.education.map((edu, i) => (

<motion.div
key={i}

initial={{ opacity: 0, y: 120, scale: 0.9 }}
whileInView={{ opacity: 1, y: 0, scale: 1 }}
viewport={{ once: true }}

animate={{ y: [0, -6, 0] }}

transition={{
duration: 0.9,
delay: i * 0.15,
y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
}}

whileHover={{
scale: 1.08,
rotateX: 10,
rotateY: -10,
boxShadow: `0 0 120px ${portfolio.theme_color}cc`
}}

className="relative ml-12 rounded-2xl bg-white/5 backdrop-blur p-8 border overflow-hidden"
style={{ borderColor: portfolio.theme_color + "66" }}
>

{/* Timeline Node */}
<div
className="absolute -left-[34px] top-8 w-4 h-4 rounded-full"
style={{
background: portfolio.theme_color,
boxShadow: `0 0 20px ${portfolio.theme_color}`
}}
/>

{/* Glow Layer */}
<motion.div
className="absolute inset-0 opacity-30"
style={{
background: `radial-gradient(circle at top left, ${portfolio.theme_color}55, transparent 60%)`
}}
animate={{ opacity: [0.2, 0.5, 0.2] }}
transition={{ duration: 4, repeat: Infinity }}
/>

{/* Scan Light */}
<motion.div
className="absolute inset-0"
style={{
background:
"linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25), transparent 70%)"
}}
animate={{ x: ["-100%", "200%"] }}
transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
/>

<div className="relative z-10">

<h3 className="text-xl font-semibold font-space">
{edu.degree}
</h3>

<p className="text-slate-400 font-space">
{edu.institution}
</p>

{edu.year && (
<p className="text-slate-500 text-sm font-space mt-1">
{edu.year}
</p>
)}

</div>

</motion.div>

))}

</div>
</div>

</motion.section>
</section>
)}

{/* ================= CONTACT ================= */}
<section className="relative z-20 max-w-4xl mx-auto px-6 pb-32">

{/* Cosmic glow core */}
<div className="absolute inset-0 flex justify-center items-center -z-10 pointer-events-none">

<motion.div
className="w-[520px] h-[520px] rounded-full blur-[160px]"
style={{ background: portfolio.theme_color }}
animate={{
scale: [1, 1.2, 1],
opacity: [0.25, 0.45, 0.25]
}}
transition={{
duration: 6,
repeat: Infinity,
ease: "easeInOut"
}}
/>

</div>

{/* Orbit rings */}
<div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">

<motion.div
className="w-[620px] h-[620px] rounded-full border opacity-20"
style={{ borderColor: portfolio.theme_color }}
animate={{ rotate: 360 }}
transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
/>

<motion.div
className="absolute w-[420px] h-[420px] rounded-full border opacity-20"
style={{ borderColor: portfolio.theme_color }}
animate={{ rotate: -360 }}
transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
/>

</div>

<motion.div

initial={{ opacity: 0, y: 120, scale: 0.9 }}
whileInView={{ opacity: 1, y: 0, scale: 1 }}
viewport={{ once: true }}

animate={{ y: [0, -6, 0] }}

transition={{
duration: 0.9,
y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
}}

whileHover={{
scale: 1.03,
rotateX: 6,
rotateY: -6,
boxShadow: `0 0 120px ${portfolio.theme_color}aa`
}}

className="relative bg-white/5 backdrop-blur-2xl border rounded-3xl p-10 md:p-14 shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden"

style={{
borderColor: portfolio.theme_color + "55",
}}
>

{/* cosmic glow inside card */}
<motion.div
className="absolute inset-0 opacity-25"
style={{
background: `radial-gradient(circle at center, ${portfolio.theme_color}55, transparent 70%)`
}}
animate={{ opacity: [0.2, 0.5, 0.2] }}
transition={{ duration: 4, repeat: Infinity }}
/>

{/* scanning beam */}
<motion.div
className="absolute inset-0"
style={{
background:
"linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.2), transparent 70%)"
}}
animate={{ x: ["-100%", "200%"] }}
transition={{
duration: 3,
repeat: Infinity,
ease: "linear"
}}
/>

{/* title */}
<h2
className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 font-space"
style={{ color: portfolio.theme_color }}
>
<TypeRole text="Send Transmission" />
</h2>

{/* form */}
<div className="relative z-10">
<ContactForm slug={portfolio.slug} portfolio={portfolio} />
</div>

</motion.div>

</section>

    </div>

{/* ================= FOOTER ================= */}
<footer
className="relative z-20 border-t pt-16 pb-12 text-center overflow-hidden"
style={{ borderColor: portfolio.theme_color + "33" }}
>
{/* cosmic glow */}
<div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">
  <div
    className="w-[500px] h-[300px] blur-[140px] opacity-20 rounded-full"
    style={{ background: portfolio.theme_color }}
  />
</div>
<motion.div
initial={{ opacity: 0, y: 40 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.8 }}
className="max-w-4xl mx-auto px-6"
>
{/* Name */}
<h3
className="text-3xl font-bold mb-3 font-space"
style={{
color: portfolio.theme_color,
textShadow: `0 0 20px ${portfolio.theme_color}`
}}
>
{portfolio.name}
</h3>
<p className="text-slate-400 mb-8 font-space">
{portfolio.role}
</p>
{/* Social Links */}
<div className="flex justify-center gap-6 mb-10">
{portfolio.github_url && (
<motion.a
href={portfolio.github_url}
target="_blank"
whileHover={{
scale: 1.2,
color: "#fff",
boxShadow: `0 0 20px ${portfolio.theme_color}`
}}
className="text-slate-400 transition"
>
<Github size={22}/>
</motion.a>
)}
{portfolio.linkedin_url && (
<motion.a
href={portfolio.linkedin_url}
target="_blank"
whileHover={{
scale: 1.2,
color: "#fff",
boxShadow: `0 0 20px ${portfolio.theme_color}`
}}
className="text-slate-400 transition"
>
<Linkedin size={22}/>
</motion.a>
)}
{portfolio.twitter_url && (
<motion.a
href={portfolio.twitter_url}
target="_blank"
whileHover={{
scale: 1.2,
color: "#fff",
boxShadow: `0 0 20px ${portfolio.theme_color}`
}}
className="text-slate-400 transition"
>
<Twitter size={22}/>
</motion.a>
)}
{portfolio.instagram_url && (
<motion.a
href={portfolio.instagram_url}
target="_blank"
whileHover={{
scale: 1.2,
color: "#fff",
boxShadow: `0 0 20px ${portfolio.theme_color}`
}}
className="text-slate-400 transition"
>
<Instagram size={22}/>
</motion.a>
)}
{portfolio.email && (
<motion.a
href={`mailto:${portfolio.email}`}
whileHover={{
scale: 1.2,
color: "#fff",
boxShadow: `0 0 20px ${portfolio.theme_color}`
}}
className="text-slate-400 transition"
>
<Mail size={22}/>
</motion.a>
)}
</div>
{/* Energy Divider */}
<div
className="h-[1px] w-full mb-6"
style={{
background: `linear-gradient(90deg, transparent, ${portfolio.theme_color}, transparent)`
}}
/>
{/* Terminal footer message */}
<p className="text-xs text-green-400 font-mono italic">
<TypeRole texts={footerMessages} />
</p>
{/* Copyright */}
<p className="text-xs text-slate-600 mt-2 font-space">
© {new Date().getFullYear()} {portfolio.name}. All rights reserved.
</p>
</motion.div>
</footer>
  </div>
);

}
