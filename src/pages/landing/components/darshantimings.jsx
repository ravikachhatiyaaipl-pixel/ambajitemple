import { Clock, Flame, Lock, Moon, Sun, Sunrise, Utensils } from "lucide-react";
import useTempleClock from "../usetempleclock";
import { TIMINGS, format12, getNextAarti } from "../landingdata";
import Reveal from "./reveal";
import SectionHeading from "./sectionheading";

const ICONS = { sunrise: Sunrise, sun: Sun, food: Utensils, flame: Flame, moon: Moon, lock: Lock, clock: Clock };

export default function DarshanTimings() {
  const { minutes } = useTempleClock();
  const nextId = getNextAarti(minutes).item.id;

  return (
    <section id="timings" className="scroll-mt-20 bg-cream-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            tag="Plan Your Visit"
            title="Darshan & Aarti timings"
            subtitle="The temple follows a consistent daily rhythm of worship. Timings may shift slightly during festivals — check the live schedule before you travel."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TIMINGS.map((t, i) => {
            const Icon = ICONS[t.icon] || Clock;
            const isNext = t.id === nextId;
            return (
              <Reveal key={t.id} delay={i * 60}>
                <div
                  className={`relative h-full rounded-2xl border bg-white p-5 transition-shadow hover:shadow-lg ${
                    isNext ? "border-brand shadow-md shadow-brand/10" : "border-gray-200"
                  }`}
                >
                  {isNext && (
                    <span className="absolute right-4 top-4 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Next
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    {!isNext && <span className="text-lg font-semibold text-temple-900">{format12(t.time)}</span>}
                  </div>
                  {isNext && <p className="mt-3 text-lg font-semibold text-temple-900">{format12(t.time)}</p>}
                  <h3 className={`${isNext ? "mt-1" : "mt-4"} text-base font-semibold text-temple-900`}>{t.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t.note}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
