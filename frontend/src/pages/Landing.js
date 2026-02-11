import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Crown,
  Palette,
  Globe,
  Zap,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Content",
      description:
        "Generate professional bios, project descriptions, and about sections with a single click.",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Beautiful Templates",
      description:
        "Choose from stunning templates designed to impress recruiters and clients alike.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Instant Publishing",
      description:
        "Publish your portfolio with one click and share it with a clean, SEO-friendly URL.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Build your complete portfolio in minutes, not hours. AI handles the heavy lifting.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />

      {/* Navbar */}
       <nav className="relative z-20 fixed top-0 left-0 right-0 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-bold text-xl"
          >
            <Crown className="w-6 h-6 text-sky-400" />
            <span style={{ fontFamily: "Outfit" }}>PortfolioAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Pricing
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-sky-500 hover:bg-sky-400 text-black font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center pt-24">
      {/* Background resume image */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <img
          src="/resume_preview.jpg"
          alt="Resume preview background"
          className="max-w-4xl w-full opacity-10 blur-[1px] rotate-[-6deg] select-none pointer-events-none"
        />
      </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-400/10 px-4 py-1 text-sky-400 text-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Portfolio Builder
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "Outfit" }}
          >
            Build Your Dream{" "}
            <span className="block bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              Portfolio in Minutes
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-2xl mx-auto text-slate-400 text-base md:text-lg leading-relaxed">
            Let AI craft your perfect professional portfolio. Enter your details,
            choose a template, and publish — all in under 5 minutes.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-sky-500 hover:bg-sky-400 text-black font-semibold px-8 py-6 rounded-xl"
              >
                Start Building <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 px-8 py-6 rounded-xl"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Subtle divider glow (no line, just light) */}
          <div className="mt-20 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-sky-400/20 blur-3xl" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
              style={{ fontFamily: "Outfit" }}
            >
              Everything You Need
            </h2>
            <p className="text-slate-400 text-base md:text-lg">
              Professional portfolios, powered by AI, built in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl bg-slate-900/40 p-6 backdrop-blur hover:bg-slate-900/60 transition-colors"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-slate-900/40 p-12 backdrop-blur"
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "Outfit" }}
            >
              Ready to Build Your Portfolio?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands of professionals showcasing their work beautifully.
            </p>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-sky-500 hover:bg-sky-400 text-black font-semibold px-8 py-6 rounded-xl"
              >
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>© 2026 PortfolioAI. Built for developers, by developers.</p>
        </div>
      </footer>
    </div>
  );
}
