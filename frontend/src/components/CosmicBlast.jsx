import { motion } from "framer-motion";

const CosmicBlast = ({ color }) => {
  const particles = 28;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[200]">

      {/* Flash */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px]"
        style={{ background: color }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 1 }}
      />

      {/* Particles */}
      {[...Array(particles)].map((_, i) => {
        const angle = (i / particles) * Math.PI * 2;
        const distance = 350;

        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ background: color }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0
            }}
            transition={{ duration: 1 }}
          />
        );
      })}
    </div>
  );
};

export default CosmicBlast;