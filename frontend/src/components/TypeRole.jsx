import { useEffect, useState } from "react";

export default function TypeRole({ text, texts }) {

  const list = texts ? texts : [text];

  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = list[textIndex];

    if (!current) return;

    let speed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.substring(0, displayText.length + 1));

        if (displayText === current) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        setDisplayText(current.substring(0, displayText.length - 1));

        if (displayText === "") {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % list.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);

  }, [displayText, isDeleting, textIndex, list]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}