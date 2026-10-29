export default function SectionHeading({ tag, title, subtitle, dark = false, align = "center" }) {
  const center = align === "center";
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl`}>
      {tag && (
        <span
          className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
            dark ? "bg-white/10 text-gold-soft" : "bg-brand/10 text-brand-dark"
          }`}
        >
          {tag}
        </span>
      )}
      <h2
        className={`font-display mt-4 text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase leading-tight tracking-wide ${
          dark ? "text-white" : "text-temple-900"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-sm sm:text-base leading-relaxed ${dark ? "text-white/70" : "text-gray-600"}`}>{subtitle}</p>
      )}
    </div>
  );
}
