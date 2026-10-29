import { Check, X } from "lucide-react";
import { GUIDELINES } from "../landingdata";
import Mandala from "./mandala";
import Reveal from "./reveal";

function Card({ title, items, good }) {
  const Icon = good ? Check : X;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl shadow-temple-900/10">
      <h3 className="text-base font-bold text-temple-900">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((t) => (
          <li key={t} className="flex gap-3 text-sm leading-relaxed text-gray-700">
            <span
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                good ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}
            >
              <Icon className="h-3 w-3" strokeWidth={3} />
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Guidelines() {
  return (
    <section id="guidelines" className="relative isolate scroll-mt-20 overflow-hidden bg-cream py-16 sm:py-24">
      <Mandala className="absolute -left-40 top-1/2 -z-10 h-[560px] w-[560px] -translate-y-1/2 text-temple-900/[0.07]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <Reveal>
          <p className="text-sm font-semibold text-brand-dark">Before you visit</p>
          <h2 className="font-display mt-3 text-2xl font-semibold leading-snug tracking-wide text-temple-900 sm:text-3xl lg:text-4xl">
            Guidelines for devotees
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-temple-800/80 sm:text-base">
            To keep the temple peaceful and safe for everyone, please follow these simple guidelines during your visit.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Card title="Do's" items={GUIDELINES.dos} good />
            <Card title="Don'ts" items={GUIDELINES.donts} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
