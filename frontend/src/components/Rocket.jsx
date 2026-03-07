import { motion } from "framer-motion";
import rocket from "../assets/rocket.png";

export default function Rocket() {
  return (
    <motion.div
      initial={{ x: "110vw", y: "90vh" }}   // start bottom-right
      animate={{ x: "-150px", y: "-20vh" }} // move to top-left
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "linear",
      }}
      className="pointer-events-none fixed z-20"
    >
      <motion.img
        src={rocket}
        alt="rocket"
        className="w-24 rotate-[-35deg]"   // tilt rocket toward top-left
        animate={{ y: [0, -4, 0, 4, 0] }}  // slight engine vibration
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}