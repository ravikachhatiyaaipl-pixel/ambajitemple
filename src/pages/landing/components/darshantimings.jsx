import { Clock, Flame, Lock, Moon, Sun, Sunrise, Utensils } from "lucide-react";
import useTempleClock from "../usetempleclock";
import { TIMINGS, TIMING_THEMES, format12, getNextAarti } from "../landingdata";
import Reveal from "./reveal";

const ICONS = { sunrise: Sunrise, sun: Sun, food: Utensils, flame: Flame, moon: Moon, lock: Lock, clock: Clock };

const todayLabel = () =>
  new Date().toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function DarshanTimings() {
  const { minutes } = useTempleClock();
  const nextId = getNextAarti(minutes).item.id;

  return (
    <section id="timings" className="scroll-mt-20 bg-cream-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-sm font-semibold text-brand-dark">Darshan timings</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-wide text-temple-900 sm:text-3xl lg:text-4xl">
            {todayLabel()}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Timings may shift slightly during festivals — check this schedule before you travel.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TIMINGS.map((t, i) => {
            const Icon = ICONS[t.icon] || Clock;
            const isNext = t.id === nextId;
            return (
              <Reveal key={t.id} delay={i * 60}>
                <div
                  className={`relative h-full min-h-[10.5rem] overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg ${
                    TIMING_THEMES[t.id] || "from-temple-700 to-temple-900"
                  } ${isNext ? "ring-4 ring-gold/70" : ""}`}
                >
                  <Icon className="absolute -right-4 -top-4 h-28 w-28 text-white/15" strokeWidth={1.25} />
                  {isNext && (
                    <span className="absolute right-4 top-4 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-brand-dark">
                      Next
                    </span>
                  )}
                  <h3 className="font-display relative text-lg font-semibold tracking-wide">{t.title}</h3>
                  <p className="relative mt-1 text-sm text-white/80">{t.note}</p>
                  <p className="relative mt-5 text-2xl font-semibold tabular-nums">{format12(t.time)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
