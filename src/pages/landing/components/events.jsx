import { useRef } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { EVENTS } from "../landingdata";
import Reveal from "./reveal";
import SectionHeading from "./sectionheading";

export default function Events() {
  const rail = useRef(null);
  const scroll = (dir) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * Math.min(360, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id="events" className="scroll-mt-20 bg-cream-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <SectionHeading
              align="left"
              tag="Festivals & Fairs"
              title="Sacred events at Ambaji"
              subtitle="Plan your visit around the festivals. Exact dates are announced by the temple each year."
            />
          </Reveal>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} aria-label="Previous events" className="rounded-full border border-gray-300 bg-white p-2.5 text-temple-900 transition-colors hover:border-brand hover:text-brand">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scroll(1)} aria-label="Next events" className="rounded-full border border-gray-300 bg-white p-2.5 text-temple-900 transition-colors hover:border-brand hover:text-brand">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={rail}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {EVENTS.map((e) => (
            <article
              key={e.title}
              className="group relative h-[22rem] w-[78%] flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-temple-800 sm:w-[46%] lg:w-[31.5%]"
            >
              <img
                src={e.img}
                alt={e.title}
                loading="lazy"
                style={{ objectPosition: e.pos }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-temple-950 via-temple-950/50 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-temple-950">
                  <CalendarDays className="h-3.5 w-3.5" /> {e.period}
                </span>
                <h3 className="font-display mt-3 text-lg font-semibold tracking-wide">{e.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">{e.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
