import { GALLERY } from "../landingdata";
import Reveal from "./reveal";
import SectionHeading from "./sectionheading";

export default function Gallery() {
  return (
    <section id="gallery" className="scroll-mt-20 bg-cream-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            tag="Glimpses"
            title="A visual journey through the temple"
            subtitle="Impressions of Ambaji's most cherished moments and spaces."
          />
        </Reveal>

        <div className="mt-12 grid auto-rows-[170px] grid-cols-2 gap-4 sm:auto-rows-[210px] lg:grid-cols-4">
          {GALLERY.map((g, i) => (
            <Reveal key={g.title} delay={i * 70} className={g.big ? "col-span-2 row-span-2" : ""}>
              <figure className="group relative h-full w-full overflow-hidden rounded-2xl bg-temple-800">
                <img
                  src={g.img}
                  alt={g.title}
                  loading="lazy"
                  style={{ objectPosition: g.pos }}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-temple-950/80 via-transparent to-transparent"></div>
                <figcaption className="absolute bottom-3 left-4 text-sm font-semibold text-white">{g.title}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
