// Fixed-position ocean decorations: layered waves, rising bubbles, and
// bobbing sea creatures. Positions are hardcoded (not random) so server and
// client render identically.

const BUBBLES = [
  { left: "6%", size: 18, duration: 9, delay: 0 },
  { left: "14%", size: 10, duration: 12, delay: 3 },
  { left: "24%", size: 26, duration: 10, delay: 6 },
  { left: "38%", size: 12, duration: 13, delay: 1 },
  { left: "52%", size: 20, duration: 8, delay: 4 },
  { left: "63%", size: 14, duration: 11, delay: 7 },
  { left: "74%", size: 24, duration: 9, delay: 2 },
  { left: "85%", size: 11, duration: 12, delay: 5 },
  { left: "93%", size: 17, duration: 10, delay: 8 },
];

const CREATURES = [
  { emoji: "🐙", top: "8%", left: "5%", size: "2.6rem", delay: "0s" },
  { emoji: "🐠", top: "16%", right: "7%", size: "2.2rem", delay: "1.2s" },
  { emoji: "🐢", bottom: "22%", left: "6%", size: "2.4rem", delay: "0.6s" },
  { emoji: "🦀", bottom: "16%", right: "8%", size: "2.1rem", delay: "1.8s" },
  { emoji: "🐳", top: "42%", left: "2%", size: "2.8rem", delay: "2.4s" },
  { emoji: "🪼", top: "38%", right: "3%", size: "2.3rem", delay: "0.9s" },
];

export default function OceanDecor() {
  return (
    <>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
      {CREATURES.map((c, i) => (
        <span
          key={i}
          className="creature"
          style={{
            top: c.top,
            bottom: c.bottom,
            left: c.left,
            right: c.right,
            fontSize: c.size,
            animationDelay: c.delay,
          }}
        >
          {c.emoji}
        </span>
      ))}
      <div className="waves">
        <svg viewBox="0 0 1440 110" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,60 C240,110 480,10 720,50 C960,90 1200,20 1440,60 L1440,110 L0,110 Z"
            fill="rgba(224,242,254,0.35)"
          />
          <path
            d="M0,80 C240,40 480,110 720,75 C960,40 1200,100 1440,70 L1440,110 L0,110 Z"
            fill="rgba(3,105,161,0.55)"
          />
        </svg>
      </div>
    </>
  );
}
