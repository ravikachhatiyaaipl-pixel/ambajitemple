import { Clock, Landmark, Sparkles, Users } from "lucide-react";
import { STATS } from "../landingdata";
import Mandala from "./mandala";
import Reveal from "./reveal";
import SectionHeading from "./sectionheading";

const ICONS = { landmark: Landmark, users: Users, clock: Clock, sparkles: Sparkles };

export default function TrustStrip() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-16 sm:py-24">
      <Mandala className="absolute left-1/2 top-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 text-brand/[0.05]" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading tag="Spiritual Legacy" title="The living tradition of Ambaji" />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = ICONS[s.icon] || Sparkles;
            const featured = i === 1;
            return (
              <Reveal key={s.label} delay={i * 70}>
                <div
                  className={`h-full rounded-2xl p-5 sm:p-6 ${
                    featured
                      ? "bg-gradient-to-br from-brand to-brand-dark text-white shadow-xl shadow-brand/25 lg:-translate-y-3"
                      : "border border-gray-200 bg-white text-temple-900 shadow-sm"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      featured ? "bg-white/15 text-gold-soft" : "bg-brand/10 text-brand"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-display mt-5 text-3xl font-semibold sm:text-4xl">{s.value}</p>
                  <p className={`mt-1 text-xs sm:text-sm ${featured ? "text-white/80" : "text-gray-500"}`}>{s.label}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
