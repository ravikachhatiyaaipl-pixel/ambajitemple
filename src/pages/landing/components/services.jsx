import { ArrowUpRight, BedDouble, Crown, Flame, HandHeart, Ticket, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { PORTAL_PATH, SERVICES } from "../landingdata";
import Reveal from "./reveal";
import SectionHeading from "./sectionheading";

const ICONS = { ticket: Ticket, crown: Crown, pooja: Flame, donate: HandHeart, food: Utensils, bed: BedDouble };

export default function Services() {
  return (
    <section>
      {/* <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            tag="What You Can Do Here"
            title="Every temple service, one portal"
            subtitle="From booking your darshan to offering seva from home — the Ambaji Temple portal brings every devotee service together."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon] || Ticket;
            return (
              <Reveal key={s.title} delay={i * 60}>
                <Link
                  to={PORTAL_PATH}
                  className="group relative block h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
                >
                  {s.badge && (
                    <span className="absolute right-5 top-5 rounded bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand-dark">
                      {s.badge}
                    </span>
                  )}
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-temple-800 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-5 text-base font-semibold uppercase tracking-wide text-temple-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand transition-all group-hover:gap-2">
                    Get started <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div> */}
    {/* id="services" className="scroll-mt-20 bg-white py-20 sm:py-28" */}
     </section>
  );
}
