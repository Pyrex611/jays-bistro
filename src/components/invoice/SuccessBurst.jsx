const CONFETTI = [
  { left: "8%", color: "bg-sun-500", delay: "0s", size: "h-2 w-2" },
  { left: "20%", color: "bg-leaf-300", delay: "0.15s", size: "h-1.5 w-3" },
  { left: "33%", color: "bg-sun-300", delay: "0.05s", size: "h-2 w-2" },
  { left: "46%", color: "bg-cream-50", delay: "0.25s", size: "h-1.5 w-3" },
  { left: "58%", color: "bg-sun-500", delay: "0.1s", size: "h-2 w-2" },
  { left: "70%", color: "bg-leaf-300", delay: "0.3s", size: "h-2 w-2" },
  { left: "82%", color: "bg-sun-300", delay: "0.18s", size: "h-1.5 w-3" },
  { left: "92%", color: "bg-cream-50", delay: "0.08s", size: "h-2 w-2" },
];

/** Animated check ring + a short burst of brand-coloured confetti. Motion is disabled globally for reduced-motion users. */
export default function SuccessBurst() {
  return (
    <div className="relative mx-auto h-28 w-28" aria-hidden="true">
      {CONFETTI.map((c, i) => (
        <span key={i} className={`absolute top-8 animate-confetti rounded-sm opacity-0 ${c.color} ${c.size}`} style={{ left: c.left, animationDelay: c.delay, animationFillMode: "both" }} />
      ))}
      <svg viewBox="0 0 96 96" className="h-28 w-28 animate-pop">
        <circle cx="48" cy="48" r="40" fill="#E4830E" />
        <circle cx="48" cy="48" r="40" fill="none" stroke="#FBF8EE" strokeOpacity="0.35" strokeWidth="4" />
        <path d="M30 49l13 13 24-27" fill="none" stroke="#0C2012" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" className="animate-draw" />
      </svg>
    </div>
  );
}
