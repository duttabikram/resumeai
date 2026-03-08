import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const logs = [
  "Initializing galaxy map...",
  "Scanning star systems...",
  "Loading planetary data...",
  "Calibrating warp engines...",
  "Connecting satellites...",
  "Synchronizing orbit...",
  "Launching navigation AI..."
];

export default function SpaceLoader({ color = "#8b5cf6" }) {

  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState(0);

  useEffect(() => {

    const progressTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + Math.floor(Math.random()*5)+1;
      });
    },120);

    const logTimer = setInterval(() => {
      setLog(l => (l+1)%logs.length);
    },1500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(logTimer);
    };

  },[]);

  return (

    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-[9999] text-white">

      {/* ================= GALAXY BACKGROUND ================= */}

      {[...Array(100)].map((_,i)=>(
        <motion.div
          key={i}
          className="absolute w-[2px] h-[2px] bg-white rounded-full"
          initial={{
            x:Math.random()*window.innerWidth,
            y:Math.random()*window.innerHeight
          }}
          animate={{opacity:[0.3,1,0.3]}}
          transition={{
            duration:2+Math.random()*4,
            repeat:Infinity
          }}
        />
      ))}

      {/* ================= METEOR SHOWERS ================= */}

      {[...Array(8)].map((_,i)=>(
        <motion.div
          key={"meteor"+i}
          className="absolute w-[2px] h-[140px] bg-white opacity-40"
          initial={{
            x:Math.random()*window.innerWidth,
            y:-200
          }}
          animate={{
            x:"+=300",
            y:"+=800",
            opacity:[0,1,0]
          }}
          transition={{
            duration:2,
            delay:Math.random()*6,
            repeat:Infinity
          }}
        />
      ))}

      {/* ================= NEBULA GLOW ================= */}

      <motion.div
        className="absolute w-[900px] h-[900px] rounded-full blur-[220px]"
        style={{background:color}}
        animate={{
          scale:[1,1.3,1],
          opacity:[0.2,0.4,0.2]
        }}
        transition={{duration:8,repeat:Infinity}}
      />

      {/* ================= PLANET CORE ================= */}

      <motion.div
        className="absolute w-[120px] h-[120px] rounded-full"
        style={{
          background:`radial-gradient(circle, ${color}, black)`
        }}
        animate={{rotate:360}}
        transition={{duration:20,repeat:Infinity,ease:"linear"}}
      />

      {/* ================= ORBIT RINGS ================= */}

      <motion.div
        className="absolute w-[300px] h-[300px] border rounded-full opacity-20"
        style={{borderColor:color}}
        animate={{rotate:360}}
        transition={{duration:40,repeat:Infinity,ease:"linear"}}
      />

      <motion.div
        className="absolute w-[420px] h-[420px] border rounded-full opacity-10"
        style={{borderColor:color}}
        animate={{rotate:-360}}
        transition={{duration:60,repeat:Infinity,ease:"linear"}}
      />

      {/* ================= ORBITING SATELLITES ================= */}

      {[...Array(4)].map((_,i)=>(
        <motion.div
          key={"sat"+i}
          className="absolute w-3 h-3 rounded-full"
          style={{background:color}}
          animate={{
            rotate:360
          }}
          transition={{
            duration:8+i*4,
            repeat:Infinity,
            ease:"linear"
          }}
        />
      ))}

      {/* ================= RADAR SCAN ================= */}

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background:`conic-gradient(${color}33, transparent)`
        }}
        animate={{rotate:360}}
        transition={{duration:6,repeat:Infinity,ease:"linear"}}
      />

      {/* ================= UI PANEL ================= */}

      <div className="relative w-[420px] text-center">

        <p className="text-slate-400 mb-6 text-xs tracking-[6px] font-mono">
          GALACTIC NAV SYSTEM
        </p>

        <div className="flex justify-between text-sm mb-2 text-slate-300 font-mono">
          <span>Loading Experience</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full h-[6px] bg-slate-800 rounded-full overflow-hidden">

          <motion.div
            className="h-full"
            style={{
              background:`linear-gradient(90deg, ${color}, #38bdf8)`
            }}
            animate={{width:`${progress}%`}}
          />

        </div>

        <motion.p
          key={log}
          className="mt-8 text-xs font-mono tracking-[3px] text-slate-400"
          initial={{opacity:0,y:10}}
          animate={{opacity:1,y:0}}
        >
          {logs[log]}
        </motion.p>

      </div>

    </div>
  );

}