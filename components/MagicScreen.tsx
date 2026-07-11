"use client";

import { useEffect, useRef, useState } from "react";

const PHRASES = [
  { emoji: "🪄", text: "Bibbidi-Bobbidi-Boo!" },
  { emoji: "🧚", text: "Sprinkling baby dust…" },
  { emoji: "🐳", text: "Consulting the wise old whale…" },
  { emoji: "🍼", text: "Adding chubby cheeks…" },
  { emoji: "🌊", text: "A splash of ocean magic…" },
  { emoji: "✨", text: "Ta-da! It's on its way!" },
];

const PHRASE_MS = 1500;

const SPARKLES = [
  { top: "8%", left: "10%", delay: "0s" },
  { top: "14%", right: "12%", delay: "0.5s" },
  { top: "42%", left: "5%", delay: "1s" },
  { top: "50%", right: "6%", delay: "0.2s" },
  { bottom: "18%", left: "14%", delay: "0.8s" },
  { bottom: "10%", right: "16%", delay: "1.3s" },
];

interface Props {
  photo: string | null;
  onDone: () => void;
}

export default function MagicScreen({ photo, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < PHRASES.length - 1) {
        setIndex(index + 1);
      } else {
        onDoneRef.current();
      }
    }, PHRASE_MS);
    return () => clearTimeout(timer);
  }, [index]);

  const phrase = PHRASES[index];

  return (
    <div className="card magic-card">
      {SPARKLES.map((s, i) => (
        <span key={i} className="sparkle" style={{ ...s, animationDelay: s.delay }}>
          ✨
        </span>
      ))}
      {photo && (
        <div className="magic-bubble">
          <img src={photo} alt="Your photo, being transformed" />
        </div>
      )}
      <span key={`e${index}`} className="big-emoji magic-emoji">
        {phrase.emoji}
      </span>
      <h2 key={`t${index}`} className="magic-phrase">
        {phrase.text}
      </h2>
      <div className="magic-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
