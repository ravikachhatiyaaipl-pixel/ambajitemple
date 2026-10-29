import { Gem, Landmark, MapPin, Mountain } from "lucide-react";
import { ABOUT_FACTS, ABOUT_POINTS } from "../landingdata";
import Reveal from "./reveal";
import SectionHeading from "./sectionheading";

const ICONS = { landmark: Landmark, mountain: Mountain, gem: Gem, pin: MapPin };

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 bg-cream py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            align="left"
            tag="About the Temple"
            title="A sanctuary of devotion, standing for over a thousand years"
          />
          <p className="mt-6 text-sm leading-relaxed text-gray-600 sm:text-base">
            Shree Ambaji Temple is revered as the Adi Shakti Peeth — the primal seat of the Divine Mother. Devotees travel
            from across India and abroad to seek the blessings of Maa Amba, whose grace is said to remove obstacles and
            fulfil sincere wishes. The temple&apos;s daily rhythm of aarti, seva and prasad continues a tradition passed
            down through generations.
          </p>

          <div className="mt-8 space-y-6 border-t border-brand/20 pt-8">
            {ABOUT_POINTS.map((p) => {
              const Icon = ICONS[p.icon] || Landmark;
              return (
                <div key={p.title} className="flex gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-temple-900 sm:text-base">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{p.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-3xl bg-temple-800 shadow-2xl shadow-temple-900/30">
            <img src="/Golden Shikhara.png" alt="Golden shikhara of Ambaji temple" className="h-56 w-full object-cover object-[70%_25%] sm:h-72" />
            <div className="grid grid-cols-2 gap-3 p-5 sm:p-6">
              {ABOUT_FACTS.map((f) => (
                <div key={f.label} className="rounded-xl bg-white/[0.07] p-4">
                  <p className="text-[11px] uppercase tracking-wider text-white/50">{f.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
