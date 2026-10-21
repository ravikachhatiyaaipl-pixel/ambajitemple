/** Decorative mandala outline used as a subtle section background. */
export default function Mandala({ className = "" }) {
  const petals = Array.from({ length: 16 });
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1" className={className} aria-hidden="true">
      {[190, 160, 128, 96, 64, 32].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} />
      ))}
      {petals.map((_, i) => (
        <ellipse key={i} cx="200" cy="96" rx="14" ry="48" transform={`rotate(${(360 / petals.length) * i} 200 200)`} />
      ))}
    </svg>
  );
}
