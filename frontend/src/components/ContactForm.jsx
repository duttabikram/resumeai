import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import TypeRole from "@/components/TypeRole";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";


const API = process.env.REACT_APP_BACKEND_URL + "/api";

function ContactForm({ slug, portfolio }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await axios.post(`${API}/public/contact/${slug}`, form);
      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Name */}
      <div>
        <label className="block mb-2 text-slate-300 font-space">Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Your name"
          className="w-full px-5 py-4 rounded-xl bg-black/40 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-space"
          style={{ borderColor: portfolio.theme_color + "55" }}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block mb-2 text-slate-300 font-space">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="you@example.com"
          className="w-full px-5 py-4 rounded-xl bg-black/40 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-space"
          style={{ borderColor: portfolio.theme_color + "55" }}
        />
      </div>

      {/* Message */}
      <div>
        <label className="block mb-2 text-slate-300 font-space">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="Tell me..."
          className="w-full px-5 py-4 rounded-xl bg-black/40 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none font-space"
          style={{ borderColor: portfolio.theme_color + "55" }}
        />
      </div>

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl font-semibold text-black transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 font-space"
        style={{
          background: `linear-gradient(90deg, ${portfolio.theme_color}, ${portfolio.theme_color}aa)`,
        }}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>

      {success && (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-green-400 text-center mt-4 text-lg font-medium font-space"
  >
    ✅ <TypeRole text="Message sent successfully!" />
  </motion.p>
)}
    </form>
  );
}

export default ContactForm;