import { STATS } from "../landingdata";
import Reveal from "./reveal";

export default function TrustStrip() {
  return (
    <section className="border-b border-gray-200 bg-white">
      <Reveal>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-10 sm:px-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-temple-900 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
