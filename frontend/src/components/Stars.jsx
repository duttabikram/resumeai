export default function Stars() {
  const stars = Array.from({ length: 120 });

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map((_, i) => {
        const size = Math.random() * 3;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;

        return (
          <span
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: size,
              height: size,
              top: `${top}%`,
              left: `${left}%`,
              opacity: Math.random(),
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}