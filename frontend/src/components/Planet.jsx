import { motion } from "framer-motion";

export default function Planet({ color }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      className="fixed top-1/2 -translate-y-1/2 right-[-220px] w-[500px] h-[500px] rounded-full pointer-events-none"
      style={{
        background: `
radial-gradient(circle at 30% 30%, ${color}, #050505 70%),
repeating-linear-gradient(
  45deg,
  rgba(255,255,255,0.05) 0px,
  rgba(255,255,255,0.05) 6px,
  transparent 6px,
  transparent 14px
)
`,
        boxShadow: `
          0 0 200px ${color}55,
          inset -40px -40px 80px rgba(0,0,0,0.6),
          inset 40px 40px 80px rgba(255,255,255,0.05)
        `
      }}
    />
  );
}