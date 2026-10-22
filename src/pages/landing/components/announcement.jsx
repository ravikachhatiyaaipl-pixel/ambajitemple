import { Megaphone } from "lucide-react";
import { ANNOUNCEMENT } from "../landingdata";
import Reveal from "./reveal";

export default function Announcement() {
  if (!ANNOUNCEMENT?.title) return null;
  return (
    <section id="announcement" className="scroll-mt-20 bg-cream py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="overflow-hidden rounded-tl-2xl rounded-tr-[4.5rem] rounded-br-2xl rounded-bl-[4.5rem] shadow-2xl shadow-temple-900/25">
            <img
              src={ANNOUNCEMENT.img}
              alt={ANNOUNCEMENT.title}
              loading="lazy"
              style={{ objectPosition: ANNOUNCEMENT.pos }}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={100}>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-dark">
            <Megaphone className="h-3.5 w-3.5" /> {ANNOUNCEMENT.tag}
          </span>
          <h2 className="font-display mt-4 text-2xl font-semibold leading-snug tracking-wide text-temple-900 sm:text-3xl">
            {ANNOUNCEMENT.title}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base">{ANNOUNCEMENT.text}</p>
        </Reveal>
      </div>
    </section>
  );
}
