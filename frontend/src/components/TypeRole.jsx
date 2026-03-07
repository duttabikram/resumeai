import { useState, useEffect } from "react";

export default function TypeRole({ text }) {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 60); // typing speed

      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}