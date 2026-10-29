import { Link } from "react-router-dom";
import { ArrowRight, Clock, Info, Sparkles, Users } from "lucide-react";
import Mandala from "./mandala";
import useTempleClock from "../usetempleclock";
import { PORTAL_PATH, format12, formatAway, getNextAarti, isTempleOpen } from "../landingdata";

export default function Hero() {
  const { minutes, display } = useTempleClock();
  const open = isTempleOpen(minutes);
  const next = getNextAarti(minutes);

  return (
    <section id="home" className="relative isolate overflow-hidden text-white">
      {/* Background photo + brand overlay */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/Ambaji-Temple.jpg')" }}
      ></div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-temple-950/95 via-temple-900/88 to-brand-dark/70"></div>
      <Mandala className="absolute -right-32 -top-32 -z-10 h-[620px] w-[620px] text-white/[0.06]" />
      <Mandala className="absolute -bottom-40 -left-40 -z-10 h-[520px] w-[520px] text-white/[0.04]" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-28 sm:px-8 lg:grid-cols-2 lg:pb-32 lg:pt-36">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs text-white/85 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            One of the 51 Shakti Peethas of Goddess Amba
          </span>

          <h1 className="font-display mt-6 text-4xl font-semibold uppercase leading-[1.1] tracking-wide sm:text-5xl lg:text-6xl">
            Seek her blessings at <span className="text-gold">Shree Ambaji Temple</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75">
            Plan your darshan, book seva &amp; pooja, and offer your devotion online — from anywhere in the world. A modern
            portal built to serve every devotee of Maa Ambaji with care.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={PORTAL_PATH}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-dark"
            >
              Book Darshan Online <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              <Info className="h-4 w-4" /> Know the Temple
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Users className="h-5 w-5 text-gold" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">1.4 Cr+</span>
                <span className="block text-xs text-white/60">Devotees every year</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Clock className="h-5 w-5 text-gold" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold tabular-nums">{display}</span>
                <span className="block text-xs text-white/60">Live temple time (IST)</span>
              </span>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-white/80">
              <span className={`h-2 w-2 rounded-full ${open ? "bg-emerald-400" : "bg-red-400"}`}></span>
              {open ? "Darshan open now" : "Temple closed now"}
            </span>
          </div>
        </div>

        {/* Photo card + next aarti */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/20 shadow-2xl shadow-black/40">
            <img src="/ambajimata.jpg" alt="Shree Ambaji Mata Temple" className="h-full w-full object-cover object-[center_35%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-temple-950/50 via-transparent to-transparent"></div>
          </div>
          <div className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:right-[-1.5rem] sm:w-60 rounded-xl bg-white p-4 text-temple-900 shadow-xl">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Next Aarti</p>
            <p className="mt-1 text-base font-bold text-temple-900">{next.item.title}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {next.tomorrow ? "Tomorrow" : "Today"}, {format12(next.item.time)} · {formatAway(next.minsAway)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
