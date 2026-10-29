import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "../landingdata";
import Reveal from "./reveal";
import SectionHeading from "./sectionheading";

const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function Testimonials() {
  return (
    <section>
      {/* <div className="mx-auto max-w-7xl px-5 sm:px-8">
        className="bg-cream py-20 sm:py-28"
        <Reveal>
          <SectionHeading tag="Devotee Experiences" title="Shared with devotion, from across the world" />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <figure className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6">
                <Quote className="h-6 w-6 text-brand/40" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-gray-700">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand-dark">
                      {initials(t.name)}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold text-temple-900">{t.name}</span>
                      <span className="block text-xs text-gray-500">{t.place}</span>
                    </span>
                  </span>
                  <span className="flex" aria-label="5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div> */}
    </section>
  );
}
